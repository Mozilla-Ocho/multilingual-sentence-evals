/**
 *  Service for handling sentence domain logic.
 */
const { Formulaic } = require("formulaic-node");
const SentenceDomainRepository = require("./SentenceDomainRepository");
const { FORMULAIC_FORMULA_ID } = require("./config");
const { ModelData, SentenceData } = require("./DataClasses");
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
/**
 * Interface for inference providers.
 * @interface InferenceProvider
 */
class InferenceProvider {
  /**
   * Creates a completion using the provider's API.
   * @param {string} [prompt] The prompt to use for inference.
   * @param {string} model The model ID to use.
   * @param {Object} [options] Additional options for the inference request.
   * @returns {Promise<Object>} A promise that resolves with the inference response.
   */
  createCompletion(prompt, model, options) {
    // Abstract method to be implemented by concrete providers.
  }

  /**
   * Retrieves a list of available models from the provider.
   * @returns {Promise<Array<ModelData>>} A promise that resolves with an array of ModelData objects.
   */
  getModels() {
    // Abstract method to be implemented by concrete providers.
  }
}

/**
 * Implementation of the InferenceProvider interface using Formulaic.
 * @class FormulaicProvider
 * @implements {InferenceProvider}
 */
class FormulaicProvider extends InferenceProvider {
  constructor(apiKey, apiUrl) {
    super();
    this.formulaicClient = new Formulaic(apiKey, { baseURL: apiUrl });
  }
  async createCompletion(prompt, model, options) {
    console.log(
      "-----------------------FormulaicProvider-----------------------------"
    );
    const data = {
      variables: [
        {
          name: "domains",
          value: SENTENCE_DOMAINS,
          type: "text",
        },
        {
          name: "sentence",
          value: prompt,
          type: "text",
        },
      ],
      models: [model],
    };

    console.log("data", data);
    const [response] = await this.formulaicClient.createCompletion(
      FORMULAIC_FORMULA_ID,
      data
    );
    return response;
  }
  /**
   * Retrieves a list of available models from the provider.
   * @returns {Promise<Array<ModelData>>} A promise that resolves with an array of ModelData objects.
   */
  async getModels() {
    const models = await this.formulaicClient.getModels();
    return models.map(
      (model) =>
        new ModelData(
          model.provider,
          model.vendor,
          model.id,
          model.name,
          model.config
        )
    );
  }
}

/**
 * Implementation of the InferenceProvider interface using LlamaFile.
 * @class LlamaFileProvider
 * @implements {InferenceProvider}
 */
class LlamaFileProvider extends InferenceProvider {
  constructor(apiKey, apiUrl) {
    super();
    // ... Initialize LlamaFile client
  }

  async createCompletion(prompt, model, options) {
    // ... Use LlamaFile API
  }

  async getModels() {
    // ... Implement logic to fetch models using LlamaFile's API
  }
}

/**
 * Class for handling sentence domain logic.
 * @class SentenceDomainService
 */
class SentenceDomainService {
  /**
   * @constructor
   * @param {InferenceProvider} inferenceProvider The inference provider to use.
   */
  constructor(inferenceProvider) {
    this.inferenceProvider = inferenceProvider;
    this.sentenceDomainRepository = new SentenceDomainRepository(
      "cv-sentence.db"
    );
  }

  /**
   * Computes the sentence domain using the specified model and inference provider.
   * @param {SentenceData} sentence The sentence to analyze.
   * @param {ModelData} model The model to use for inference.
   * @param {string} [prompt] An optional prompt to use for inference.
   * @returns {Promise<Object>} A promise that resolves with the computed domain.
   */
  async getSentenceDomain(sentence, model, formulaId) {
    if (!sentence?.value) {
      throw new Error("Sentence value is required");
    }
    const response = await this.inferenceProvider.createCompletion(
      sentence.value, // Pass the prompt to the inference provider
      model.id
    );
    console.log("response", response);
    const computedDomain = response.chat.messages[1].content;

    const computedSentenceData = {
      created_at: Date.now(),
      value: sentence.value,
      computed_domain: computedDomain,
      userDomain: sentence.userDomain,
      model: model.id,
      totalTokens: response.usage.total_tokens,
    };
    await this.sentenceDomainRepository.insertData(computedSentenceData);
    return response;
  }
}

module.exports = {
  SentenceDomainService,
  InferenceProvider,
  FormulaicProvider,
  LlamaFileProvider,
};
