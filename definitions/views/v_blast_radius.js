publish("v_blast_radius", {
  type: "view",
  description: "Host to service to application chains, so you can see what a vulnerable host exposes"
}).query(ctx => `
  SELECT
    h.source_id AS host_id,
    h.target_id AS service_id,
    s.target_id AS application_id
  FROM ${ctx.ref("v_edges")} h
  LEFT JOIN ${ctx.ref("v_edges")} s
    ON s.source_type = 'SERVICE' AND s.source_id = h.target_id
  WHERE h.source_type = 'HOST'
`);