const sqlite3 = require("sqlite3").verbose();
const {
  getDiffModels,
  getDisparateSentences,
  getSameComputedDomainSentences,
} = require("../queries/index");
async function main() {
  const db = new sqlite3.Database("cv-sentence.db");

  try {
    // Get data from database queries
    const modelsData = await getDiffModels(db);
    const sentencesData = await getDisparateSentences(db);
    const sameComputedDomainData = await getSameComputedDomainSentences(db);

    // Create markdown tables
    console.log(
      "## Models with the highest accuracy compared to user submitted categories"
    );
    console.log(
      "This table provides the number of sentences a model correctly categorized. The larger the number, the better the model performed."
    );
    console.log(createMarkdownTable(modelsData, ["Model", "Total Count"]));

    console.log("## Sentences with most disagreement of Computed Domains");
    console.log(
      "This table highlights the sentences that have the most disagreement between the models computed domains."
    );
    console.log(
      createMarkdownTable(sentencesData, [
        "Sentence",
        "Distinct Computed Domains",
      ])
    );

    console.log(
      "## Sentences with Same Computed Domain that differs from User Domain"
    );
    console.log(
      "Highlights sentences that models agree on but user disagrees."
    );
    console.log(
      createMarkdownTable(sameComputedDomainData, [
        "Sentence",
        "User Domain",
        "Count Same Computed Domain",
        "Models",
      ])
    );

    //create console.log statments that define the terms
    console.log("## Definitions");
    console.log(
      "1. **Model**: The name of the large language model that was used to compute the domain of the sentence."
    );
    console.log(
      "2. **Total Count**: The total number of sentences that have different computed domains for the model."
    );
    console.log(
      "3. **Computed Domains**: The category that a large language model computed for a specific sentence."
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    db.close();
  }
}

// Function to create a markdown table from data
function createMarkdownTable(data, headers) {
  let table = `| ${headers.join(" | ")} |\n`;
  table += `| ${headers.map(() => "---").join(" | ")} |\n`;

  for (const row of data) {
    table += `| ${Object.values(row).join(" | ")} |\n`;
  }

  return table;
}

main();
