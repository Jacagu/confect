import * as convex_values from 'convex/values';
import { Validator } from 'convex/values';
import { GenericTableIndexes, GenericTableSearchIndexes, GenericTableVectorIndexes, TableDefinition, SystemFields as SystemFields$1, Expand, IndexTiebreakerField, SearchIndexConfig, VectorIndexConfig, SchemaDefinition, IdField, SystemIndexes } from 'convex/server';
import { Schema } from 'effect';
import { TableSchemaToTableValidator } from './schema-to-validator.cjs';
import 'effect/Types';

/**
 * Produces a schema for Convex system fields.
 */
declare const SystemFields: <TableName extends string>(tableName: TableName) => Schema.Struct<{
    _id: Schema.Schema<convex_values.GenericId<TableName>, convex_values.GenericId<TableName>, never>;
    _creationTime: typeof Schema.Number;
}>;
/**
 * Extend a table schema with Convex system fields at the type level.
 */
type ExtendWithSystemFields<TableName extends string, TableSchema extends Schema.Schema.AnyNoContext> = Schema.extend<TableSchema, ReturnType<typeof SystemFields<TableName>>>;

declare const confectTableSchemas: {
    _scheduled_functions: Schema.Struct<{
        name: typeof Schema.String;
        args: Schema.Array$<typeof Schema.Any>;
        scheduledTime: typeof Schema.Number;
        completedTime: Schema.optional<typeof Schema.Number>;
        state: Schema.Union<[Schema.Struct<{
            kind: Schema.Literal<["pending"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["inProgress"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["success"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["failed"]>;
            error: typeof Schema.String;
        }>, Schema.Struct<{
            kind: Schema.Literal<["canceled"]>;
        }>]>;
    }>;
    _storage: Schema.Struct<{
        sha256: typeof Schema.String;
        size: typeof Schema.Number;
        contentType: Schema.optional<typeof Schema.String>;
    }>;
};
/**
 * A Confect schema is a record of table definitions.
 */
type GenericConfectSchema = Record<any, GenericConfectTableDefinition>;
/**
 * A Confect schema definition tracks the Confect schema, its Convex schema definition, and all of its table schemas.
 */
type GenericConfectSchemaDefinition = ConfectSchemaDefinition<GenericConfectSchema>;
interface ConfectSchemaDefinition<ConfectSchema extends GenericConfectSchema> {
    confectSchema: ConfectSchema;
    convexSchemaDefinition: SchemaDefinition<SchemaDefinitionFromConfectSchemaDefinition<ConfectSchema>, true>;
    tableSchemas: TableSchemasFromConfectSchema<ConfectSchema>;
}
type SchemaDefinitionFromConfectSchemaDefinition<ConfectSchema extends GenericConfectSchema> = Expand<{
    [TableName in keyof ConfectSchema & string]: ConfectSchema[TableName]["tableDefinition"];
}>;
/**
 * Define a Confect schema.
 */
declare const defineSchema: <ConfectSchema extends GenericConfectSchema>(confectSchema: ConfectSchema) => ConfectSchemaDefinition<ConfectSchema>;
type GenericConfectTableDefinition = ConfectTableDefinition<any, any, any, any, any>;
interface ConfectTableDefinition<TableSchema extends Schema.Schema.AnyNoContext, TableValidator extends Validator<any, any, any> = TableSchemaToTableValidator<TableSchema>, Indexes extends GenericTableIndexes = {}, SearchIndexes extends GenericTableSearchIndexes = {}, VectorIndexes extends GenericTableVectorIndexes = {}> {
    tableDefinition: TableDefinition<TableValidator, Indexes, SearchIndexes, VectorIndexes>;
    tableSchema: TableSchema;
    index<IndexName extends string, FirstFieldPath extends ExtractFieldPaths<TableValidator>, RestFieldPaths extends ExtractFieldPaths<TableValidator>[]>(name: IndexName, fields: [FirstFieldPath, ...RestFieldPaths]): ConfectTableDefinition<TableSchema, TableValidator, Expand<Indexes & Record<IndexName, [
        FirstFieldPath,
        ...RestFieldPaths,
        IndexTiebreakerField
    ]>>, SearchIndexes, VectorIndexes>;
    searchIndex<IndexName extends string, SearchField extends ExtractFieldPaths<TableValidator>, FilterFields extends ExtractFieldPaths<TableValidator> = never>(name: IndexName, indexConfig: Expand<SearchIndexConfig<SearchField, FilterFields>>): ConfectTableDefinition<TableSchema, TableValidator, Indexes, Expand<SearchIndexes & Record<IndexName, {
        searchField: SearchField;
        filterFields: FilterFields;
    }>>, VectorIndexes>;
    vectorIndex<IndexName extends string, VectorField extends ExtractFieldPaths<TableValidator>, FilterFields extends ExtractFieldPaths<TableValidator> = never>(name: IndexName, indexConfig: Expand<VectorIndexConfig<VectorField, FilterFields>>): ConfectTableDefinition<TableSchema, TableValidator, Indexes, SearchIndexes, Expand<VectorIndexes & Record<IndexName, {
        vectorField: VectorField;
        dimensions: number;
        filterFields: FilterFields;
    }>>>;
}
type ConfectSchemaFromConfectSchemaDefinition<ConfectSchemaDef extends GenericConfectSchemaDefinition> = ConfectSchemaDef extends ConfectSchemaDefinition<infer ConfectSchema> ? ConfectSchema : never;
/**
 * @ignore
 */
type ConfectDataModelFromConfectSchemaDefinition<ConfectSchemaDef extends GenericConfectSchemaDefinition> = ConfectSchemaDef extends ConfectSchemaDefinition<infer ConfectSchema> ? ConfectDataModelFromConfectSchema<ConfectSchema> : never;
/**
 * Define a Confect table.
 */
declare const defineTable: <TableSchema extends Schema.Schema.AnyNoContext>(tableSchema: TableSchema) => ConfectTableDefinition<TableSchema>;
type TableNamesInConfectSchema<ConfectSchema extends GenericConfectSchema> = keyof ConfectSchema & string;
type TableNamesInConfectSchemaDefinition<ConfectSchemaDefinition extends GenericConfectSchemaDefinition> = TableNamesInConfectSchema<ConfectSchemaDefinition["confectSchema"]>;
/**
 * Produce a Confect data model from a Confect schema.
 */
type ConfectDataModelFromConfectSchema<ConfectSchema extends GenericConfectSchema> = {
    [TableName in keyof ConfectSchema & string]: ConfectSchema[TableName] extends ConfectTableDefinition<infer TableSchema, infer TableValidator, infer Indexes, infer SearchIndexes, infer VectorIndexes> ? TableSchema extends Schema.Schema<any, any> ? {
        confectDocument: ExtractConfectDocument<TableName, TableSchema>;
        encodedConfectDocument: ExtractEncodedConfectDocument<TableName, TableSchema>;
        convexDocument: ExtractDocument<TableName, TableValidator>;
        fieldPaths: keyof IdField<TableName> | ExtractFieldPaths<TableValidator>;
        indexes: Expand<Indexes & SystemIndexes>;
        searchIndexes: SearchIndexes;
        vectorIndexes: VectorIndexes;
    } : never : never;
};
type ExtractConfectDocument<TableName extends string, S extends Schema.Schema<any, any>> = Expand<Readonly<IdField<TableName>> & Readonly<SystemFields$1> & S["Type"]>;
type ExtractEncodedConfectDocument<TableName extends string, S extends Schema.Schema<any, any>> = Expand<Readonly<IdField<TableName>> & Readonly<SystemFields$1> & S["Encoded"]>;
declare const confectSystemSchema: {
    _scheduled_functions: ConfectTableDefinition<Schema.Struct<{
        name: typeof Schema.String;
        args: Schema.Array$<typeof Schema.Any>;
        scheduledTime: typeof Schema.Number;
        completedTime: Schema.optional<typeof Schema.Number>;
        state: Schema.Union<[Schema.Struct<{
            kind: Schema.Literal<["pending"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["inProgress"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["success"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["failed"]>;
            error: typeof Schema.String;
        }>, Schema.Struct<{
            kind: Schema.Literal<["canceled"]>;
        }>]>;
    }>, convex_values.VObject<{
        name: string;
        args: any[];
        scheduledTime: number;
        state: {
            kind: "pending";
        } | {
            kind: "inProgress";
        } | {
            kind: "success";
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        };
        completedTime?: number | undefined;
    }, {
        name: convex_values.VString<string, "required">;
        args: convex_values.VArray<any[], convex_values.VAny<any, "required", string>, "required">;
        scheduledTime: convex_values.VFloat64<number, "required">;
        state: convex_values.VObject<{
            kind: "pending";
        }, {
            kind: convex_values.VLiteral<"pending", "required">;
        }, "required", "kind"> | convex_values.VObject<{
            kind: "inProgress";
        }, {
            kind: convex_values.VLiteral<"inProgress", "required">;
        }, "required", "kind"> | convex_values.VObject<{
            kind: "success";
        }, {
            kind: convex_values.VLiteral<"success", "required">;
        }, "required", "kind"> | convex_values.VObject<{
            kind: "failed";
            error: string;
        }, {
            kind: convex_values.VLiteral<"failed", "required">;
            error: convex_values.VString<string, "required">;
        }, "required", "kind" | "error"> | convex_values.VObject<{
            kind: "canceled";
        }, {
            kind: convex_values.VLiteral<"canceled", "required">;
        }, "required", "kind">;
        completedTime: convex_values.VFloat64<number | undefined, "optional">;
    }, "required", "name" | "args" | "scheduledTime" | "completedTime" | "state" | "state.kind" | "state.error">, {}, {}, {}>;
    _storage: ConfectTableDefinition<Schema.Struct<{
        sha256: typeof Schema.String;
        size: typeof Schema.Number;
        contentType: Schema.optional<typeof Schema.String>;
    }>, convex_values.VObject<{
        sha256: string;
        size: number;
        contentType?: string | undefined;
    }, {
        sha256: convex_values.VString<string, "required">;
        size: convex_values.VFloat64<number, "required">;
        contentType: convex_values.VString<string | undefined, "optional">;
    }, "required", "sha256" | "size" | "contentType">, {}, {}, {}>;
};
declare const confectSystemSchemaDefinition: ConfectSchemaDefinition<{
    _scheduled_functions: ConfectTableDefinition<Schema.Struct<{
        name: typeof Schema.String;
        args: Schema.Array$<typeof Schema.Any>;
        scheduledTime: typeof Schema.Number;
        completedTime: Schema.optional<typeof Schema.Number>;
        state: Schema.Union<[Schema.Struct<{
            kind: Schema.Literal<["pending"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["inProgress"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["success"]>;
        }>, Schema.Struct<{
            kind: Schema.Literal<["failed"]>;
            error: typeof Schema.String;
        }>, Schema.Struct<{
            kind: Schema.Literal<["canceled"]>;
        }>]>;
    }>, convex_values.VObject<{
        name: string;
        args: any[];
        scheduledTime: number;
        state: {
            kind: "pending";
        } | {
            kind: "inProgress";
        } | {
            kind: "success";
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        };
        completedTime?: number | undefined;
    }, {
        name: convex_values.VString<string, "required">;
        args: convex_values.VArray<any[], convex_values.VAny<any, "required", string>, "required">;
        scheduledTime: convex_values.VFloat64<number, "required">;
        state: convex_values.VObject<{
            kind: "pending";
        }, {
            kind: convex_values.VLiteral<"pending", "required">;
        }, "required", "kind"> | convex_values.VObject<{
            kind: "inProgress";
        }, {
            kind: convex_values.VLiteral<"inProgress", "required">;
        }, "required", "kind"> | convex_values.VObject<{
            kind: "success";
        }, {
            kind: convex_values.VLiteral<"success", "required">;
        }, "required", "kind"> | convex_values.VObject<{
            kind: "failed";
            error: string;
        }, {
            kind: convex_values.VLiteral<"failed", "required">;
            error: convex_values.VString<string, "required">;
        }, "required", "kind" | "error"> | convex_values.VObject<{
            kind: "canceled";
        }, {
            kind: convex_values.VLiteral<"canceled", "required">;
        }, "required", "kind">;
        completedTime: convex_values.VFloat64<number | undefined, "optional">;
    }, "required", "name" | "args" | "scheduledTime" | "completedTime" | "state" | "state.kind" | "state.error">, {}, {}, {}>;
    _storage: ConfectTableDefinition<Schema.Struct<{
        sha256: typeof Schema.String;
        size: typeof Schema.Number;
        contentType: Schema.optional<typeof Schema.String>;
    }>, convex_values.VObject<{
        sha256: string;
        size: number;
        contentType?: string | undefined;
    }, {
        sha256: convex_values.VString<string, "required">;
        size: convex_values.VFloat64<number, "required">;
        contentType: convex_values.VString<string | undefined, "optional">;
    }, "required", "sha256" | "size" | "contentType">, {}, {}, {}>;
}>;
type ConfectSystemSchema = typeof confectSystemSchemaDefinition;
type ConfectSystemDataModel = ConfectDataModelFromConfectSchemaDefinition<ConfectSystemSchema>;
type TableSchemasFromConfectSchema<ConfectSchema extends GenericConfectSchema> = Expand<{
    [TableName in keyof ConfectSchema & string]: {
        withSystemFields: ExtendWithSystemFields<TableName, ConfectSchema[TableName]["tableSchema"]>;
        withoutSystemFields: ConfectSchema[TableName]["tableSchema"];
    };
} & {
    [TableName in keyof ConfectSystemSchema["confectSchema"]]: {
        withSystemFields: ExtendWithSystemFields<TableName, ConfectSystemSchema["confectSchema"][TableName]["tableSchema"]>;
        withoutSystemFields: ConfectSystemSchema["confectSchema"][TableName]["tableSchema"];
    };
}>;
/**
 * Extract all of the index field paths within a {@link Validator}.
 *
 * This is used within {@link defineConvexTable}.
 * @public
 */
type ExtractFieldPaths<T extends Validator<any, any, any>> = T["fieldPaths"] | keyof SystemFields$1;
/**
 * Extract the {@link GenericDocument} within a {@link Validator} and
 * add on the system fields.
 *
 * This is used within {@link defineConvexTable}.
 * @public
 */
type ExtractDocument<TableName extends string, T extends Validator<any, any, any>> = Expand<IdField<TableName> & SystemFields$1 & T["type"]>;

export { type ConfectDataModelFromConfectSchema, type ConfectDataModelFromConfectSchemaDefinition, type ConfectSchemaDefinition, type ConfectSchemaFromConfectSchemaDefinition, type ConfectSystemDataModel, type ConfectTableDefinition, type GenericConfectSchema, type GenericConfectSchemaDefinition, type GenericConfectTableDefinition, type TableNamesInConfectSchema, type TableNamesInConfectSchemaDefinition, confectSystemSchema, confectSystemSchemaDefinition, confectTableSchemas, defineSchema, defineTable };
