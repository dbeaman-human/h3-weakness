// includes/security_helpers.js

/**
 *  an append-only event log.
 * 
 * @param {string} tableName - Target BigQuery table name
 * @param {string} entityType - The entity discriminator ('HOST', 'SERVICE', 'APPLICATION')
 * @param {string} fieldProjections - SQL fragment extracting JSON fields from payload
 * @param {string} sourceName - Source event table declaration
 */
function createTableEntity(tableName, entityType, fieldProjections, sourceName = "security_events") {
  return publish(tableName, {
    type: "table",
    description: `Current active state for ${entityType}`,
    assertions: {
      uniqueKey: ["entity_id"]
    }
  }).query(ctx => `
    SELECT
      entity_id,
      ${fieldProjections},
      event_timestamp AS last_updated_at
    FROM ${ctx.ref(sourceName)}
    WHERE entity_type = '${entityType}'
    QUALIFY ROW_NUMBER() OVER (
      PARTITION BY entity_id 
      ORDER BY event_timestamp DESC
    ) = 1
      AND event_type != '${entityType}_DELETED'
  `);
}

/**
 * Creates an assertion enforcing that exactly one of the target columns is NOT NULL.
 * 
 * @param {string} assertionName - Name of the assertion test
 * @param {string} targetTable - Table to run the assertion against
 * @param {string[]} targetColumns - Array of column names to check for exclusivity
 * @param {string} idColumn - Primary identifier column for row tracking
 */
function createAssertion(assertionName, targetTable, targetColumns, idColumn = "id") {
  const sumExpression = targetColumns
    .map(col => `CASE WHEN ${col} IS NOT NULL THEN 1 ELSE 0 END`)
    .join(" + ");

  return assert(assertionName, {
    description: `Verifies that each row in ${targetTable} connects to exactly one target entity.`
  }).query(ctx => `
    SELECT
      ${idColumn},
      (${sumExpression}) AS target_count
    FROM ${ctx.ref(targetTable)}
    WHERE (${sumExpression}) != 1
  `);
}

module.exports = {
  createTableEntity,
  createAssertion
};
