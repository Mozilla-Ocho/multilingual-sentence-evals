/**
 *  Database repository for sentence domain data.
 */
const sqlite3 = require("sqlite3").verbose();

/**
 * Class for interacting with the sentence domain database.
 * @class SentenceDomainRepository
 */
class SentenceDomainRepository {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.initializeDatabase();
  }

  /**
   * Initializes the database.
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    try {
      await this.db.run(`
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
  }

  /**
   * Inserts data into the database.
   * @param {Object} data The data to insert.
   * @param {Date} data.created_at The creation date.
   * @param {string} data.value The sentence value.
   * @param {string} data.computed_domain The computed domain.
   * @param {string} data.userDomain The user-provided domain.
   * @param {string} data.model The model ID.
   * @param {number} data.totalTokens The total number of tokens used.
   * @returns {Promise<void>}
   */
  async insertData(data) {
    try {
      const {
        created_at,
        value,
        computed_domain,
        userDomain,
        model,
        totalTokens,
      } = data;
      await this.db.run(
        `
          INSERT INTO sentence_domains (created_at, value, computed_domain, user_domain, model, total_tokens)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [created_at, value, computed_domain, userDomain, model, totalTokens]
      );

      console.log("Data inserted successfully!", [
        created_at,
        value,
        computed_domain,
        userDomain,
        model,
        totalTokens,
      ]);
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  }

  /**
   * Retrieves a sentence from the database.
   * @param {string} sentence The sentence value.
   * @param {string} model The model ID.
   * @returns {Promise<Object>} A promise that resolves with the retrieved sentence data.
   */
  async getSentence(sentence, model) {
    return new Promise((resolve, reject) => {
      this.db.get(
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
  }

  close() {
    this.db.close();
  }
}

module.exports = SentenceDomainRepository;
