const { div, pre, code, text, textarea } = require("@saltcorn/markup/tags");
const { features, getState } = require("@saltcorn/data/db/state");
//const db = require("@saltcorn/data/db");
const { sqlBinOp } = require("@saltcorn/data/plugin-helper");
const sql_name_function_allowed = !!sqlBinOp;

const pgvector = {
  name: "Money",
  sql_name: sql_name_function_allowed
    ? ({ decimal_points }) =>
        `decimal(${16 + decimal_points}, ${+decimal_points})`
    : "vector", //legacy

  fieldviews: {
    show: {
      isEdit: false,
      run: (v) => pre({ class: "wsprewrap" }, code(v)),
    },

    edit: {
      isEdit: true,
      run: (nm, v, attrs, cls) =>
        textarea(
          {
            class: ["form-control", cls],
            name: encodeURIComponent(nm),
            id: `input${encodeURIComponent(nm)}`,
            rows: 10,
          },
          typeof v === "undefined" ? "" : text(ppArray(v)) || ""
        ),
    },
  },
  attributes: [
    {
      label: "Decimal points",
      name: "decimal_points",
      type: "Integer",
      default: 2,
      required: true,
      sublabel:
        "Once set this cannot be changed. Number of fractional decimal points",
    },
  ],
  read: (v, attrs) => {
    switch (typeof v) {
      case "string":
        return +v;
      default:
        return v;
    }
  },
};

module.exports = {
  sc_plugin_api_version: 1,
  types: [pgvector],
  plugin_name: "pgvector",
  /*onLoad() {
    console.log("load");
    db.pool.on("connect", async function (client) {
      // https://github.com/pgvector/pgvector-node/blob/master/src/pg/index.js
      const result = await client.query(
        "SELECT typname, oid, typarray FROM pg_type WHERE typname = $1",
        ["vector"]
      );
      if (result.rowCount < 1) {
        throw new Error("vector type not found in the database");
      }
      const oid = result.rows[0].oid;
      client.setTypeParser(oid, "text", function (value) {
        return JSON.stringify(value);
      });
    });
  },*/
};
