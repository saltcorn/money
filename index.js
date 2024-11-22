const { input, text_attr } = require("@saltcorn/markup/tags");
const { features, getState } = require("@saltcorn/data/db/state");
//const db = require("@saltcorn/data/db");
const { sqlBinOp } = require("@saltcorn/data/plugin-helper");

const sql_name_function_allowed = !!sqlBinOp;

const locale = (req) => {
  //console.log(req && req.getLocale ? req.getLocale() : undefined);
  return req && req.getLocale ? req.getLocale() : undefined;
};

const money = {
  name: "Money",
  sql_name: sql_name_function_allowed
    ? ({ decimal_points }) =>
        `decimal(${16 + (decimal_points || 2)}, ${+(decimal_points || 2)})`
    : "decimal(18,2))", //legacy

  fieldviews: {
    show: {
      configFields: (field) => {
        return [
          ...(!field?.attributes?.currency
            ? [
                {
                  type: "String",
                  name: "currency",
                  label: "Currency",
                  sublabel: "Optional. ISO 4217. Example: USD or EUR",
                },
              ]
            : []),
          ...(!field?.attributes?.decimal_points
            ? [
                {
                  label: "Decimal points",
                  name: "decimal_points",
                  type: "Integer",
                  default: 2,
                  required: true,
                  sublabel:
                    "Once set this cannot be changed. Number of fractional decimal points",
                },
              ]
            : []),
          {
            type: "String",
            name: "currencyDisplay",
            label: "Currency display",
            required: true,
            attributes: {
              options: ["symbol", "code", "narrrowSymbol", "name"],
            },
          },
        ];
      },
      isEdit: false,
      run: (v, req, attrs = {}) => {
        const v1 = typeof v === "string" ? +v : v;
        if (typeof v1 === "number") {
          const locale_ = attrs.locale || locale(req);
          return v1.toLocaleString(locale_, {
            style: attrs.currency ? "currency" : "decimal",
            currency: attrs.currency || undefined,
            currencyDisplay: attrs.currencyDisplay || "symbol",

            maximumFractionDigits: attrs.decimal_points,
          });
        } else return "";
      },
    },
    edit: {
      isEdit: true,
      run: (nm, v, attrs, cls, required, field) => {
        const id = `input${text_attr(nm)}`;
        const name = text_attr(nm);
        return input({
          type: attrs?.type || "number",
          inputmode: attrs?.inputmode,
          pattern: attrs?.pattern,
          autocomplete: attrs?.autocomplete,
          class: ["form-control", cls],
          disabled: attrs.disabled,
          readonly: attrs.readonly,
          autofocus: attrs.autofocus,
          "data-fieldname": text_attr(field.name),
          name,
          onChange: attrs.onChange,
          id,
          step: "any",
          required: !!required,
          value: text_attr(v),
        });
      },
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
    {
      type: "String",
      name: "currency",
      label: "Currency",
      sublabel: "Optional. ISO 4217. Example: USD or EUR",
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
  types: [money],
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
