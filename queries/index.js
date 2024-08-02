const sqlite3 = require("sqlite3").verbose();

/**
 * Fetches sentences with different computed domains compared to user-provided domains.
 *
 * @param {sqlite3.Database} db - The SQLite3 database connection object.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of objects containing model and count.
 */
async function getDiffModels(db) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT model, COUNT(*) AS total_count
           FROM sentence_domains
           WHERE computed_domain != user_domain
           GROUP BY model
           HAVING total_count > 1`,
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
}

/**
 * Fetches sentences with the most disparate computed domains.
 *
 * @param {sqlite3.Database} db - The SQLite3 database connection object.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of objects containing value and distinct computed domains count.
 */
async function getDisparateSentences(db) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT value, COUNT(DISTINCT computed_domain) AS distinct_computed_domains
           FROM sentence_domains
           GROUP BY value
           HAVING COUNT(DISTINCT computed_domain) > 1
           ORDER BY distinct_computed_domains DESC`,
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
}

/**
 * Fetches sentences with the same computed domain, but different from the user-submitted domain.
 *
 * @param {sqlite3.Database} db - The SQLite3 database connection object.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of objects containing value, user_domain, count of same computed domain, and models.
 */
async function getSameComputedDomainSentences(db) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
               value,
               user_domain,
               COUNT(*) AS count_same_computed_domain,
               GROUP_CONCAT(DISTINCT model) AS models
           FROM sentence_domains
           WHERE computed_domain != user_domain
           GROUP BY value
           ORDER BY count_same_computed_domain DESC`,
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
}
// Export the functions
module.exports = {
  getDiffModels,
  getDisparateSentences,
  getSameComputedDomainSentences,
};
