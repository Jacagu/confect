import * as convex_values from 'convex/values';
import { GenericId, VAny, VId, VLiteral, VNull, VFloat64, VInt64, VBoolean, VString, VBytes, Validator, VArray, VOptional, OptionalProperty, VObject, VUnion } from 'convex/values';
import { GenericTableIndexes, GenericTableSearchIndexes, GenericTableVectorIndexes, TableDefinition, SystemFields as SystemFields$1, Expand, IndexTiebreakerField, SearchIndexConfig, VectorIndexConfig, SchemaDefinition, IdField, SystemIndexes } from 'convex/server';
import { Brand, Schema } from 'effect';

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K>
  ? true
  : false;

type IsAny<T> = 0 extends 1 & T ? true : false;

type IsUnion<T, U extends T = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : never;

// https://stackoverflow.com/a/52806744
type IsValueLiteral<Vl> = [Vl] extends [never]
  ? never
  : [Vl] extends [string | number | bigint | boolean]
    ? [string] extends [Vl]
      ? false
      : [number] extends [Vl]
        ? false
        : [boolean] extends [Vl]
          ? false
          : [bigint] extends [Vl]
            ? false
            : true
    : false;

type DeepMutable<T> = IsAny<T> extends true
  ? any
  : T extends Brand.Brand<any> | GenericId<any>
    ? T
    : T extends ReadonlyMap<infer K, infer V>
      ? Map<DeepMutable<K>, DeepMutable<V>>
      : T extends ReadonlySet<infer V>
        ? Set<DeepMutable<V>>
        : [keyof T] extends [never]
          ? T
          : { -readonly [K in keyof T]: DeepMutable<T[K]> };

type TypeError<Message extends string, T = never> = [Message, T];

type IsRecursive<T> = true extends DetectCycle<T> ? true : false;

type DetectCycle<T, Cache extends any[] = []> = IsAny<T> extends true
  ? false
  : [T] extends [any]
    ? T extends Cache[number]
      ? true
      : T extends Array<infer U>
        ? DetectCycle<U, [...Cache, T]>
        : T extends Map<infer _U, infer V>
          ? DetectCycle<V, [...Cache, T]>
          : T extends Set<infer U>
            ? DetectCycle<U, [...Cache, T]>
            : T extends object
              ? true extends {
                  [K in keyof T]: DetectCycle<T[K], [...Cache, T]>;
                }[keyof T]
                ? true
                : false
              : false
    : never;

//////////////////////////////////
// START: Vendored from Arktype //
//////////////////////////////////

// https://github.com/arktypeio/arktype/blob/2e911d01a741ccee7a17e31ee144049817fabbb8/ark/util/unionToTuple.ts#L9

type UnionToTuple<t> = _unionToTuple<t, []> extends infer result
  ? conform<result, t[]>
  : never;

type _unionToTuple<
  t,
  result extends unknown[],
> = getLastBranch<t> extends infer current
  ? [t] extends [never]
    ? result
    : _unionToTuple<Exclude<t, current>, [current, ...result]>
  : never;

type getLastBranch<t> = intersectUnion<
  t extends unknown ? (x: t) => void : never
> extends (x: infer branch) => void
  ? branch
  : never;

type intersectUnion<t> = (t extends unknown ? (_: t) => void : never) extends (
  _: infer intersection,
) => void
  ? intersection
  : never;

type conform<t, base> = t extends base ? t : base;

/**
 * Convert a table `Schema` to a table `Validator`.
 */
