publish("v_edges", {
  type: "view",
  description: "Active edges flattened to one row per link: the junction table behind the many-to-many relationships"
}).query(ctx => `
  SELECT source_type, source_id, t.target_type, t.target_id
  FROM ${ctx.ref("rel_graph")}, UNNEST(connected_targets) AS t
`);
