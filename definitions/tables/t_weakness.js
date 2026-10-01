const helpers = require("../../includes/helpers");

publish("t_weaknesses", {
  type: "table",
  description: "Active CVEs mapped to their respective target entities",
  bigquery: {
    partitionBy: "DATE(discovered_at)",
    clusterBy: ["target_type"]
  },
  assertions: {
    uniqueKey: ["weakness_id"]
  }
}).query(ctx => `
  SELECT
    entity_id AS weakness_id,
    JSON_VALUE(payload, '$.cve') AS cve_identifier,
    CAST(JSON_VALUE(payload, '$.severity') AS FLOAT64) AS severity_score,
    JSON_VALUE(payload, '$.target_type') AS target_type,
    
    -- Target pointers
    CASE WHEN JSON_VALUE(payload, '$.target_type') = 'HOST' 
         THEN JSON_VALUE(payload, '$.target_id') END AS host_id,
    CASE WHEN JSON_VALUE(payload, '$.target_type') = 'SERVICE' 
         THEN JSON_VALUE(payload, '$.target_id') END AS service_id,
    CASE WHEN JSON_VALUE(payload, '$.target_type') = 'APPLICATION' 
         THEN JSON_VALUE(payload, '$.target_id') END AS application_id,
         
    event_timestamp AS discovered_at
  FROM ${ctx.ref("security_events")}
  WHERE entity_type = 'WEAKNESS'
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY entity_id 
    ORDER BY event_timestamp DESC
  ) = 1
    AND event_type != 'WEAKNESS_REMEDIATED'
`);

// Call the reusable assertion module
helpers.createAssertion(
  "assert_weakness",
  "t_weaknesses",
  ["host_id", "service_id", "application_id"],
  "weakness_id"
);
