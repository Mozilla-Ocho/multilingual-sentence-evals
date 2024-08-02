const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const { parse } = require("csv-parse");
const { finished } = require("stream/promises");
// inference and prompt management from formulaic
const { Formulaic } = require("formulaic-node");

require("dotenv").config({
  path: ".env",
});

const {
  SENTENCE_FILE_PATH,
  FORMULAIC_API_KEY,
  FORMULAIC_API_URL,
  FORMULAIC_FORMULA_ID,
} = require("./config");

const SENTENCE_DOMAINS = [
  "agriculture_food",
  "automotive_transport",
  "finance",
  "general",
  "healthcare",
  "history_law_government",
  "language_fundamentals",
  "media_entertainment",
  "nature_environment",
  "news_current_affairs",
  "service_retail",
  "technology_robotics",
];

// Data class for storing sentence data
class SentenceData {
  constructor(value, user_domain) {
    this.value = value;
    this.user_domain = user_domain;
  }
}

// Data class for storing model data
class ModelData {
  constructor(provider, vendor, id, name, config) {
    this.provider = provider;
    this.vendor = vendor;
    this.id = id;
    this.name = name;
    this.config = config;
  }
}

/**
 * Class for handling sentence domain logic
 *
 * @example
 * const sentenceDomainService = new SentenceDomainService(formulaic);
 * const domain = await sentenceDomainService.getSentenceDomain(sentence, model, formulaId);
 * console.log(domain);
 *
 */
class SentenceDomainService {
  /**
   *
   * @param {Formulaic} formulaicClient
   */
  constructor(formulaicClient) {
    this.formulaicClient = formulaicClient;
  }

  async getSentenceDomain(sentence, model, formulaId) {
    try {
      const data = {
        sequence: [
          {
            text: "this is the prompt that'll go to formulaic",
          },
        ],
        variables: [
          {
            name: "domains",
            value: SENTENCE_DOMAINS,
            type: "text",
          },
          {
            name: "sentence",
            value: sentence.value,
            type: "text",
          },
        ],
        models: [model],
      };
      const [response] = await this.formulaicClient.createCompletion(
        formulaId,
        data
      );
      console.log("response", JSON.stringify(response, null, 2));
      return response; // Extract domain from response
    } catch (error) {
      throw error;
    }
  }
}

async function readData(filePath) {
  const records = [];
  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      autoParse: true,
      header: true,
      // Customize error handling to log and skip problematic lines
      error: (err, row, rowIndex) => {
        console.error(`Error at line ${rowIndex + 1}:`, err);
        console.error("Problematic row:", row);
      },
    })
  );

  parser.on("readable", function () {
    let record;
    while ((record = parser.read()) !== null) {
      records.push({
        value: record.sentence,
        user_domain: record.sentence_domain,
      });
    }
  });

  await finished(parser);
  return records;
}

/**
 *
 * @param {sqlite3.Database} db
 * @returns {Promise<void>}
 *
 */
const initializeDatabase = async (db) => {
  try {
    await db.run(`
        CREATE TABLE IF NOT EXISTS sentence_domains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at DATE NOT NULL,
          value TEXT,
          computed_domain TEXT,
          user_domain TEXT,
          model TEXT,
          total_tokens INTEGER
        )
        `);
  } catch (error) {
    console.log("initializeDatabase", error);
  }
};

/**
 *
 * @param {sqlite3.Database} db
 * @param {Object} data
 * @param {Date} data.created_at
 * @param {string} data.value
 * @param {string} data.computed_domain
 * @param {string} data.user_domain
 * @param {string} data.model
 * @param {number} data.total_tokens
 * @returns
 */
const insertData = async (db, data) => {
  try {
    const {
      created_at,
      value,
      computed_domain,
      user_domain,
      model,
      total_tokens,
    } = data;
    const insertedData = await db.run(
      `
          INSERT INTO sentence_domains (created_at, value, computed_domain, user_domain, model, total_tokens)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
      [created_at, value, computed_domain, user_domain, model, total_tokens]
    );

    console.log("Data inserted successfully!", [
      created_at,
      value,
      computed_domain,
      user_domain,
      model,
      total_tokens,
    ]);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

/**
 *
 * @param {sqlite3.Database} db
 * @param {string} sentence
 * @param {string} model
 * @returns {Promise<Object>}
 */
const getSentence = async (db, sentence, model) => {
  return new Promise((resolve, reject) => {
    db.get(
      `
        SELECT * FROM sentence_domains WHERE value = ? AND model = ?
      `,
      [sentence, model],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

const main = async () => {
  const db = new sqlite3.Database("cv-sentence.db");
  await initializeDatabase(db);

  const fileData = await readData(SENTENCE_FILE_PATH);

  const SENTENCES = fileData.map(
    (record) => new SentenceData(record.value, record.user_domain)
  );

  console.log("FORMULAIC_API_URL", FORMULAIC_API_URL);
  const formulaic = new Formulaic(FORMULAIC_API_KEY, {
    baseURL: FORMULAIC_API_URL,
    debug: false,
  });

  const formulaicModels = await formulaic.getModels();

  const models = formulaicModels.map(
    (model) =>
      new ModelData(
        model.provider,
        model.vendor,
        model.id,
        model.name,
        model.config
      )
  );

  const sentenceDomainService = new SentenceDomainService(formulaic);

  const formulaId = FORMULAIC_FORMULA_ID;

  for (const model of models) {
    console.log("model", model);
    for (const sentence of SENTENCES) {
      // check if the sentence already exists in the database
      const existingSentences = await getSentence(db, sentence.value, model.id);
      if (existingSentences) {
        console.log("Sentence/model already exists in the database:");
        continue;
      }

      try {
        const computedDomain = await sentenceDomainService.getSentenceDomain(
          sentence,
          model,
          formulaId
        );

        const computedSentenceData = {
          created_at: Date.now(),
          value: sentence.value,
          computed_domain: computedDomain.chat.messages[1].content,
          user_domain: sentence.user_domain,
          model: model.id,
          total_tokens: computedDomain.usage.total_tokens,
        };

        await insertData(db, computedSentenceData);
      } catch (error) {
        console.error("Error getting sentence domain:", error);
      }
    }
  }

  db.close();
};

main();
