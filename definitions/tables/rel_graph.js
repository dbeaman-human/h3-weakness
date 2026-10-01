
publish("rel_graph", {
  type: "table",
  description: "Dynamic  asset relationships"
}).query(ctx => `
  WITH edge_events AS (
    SELECT
      JSON_VALUE(payload, '$.source_type') AS source_type,
      JSON_VALUE(payload, '$.source_id') AS source_id,
      JSON_VALUE(payload, '$.target_type') AS target_type,
      JSON_VALUE(payload, '$.target_id') AS target_id,
      event_type,
      event_timestamp
    FROM ${ctx.ref("security_events")}
    WHERE event_type IN ('EDGE_LINKED', 'EDGE_UNLINKED')
  ),
  active_edges AS (
    SELECT *
    FROM edge_events
    QUALIFY ROW_NUMBER() OVER (
      PARTITION BY source_id, target_id 
      ORDER BY event_timestamp DESC
    ) = 1
  )
  SELECT
    source_type,
    source_id,
    ARRAY_AGG(STRUCT(target_type, target_id)) AS connected_targets
  FROM active_edges
  WHERE event_type = 'EDGE_LINKED'
  GROUP BY source_type, source_id
`);
