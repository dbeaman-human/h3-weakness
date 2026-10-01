const helpers = require("../../includes/helpers");

const entityConfigs = [
  {
    table: "t_hosts",
    type: "HOST",
    projections: `
      JSON_VALUE(payload, '$.hostname') AS hostname,
      JSON_VALUE(payload, '$.ip_address') AS ip_address
    `
  },
  {
    table: "t_services",
    type: "SERVICE",
    projections: `
      JSON_VALUE(payload, '$.name') AS service_name,
      CAST(JSON_VALUE(payload, '$.port') AS INT64) AS port,
      JSON_VALUE(payload, '$.protocol') AS protocol
    `
  },
  {
    table: "t_applications",
    type: "APPLICATION",
    projections: `
      JSON_VALUE(payload, '$.name') AS application_name,
      JSON_VALUE(payload, '$.version') AS version
    `
  }
];

// Instantiate each dimension through the factory
entityConfigs.forEach(cfg => {
  helpers.createTableEntity(cfg.table, cfg.type, cfg.projections);
});
