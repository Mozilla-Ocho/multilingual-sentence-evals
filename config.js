/**
 * Configuration file for the application.
 */

const {
  SENTENCE_FILE_PATH,
  FORMULAIC_API_KEY,
  FORMULAIC_API_URL,
  FORMULAIC_FORMULA_ID,
  LLAMAFILE_API_URL,
} = require("dotenv").config({ path: ".env" }).parsed;

module.exports = {
  SENTENCE_FILE_PATH,
  FORMULAIC_API_KEY,
  FORMULAIC_API_URL,
  FORMULAIC_FORMULA_ID,
  LLAMAFILE_API_URL,
};
