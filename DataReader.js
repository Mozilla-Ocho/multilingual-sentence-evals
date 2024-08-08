/**
 *  Data reader for CSV files.
 */

const fs = require("fs");
const { parse } = require("csv-parse");
const { finished } = require("stream/promises");

/**
 * Reads data from a CSV file.
 * @param {string} filePath The path to the CSV file.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of data objects.
 */
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
      records.push(record);
    }
  });

  await finished(parser);
  return records;
}

module.exports = {
  readData,
};
