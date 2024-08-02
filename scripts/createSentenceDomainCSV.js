const fs = require("fs");
const outputFilePath = "./data/sentences_with_domain.csv";

/**
 * Main function that reads the validated_sentences.tsv file from a common voice dataset release
 * and creates a new CSV file that contains sentences and its domain.
 */
const createSentenceDomainCSV = (
  filePath = "./data/validated_sentences.tsv",
  outputFilePath = "./data/sentences_with_domain.csv"
) => {
  fs.readFile(filePath, { encoding: "utf8" }, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    const lines = data.split("\n");
    const processedData = [];

    // Skip the header row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split("\t");
      // Check if the row has enough elements
      if (row.length >= 3) {
        const sentence = row[1].trim(); // Trim whitespace
        const sentenceDomain = row[2].trim(); // Trim whitespace
        // Check if the sentence is not empty
        if (sentence !== "" && sentenceDomain !== "") {
          processedData.push({ sentence, sentenceDomain });
        }
      }
    }

    // Create CSV data from processed records
    const csvData = processedData
      .map((record) => `"${record.sentence}","${record.sentenceDomain}"`)
      .join("\n");

    // Write CSV data to the output file
    fs.writeFile(outputFilePath, csvData, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return;
      }
      console.log("CSV file created successfully!");
    });
  });
};

// if script called direct, run createSentenceDomainCSV otherwise export function

if (require.main === module) {
  createSentenceDomainCSV();
}

export default createSentenceDomainCSV;