type TableSchemaToTableValidator<TableSchema extends Schema.Schema.AnyNoContext> = ValueToValidator<TableSchema["Encoded"]> extends infer Vd extends VObject<any, any, any, any> | VUnion<any, any, any, any> ? Vd : never;
type ReadonlyValue = string | number | bigint | boolean | ArrayBuffer | ReadonlyArrayValue | ReadonlyRecordValue | null;
type ReadonlyArrayValue = readonly ReadonlyValue[];
type ReadonlyRecordValue = {
    readonly [key: string]: ReadonlyValue | undefined;
};
type ValueToValidator<Vl> = IsRecursive<Vl> extends true ? VAny : [Vl] extends [never] ? never : IsAny<Vl> extends true ? VAny : [Vl] extends [ReadonlyValue] ? Vl extends {
    __tableName: infer TableName extends string;
} ? VId<GenericId<TableName>> : IsValueLiteral<Vl> extends true ? VLiteral<Vl> : Vl extends null ? VNull : Vl extends number ? VFloat64 : Vl extends bigint ? VInt64 : Vl extends boolean ? VBoolean : Vl extends string ? VString : Vl extends ArrayBuffer ? VBytes : Vl extends ReadonlyArray<ReadonlyValue> ? ArrayValueToValidator<Vl> : Vl extends ReadonlyRecordValue ? RecordValueToValidator<Vl> : IsUnion<Vl> extends true ? UnionValueToValidator<Vl> : TypeError<"Unexpected value", Vl> : TypeError<"Not a valid Convex value", Vl>;
type ArrayValueToValidator<Vl extends ReadonlyArray<ReadonlyValue>> = Vl extends ReadonlyArray<infer El extends ReadonlyValue> ? ValueToValidator<El> extends infer Vd extends Validator<any, any, any> ? VArray<DeepMutable<El[]>, Vd> : never : never;
type RecordValueToValidator<Vl> = Vl extends ReadonlyRecordValue ? {
    -readonly [K in keyof Vl]-?: IsAny<Vl[K]> extends true ? IsOptional<Vl, K> extends true ? VOptional<VAny> : VAny : UndefinedOrValueToValidator<Vl[K]>;
} extends infer VdRecord extends Record<string, any> ? {
    -readonly [K in keyof Vl]: DeepMutable<Vl[K]>;
} extends infer VlRecord extends Record<string, any> ? VObject<VlRecord, VdRecord> : never : never : never;
type UndefinedOrValueToValidator<Vl extends ReadonlyValue | undefined> = undefined extends Vl ? Vl extends infer Val extends ReadonlyValue | undefined ? ValueToValidator<Val> extends infer Vd extends Validator<any, OptionalProperty, any> ? VOptional<Vd> : undefined : never : Vl extends ReadonlyValue ? ValueToValidator<Vl> : never;
type UnionValueToValidator<Vl extends ReadonlyValue> = [Vl] extends [
    ReadonlyValue
] ? IsUnion<Vl> extends true ? UnionToTuple<Vl> extends infer VlTuple extends ReadonlyArray<ReadonlyValue> ? ValueTupleToValidatorTuple<VlTuple> extends infer VdTuple extends Validator<any, "required", any>[] ? VUnion<DeepMutable<Vl>, VdTuple> : TypeError<"Failed to convert value tuple to validator tuple"> : TypeError<"Failed to convert union to tuple"> : TypeError<"Expected a union of values, but got a single value instead"> : TypeError<"Provided value is not a valid Convex value">;
type ValueTupleToValidatorTuple<VlTuple extends ReadonlyArray<ReadonlyValue>> = VlTuple extends [true, false, ...infer VlRest extends ReadonlyArray<ReadonlyValue>] | [
    false,
    true,
    ...infer VlRest extends ReadonlyArray<ReadonlyValue>
] ? ValueTupleToValidatorTuple<VlRest> extends infer VdRest extends Validator<any, any, any>[] ? [VBoolean<boolean>, ...VdRest] : never : VlTuple extends [
    infer Vl extends ReadonlyValue,
    ...infer VlRest extends ReadonlyArray<ReadonlyValue>
] ? ValueToValidator<Vl> extends infer Vd extends Validator<any, any, any> ? ValueTupleToValidatorTuple<VlRest> extends infer VdRest extends Validator<any, "required", any>[] ? [Vd, ...VdRest] : never : never : [];
declare const compileSchema: <T, E>(schema: Schema.Schema<T, E>) => ValueToValidator<(typeof schema)["Encoded"]>;

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

export { type ConfectSystemDataModel as C, type GenericConfectSchema as G, type ReadonlyValue as R, type TableNamesInConfectSchema as T, type ConfectSchemaDefinition as a, type ConfectDataModelFromConfectSchema as b, type ConfectDataModelFromConfectSchemaDefinition as c, defineSchema as d, defineTable as e, compileSchema as f, confectTableSchemas as g, type GenericConfectSchemaDefinition as h, type GenericConfectTableDefinition as i, type ConfectTableDefinition as j, type ConfectSchemaFromConfectSchemaDefinition as k, type TableNamesInConfectSchemaDefinition as l, confectSystemSchema as m, confectSystemSchemaDefinition as n };
