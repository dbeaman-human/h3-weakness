publish("v_open_weaknesses", {
  type: "view",
  description: "Open weaknesses by severity, with the name of whatever they target",
  columns: {
    cve_identifier: "CVE ID",
    severity_score: "CVSS-style score, 0-10",
    target_type: "HOST, SERVICE or APPLICATION",
    target_name: "Hostname, service name or application name"
  }
}).query(ctx => `
  SELECT
    w.cve_identifier,
    w.severity_score,
    w.target_type,
    COALESCE(h.hostname, s.service_name, a.application_name) AS target_name
  FROM ${ctx.ref("t_weaknesses")} w
  LEFT JOIN ${ctx.ref("t_hosts")} h ON h.entity_id = w.host_id
  LEFT JOIN ${ctx.ref("t_services")} s ON s.entity_id = w.service_id
  LEFT JOIN ${ctx.ref("t_applications")} a ON a.entity_id = w.application_id
`);

