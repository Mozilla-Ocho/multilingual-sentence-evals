const {
  SENTENCE_FILE_PATH,
  FORMULAIC_API_KEY,
  FORMULAIC_API_URL,
  FORMULAIC_FORMULA_ID,
  LLAMAFILE_API_KEY,
  LLAMAFILE_API_URL,
} = require("./config");
const { SentenceData, ModelData } = require("./DataClasses");
const { readData } = require("./DataReader");
const SentenceDomainRepository = require("./SentenceDomainRepository");
const {
  SentenceDomainService,
  FormulaicProvider,
  LlamaFileProvider,
} = require("./SentenceService");

const main = async () => {
  const db = new SentenceDomainRepository("cv-sentence.db"); // Pass db path
  // await initializeDatabase(db);

  const fileData = await readData(SENTENCE_FILE_PATH);
  const SENTENCES = fileData.map((record) => {
    if (!record.sentence) {
      throw new Error("Sentence value is required");
    }
    return new SentenceData(record.sentence, record.sentence_domain);
  });
  const formulaicProvider = new FormulaicProvider(
    FORMULAIC_API_KEY,
    FORMULAIC_API_URL
  );
  const llamaFileProvider = new LlamaFileProvider(
    LLAMAFILE_API_KEY,
    LLAMAFILE_API_URL
  );

  const models = await formulaicProvider.getModels();

  const formulaId = FORMULAIC_FORMULA_ID;
  console.log("models", models);
  for (const model of models) {
    const provider = formulaicProvider;

    const sentenceDomainService = new SentenceDomainService(provider);
    for (const sentence of SENTENCES) {
      // check if the sentence already exists in the database
      const existingSentence = await db.getSentence(sentence.value, model.id);
      if (existingSentence) {
        console.log("Sentence/model already exists: ");
        continue;
      }

      try {
        const computedDomain = await sentenceDomainService.getSentenceDomain(
          sentence,
          model,
          formulaId
        );
      } catch (error) {
        console.error("Error getting sentence domain:", error);
      }
    }
  }

  db.close();
};

main();
