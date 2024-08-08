/**
 * Data classes for the application.
 */

/**
 * Class representing sentence data.
 * @class SentenceData
 */
class SentenceData {
  /**
   * @constructor
   * @param {string} value The sentence value.
   * @param {string} userDomain The user-provided domain for the sentence.
   */
  constructor(value, userDomain) {
    this.value = value;
    this.userDomain = userDomain;
  }
}

/**
 * Class representing model data.
 * @class ModelData
 */
class ModelData {
  /**
   * @constructor
   * @param {string} provider The provider of the model.
   * @param {string} vendor The vendor of the model.
   * @param {string} id The model ID.
   * @param {string} name The model name.
   * @param {Object} config The model configuration.
   */
  constructor(provider, vendor, id, name, config) {
    this.provider = provider;
    this.vendor = vendor;
    this.id = id;
    this.name = name;
    this.config = config;
  }
}

module.exports = {
  SentenceData,
  ModelData,
};
