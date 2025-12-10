import {
  Id,
  compileTableSchema
} from "./chunk-KZFLXURY.js";

// src/server/schema.ts
import {
  defineSchema as defineConvexSchema,
  defineTable as defineConvexTable
} from "convex/server";
import { pipe, Record, Schema as Schema2 } from "effect";

// src/server/schemas/SystemFields.ts
import { Schema } from "effect";
var SystemFields = (tableName) => Schema.Struct({
  _id: Id(tableName),
  _creationTime: Schema.Number
});
var extendWithSystemFields = (tableName, schema) => Schema.extend(schema, SystemFields(tableName));

// src/server/schema.ts
var confectTableSchemas = {
  _scheduled_functions: Schema2.Struct({
    name: Schema2.String,
    args: Schema2.Array(Schema2.Any),
    scheduledTime: Schema2.Number,
    completedTime: Schema2.optional(Schema2.Number),
    state: Schema2.Union(
      Schema2.Struct({ kind: Schema2.Literal("pending") }),
      Schema2.Struct({ kind: Schema2.Literal("inProgress") }),
      Schema2.Struct({ kind: Schema2.Literal("success") }),
      Schema2.Struct({
        kind: Schema2.Literal("failed"),
        error: Schema2.String
      }),
      Schema2.Struct({ kind: Schema2.Literal("canceled") })
    )
  }),
  _storage: Schema2.Struct({
    sha256: Schema2.String,
    size: Schema2.Number,
    contentType: Schema2.optional(Schema2.String)
  })
};
var tableSchemasFromConfectSchema = (confectSchema) => ({
  ...Record.map(confectSchema, ({ tableSchema }, tableName) => ({
    withSystemFields: extendWithSystemFields(tableName, tableSchema),
    withoutSystemFields: tableSchema
  })),
  ...Record.map(confectTableSchemas, (tableSchema, tableName) => ({
    withSystemFields: extendWithSystemFields(tableName, tableSchema),
    withoutSystemFields: tableSchema
  }))
});
var ConfectSchemaDefinitionImpl = class {
  confectSchema;
  convexSchemaDefinition;
  tableSchemas;
  constructor(confectSchema) {
    this.confectSchema = confectSchema;
    this.convexSchemaDefinition = pipe(
      confectSchema,
      Record.map(({ tableDefinition }) => tableDefinition),
      defineConvexSchema
    );
    this.tableSchemas = tableSchemasFromConfectSchema(confectSchema);
  }
};
var defineSchema = (confectSchema) => new ConfectSchemaDefinitionImpl(confectSchema);
var ConfectTableDefinitionImpl = class {
  tableSchema;
  tableDefinition;
  constructor(tableSchema, tableValidator) {
    this.tableSchema = tableSchema;
    this.tableDefinition = defineConvexTable(tableValidator);
  }
  index(name, fields) {
    this.tableDefinition = this.tableDefinition.index(name, fields);
    return this;
  }
  searchIndex(name, indexConfig) {
    this.tableDefinition = this.tableDefinition.searchIndex(name, indexConfig);
    return this;
  }
  vectorIndex(name, indexConfig) {
    this.tableDefinition = this.tableDefinition.vectorIndex(name, indexConfig);
    return this;
  }
};
var defineTable = (tableSchema) => {
  const tableValidator = compileTableSchema(tableSchema);
  return new ConfectTableDefinitionImpl(
    tableSchema,
    tableValidator
  );
};
var confectSystemSchema = {
  _scheduled_functions: defineTable(confectTableSchemas._scheduled_functions),
  _storage: defineTable(confectTableSchemas._storage)
};
var confectSystemSchemaDefinition = defineSchema(confectSystemSchema);

export {
  extendWithSystemFields,
  confectTableSchemas,
  defineSchema,
  defineTable,
  confectSystemSchema,
  confectSystemSchemaDefinition
};
//# sourceMappingURL=chunk-WLH6YIZ4.js.map