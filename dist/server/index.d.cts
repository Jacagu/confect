import { UserIdentity, GenericDocument, GenericFieldPaths, GenericTableIndexes, GenericTableSearchIndexes, GenericTableVectorIndexes, TableDefinition, SystemFields as SystemFields$1, Expand, IndexTiebreakerField, SearchIndexConfig, VectorIndexConfig, SchemaDefinition, IdField, SystemIndexes, FilterBuilder, Expression, PaginationOptions, PaginationResult as PaginationResult$2, Indexes, IndexRangeBuilder, DocumentByInfo, NamedIndex, IndexRange, SearchIndexes, SearchFilterBuilder, NamedSearchIndex, SearchFilter, WithoutSystemFields, WithOptionalSystemFields, SchedulableFunctionReference, OptionalRestArgs, FunctionReference, FunctionReturnType, GenericActionCtx, VectorIndexNames, NamedTableInfo, VectorSearchQuery, GenericMutationCtx, GenericQueryCtx, DefaultFunctionArgs, RegisteredQuery, RegisteredMutation, RegisteredAction, HttpRouter as HttpRouter$1 } from 'convex/server';
import * as convex_values from 'convex/values';
import { GenericId, VAny, VId, VLiteral, VNull, VFloat64, VInt64, VBoolean, VString, VBytes, Validator, VArray, VOptional, OptionalProperty, VObject, VUnion } from 'convex/values';
import { Effect, Option, Brand, Schema, Cause, Stream, ParseResult, Context, Layer, SchemaAST } from 'effect';
import { ReadonlyRecord } from 'effect/Record';
import * as effect_Types from 'effect/Types';
import { HttpApi as HttpApi$1, HttpApp, HttpApiBuilder, HttpRouter, HttpApiScalar } from '@effect/platform';

interface ConfectAuth {
    getUserIdentity(): Effect.Effect<Option.Option<UserIdentity>>;
}

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

type GenericConfectDocument = ReadonlyRecord<string, any>;
type GenericEncodedConfectDocument = ReadonlyRecord<string, ReadonlyValue>;
type ConfectDocumentByName<ConfectDataModel extends GenericConfectDataModel, TableName extends TableNamesInConfectDataModel<ConfectDataModel>> = ConfectDataModel[TableName]["confectDocument"];
type GenericConfectDataModel = Record<string, GenericConfectTableInfo>;
type DataModelFromConfectDataModel<ConfectDataModel extends GenericConfectDataModel> = {
    [TableName in keyof ConfectDataModel & string]: TableInfoFromConfectTableInfo<ConfectDataModel[TableName]>;
};
type TableNamesInConfectDataModel<ConfectDataModel extends GenericConfectDataModel> = keyof ConfectDataModel & string;
type TableInfoFromConfectTableInfo<ConfectTableInfo extends GenericConfectTableInfo> = {
    document: ConfectTableInfo["convexDocument"];
    fieldPaths: ConfectTableInfo["fieldPaths"];
    indexes: ConfectTableInfo["indexes"];
    searchIndexes: ConfectTableInfo["searchIndexes"];
    vectorIndexes: ConfectTableInfo["vectorIndexes"];
};
type GenericConfectTableInfo = {
    confectDocument: GenericConfectDocument;
    encodedConfectDocument: GenericEncodedConfectDocument;
    convexDocument: GenericDocument;
    fieldPaths: GenericFieldPaths;
    indexes: GenericTableIndexes;
    searchIndexes: GenericTableSearchIndexes;
    vectorIndexes: GenericTableVectorIndexes;
};
/**
 * The Confect document encoded for storage in Convex. This is the data as it is stored in the database.
 */
type ConfectDoc<ConfectDataModel extends GenericConfectDataModel, TableName extends TableNamesInConfectDataModel<ConfectDataModel>> = ConfectDataModel[TableName]["encodedConfectDocument"];

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
/**
 * @ignore
 */
type ConfectDataModelFromConfectSchemaDefinition<ConfectSchemaDef extends GenericConfectSchemaDefinition> = ConfectSchemaDef extends ConfectSchemaDefinition<infer ConfectSchema> ? ConfectDataModelFromConfectSchema<ConfectSchema> : never;
/**
 * Define a Confect table.
 */
declare const defineTable: <TableSchema extends Schema.Schema.AnyNoContext>(tableSchema: TableSchema) => ConfectTableDefinition<TableSchema>;
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

interface ConfectQuery<ConfectTableInfo extends GenericConfectTableInfo, TableName extends string> {
    filter(predicate: (q: FilterBuilder<TableInfoFromConfectTableInfo<ConfectTableInfo>>) => Expression<boolean>): ConfectQuery<ConfectTableInfo, TableName>;
    order(order: "asc" | "desc"): ConfectOrderedQuery<ConfectTableInfo, TableName>;
    paginate(paginationOpts: PaginationOptions): Effect.Effect<PaginationResult$2<ConfectTableInfo["confectDocument"]>>;
    collect(): Effect.Effect<ConfectTableInfo["confectDocument"][]>;
    take(n: number): Effect.Effect<ConfectTableInfo["confectDocument"][]>;
    first(): Effect.Effect<Option.Option<ConfectTableInfo["confectDocument"]>>;
    unique(): Effect.Effect<Option.Option<ConfectTableInfo["confectDocument"]>, NotUniqueError>;
    stream(): Stream.Stream<ConfectTableInfo["confectDocument"]>;
}
interface ConfectOrderedQuery<ConfectTableInfo extends GenericConfectTableInfo, TableName extends string> extends Omit<ConfectQuery<ConfectTableInfo, TableName>, "order"> {
}
declare const NotUniqueError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "NotUniqueError";
} & Readonly<A>;
declare class NotUniqueError extends NotUniqueError_base {
}
interface ConfectQueryInitializer<ConfectTableInfo extends GenericConfectTableInfo, TableName extends string> extends ConfectQuery<ConfectTableInfo, TableName> {
    fullTableScan(): ConfectQuery<ConfectTableInfo, TableName>;
    withIndex<IndexName extends keyof Indexes<TableInfoFromConfectTableInfo<ConfectTableInfo>>>(indexName: IndexName, indexRange?: ((q: IndexRangeBuilder<DocumentByInfo<TableInfoFromConfectTableInfo<ConfectTableInfo>>, NamedIndex<TableInfoFromConfectTableInfo<ConfectTableInfo>, IndexName>, 0>) => IndexRange) | undefined): ConfectQuery<ConfectTableInfo, TableName>;
    withSearchIndex<IndexName extends keyof SearchIndexes<TableInfoFromConfectTableInfo<ConfectTableInfo>>>(indexName: IndexName, searchFilter: (q: SearchFilterBuilder<DocumentByInfo<TableInfoFromConfectTableInfo<ConfectTableInfo>>, NamedSearchIndex<TableInfoFromConfectTableInfo<ConfectTableInfo>, IndexName>>) => SearchFilter): ConfectOrderedQuery<ConfectTableInfo, TableName>;
}
interface ConfectDatabaseReader<ConfectDataModel extends GenericConfectDataModel> extends ConfectBaseDatabaseReader<ConfectDataModel> {
    system: ConfectBaseDatabaseReader<ConfectSystemDataModel>;
}
interface ConfectBaseDatabaseReader<ConfectDataModel extends GenericConfectDataModel> {
    query<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(tableName: TableName): ConfectQueryInitializer<ConfectDataModel[TableName], TableName>;
    get<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(id: GenericId<TableName>): Effect.Effect<Option.Option<ConfectDataModel[TableName]["confectDocument"]>>;
    normalizeId<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(tableName: TableName, id: string): Option.Option<GenericId<TableName>>;
}
interface ConfectDatabaseWriter<ConfectDataModel extends GenericConfectDataModel> {
    query<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(tableName: TableName): ConfectQueryInitializer<ConfectDataModel[TableName], TableName>;
    get<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(id: GenericId<TableName>): Effect.Effect<Option.Option<ConfectDataModel[TableName]["confectDocument"]>>;
    normalizeId<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(tableName: TableName, id: string): Option.Option<GenericId<TableName>>;
    insert<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(table: TableName, value: WithoutSystemFields<ConfectDocumentByName<ConfectDataModel, TableName>>): Effect.Effect<GenericId<TableName>, ParseResult.ParseError>;
    patch<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(id: GenericId<TableName>, value: Partial<WithoutSystemFields<ConfectDocumentByName<ConfectDataModel, TableName>>>): Effect.Effect<void, ParseResult.ParseError | Cause.NoSuchElementException>;
    replace<TableName extends TableNamesInConfectDataModel<ConfectDataModel>>(id: GenericId<TableName>, value: WithOptionalSystemFields<ConfectDocumentByName<ConfectDataModel, TableName>>): Effect.Effect<void>;
    delete(id: GenericId<string>): Effect.Effect<void>;
}

interface ConfectScheduler {
    runAfter<FuncRef extends SchedulableFunctionReference>(delayMs: number, functionReference: FuncRef, ...args: OptionalRestArgs<FuncRef>): Effect.Effect<void>;
    runAt<FuncRef extends SchedulableFunctionReference>(timestamp: number | Date, functionReference: FuncRef, ...args: OptionalRestArgs<FuncRef>): Effect.Effect<void>;
}

interface ConfectStorageReader {
    getUrl(storageId: GenericId<"_storage">): Effect.Effect<Option.Option<string>>;
}
interface ConfectStorageWriter extends ConfectStorageReader {
    generateUploadUrl(): Effect.Effect<string>;
    delete(storageId: GenericId<"_storage">): Effect.Effect<void>;
}

type ConfectMutationCtx<ConfectDataModel extends GenericConfectDataModel> = {
    ctx: GenericMutationCtx<DataModelFromConfectDataModel<ConfectDataModel>>;
    db: ConfectDatabaseWriter<ConfectDataModel>;
    auth: ConfectAuth;
    storage: ConfectStorageWriter;
    scheduler: ConfectScheduler;
};
declare const ConfectMutationCtx: <ConfectDataModel extends GenericConfectDataModel>() => Context.Tag<ConfectMutationCtx<ConfectDataModel>, ConfectMutationCtx<ConfectDataModel>>;
type ConfectQueryCtx<ConfectDataModel extends GenericConfectDataModel> = {
    ctx: GenericQueryCtx<DataModelFromConfectDataModel<ConfectDataModel>>;
    db: ConfectDatabaseReader<ConfectDataModel>;
    auth: ConfectAuth;
    storage: ConfectStorageReader;
};
declare const ConfectQueryCtx: <ConfectDataModel extends GenericConfectDataModel>() => Context.Tag<ConfectQueryCtx<ConfectDataModel>, ConfectQueryCtx<ConfectDataModel>>;
type ConfectActionCtx<ConfectDataModel extends GenericConfectDataModel> = {
    runQuery<Query extends FunctionReference<"query", "public" | "internal">>(query: Query, ...args: OptionalRestArgs<Query>): Effect.Effect<FunctionReturnType<Query>>;
    runMutation<Mutation extends FunctionReference<"mutation", "public" | "internal">>(mutation: Mutation, ...args: OptionalRestArgs<Mutation>): Effect.Effect<FunctionReturnType<Mutation>>;
    runAction<Action extends FunctionReference<"action", "public" | "internal">>(action: Action, ...args: OptionalRestArgs<Action>): Effect.Effect<FunctionReturnType<Action>>;
    ctx: GenericActionCtx<DataModelFromConfectDataModel<ConfectDataModel>>;
    scheduler: ConfectScheduler;
    auth: ConfectAuth;
    storage: ConfectStorageWriter;
    vectorSearch<TableName extends TableNamesInConfectDataModel<ConfectDataModel>, IndexName extends VectorIndexNames<NamedTableInfo<DataModelFromConfectDataModel<ConfectDataModel>, TableName>>>(tableName: TableName, indexName: IndexName, query: Expand<VectorSearchQuery<NamedTableInfo<DataModelFromConfectDataModel<ConfectDataModel>, TableName>, IndexName>>): Effect.Effect<Array<{
        _id: GenericId<TableName>;
        _score: number;
    }>>;
};
declare const ConfectActionCtx: <ConfectDataModel extends GenericConfectDataModel>() => Context.Tag<ConfectActionCtx<ConfectDataModel>, ConfectActionCtx<ConfectDataModel>>;

declare const makeFunctions: <ConfectSchema extends GenericConfectSchema>(confectSchemaDefinition: ConfectSchemaDefinition<ConfectSchema>) => {
    query: <ConvexArgs extends DefaultFunctionArgs, ConfectArgs, ConvexReturns, ConfectReturns, E>({ args, returns, handler, }: {
        args: Schema.Schema<ConfectArgs, ConvexArgs>;
        returns: Schema.Schema<ConfectReturns, ConvexReturns>;
        handler: (a: ConfectArgs) => Effect.Effect<ConfectReturns, E, ConfectQueryCtx<ConfectDataModelFromConfectSchema<ConfectSchema>>>;
    }) => RegisteredQuery<"public", ConvexArgs, Promise<ConvexReturns>>;
    internalQuery: <ConvexArgs extends DefaultFunctionArgs, ConfectArgs_1, ConvexReturns_1, ConfectReturns_1, E_1>({ args, handler, returns, }: {
        args: Schema.Schema<ConfectArgs_1, ConvexArgs>;
        returns: Schema.Schema<ConfectReturns_1, ConvexReturns_1>;
        handler: (a: ConfectArgs_1) => Effect.Effect<ConfectReturns_1, E_1, ConfectQueryCtx<ConfectDataModelFromConfectSchema<ConfectSchema>>>;
    }) => RegisteredQuery<"internal", ConvexArgs, Promise<ConvexReturns_1>>;
    mutation: <ConvexValue extends DefaultFunctionArgs, ConfectValue, ConvexReturns_2, ConfectReturns_2, E_2>({ args, returns, handler, }: {
        args: Schema.Schema<ConfectValue, ConvexValue>;
        returns: Schema.Schema<ConfectReturns_2, ConvexReturns_2>;
        handler: (a: ConfectValue) => Effect.Effect<ConfectReturns_2, E_2, ConfectMutationCtx<ConfectDataModelFromConfectSchema<ConfectSchema>>>;
    }) => RegisteredMutation<"public", ConvexValue, Promise<ConvexReturns_2>>;
    internalMutation: <ConvexValue extends DefaultFunctionArgs, ConfectValue_1, ConvexReturns_3, ConfectReturns_3, E_3>({ args, returns, handler, }: {
        args: Schema.Schema<ConfectValue_1, ConvexValue>;
        returns: Schema.Schema<ConfectReturns_3, ConvexReturns_3>;
        handler: (a: ConfectValue_1) => Effect.Effect<ConfectReturns_3, E_3, ConfectMutationCtx<ConfectDataModelFromConfectSchema<ConfectSchema>>>;
    }) => RegisteredMutation<"internal", ConvexValue, Promise<ConvexReturns_3>>;
    action: <ConvexValue extends DefaultFunctionArgs, ConfectValue_2, ConvexReturns_4, ConfectReturns_4, E_4>({ args, returns, handler, }: {
        args: Schema.Schema<ConfectValue_2, ConvexValue>;
        returns: Schema.Schema<ConfectReturns_4, ConvexReturns_4>;
        handler: (a: ConfectValue_2) => Effect.Effect<ConfectReturns_4, E_4, ConfectActionCtx<ConfectDataModelFromConfectSchema<ConfectSchema>>>;
    }) => RegisteredAction<"public", ConvexValue, Promise<ConvexReturns_4>>;
    internalAction: <ConvexValue extends DefaultFunctionArgs, ConfectValue_3, ConvexReturns_5, ConfectReturns_5, E_5>({ args, returns, handler, }: {
        args: Schema.Schema<ConfectValue_3, ConvexValue>;
        returns: Schema.Schema<ConfectReturns_5, ConvexReturns_5>;
        handler: (a: ConfectValue_3) => Effect.Effect<ConfectReturns_5, E_5, ConfectActionCtx<ConfectDataModelFromConfectSchema<ConfectSchema>>>;
    }) => RegisteredAction<"internal", ConvexValue, Promise<ConvexReturns_5>>;
};

type Middleware = (httpApp: HttpApp.Default) => HttpApp.Default<never, HttpApi$1.Api | HttpApiBuilder.Router | HttpRouter.HttpRouter.DefaultServices>;
type HttpApi = {
    apiLive: Layer.Layer<HttpApi$1.Api, never, ConfectActionCtx<any>>;
    middleware?: Middleware;
    scalar?: HttpApiScalar.ScalarConfig;
};
type RoutePath = "/" | `/${string}/`;
type HttpApis = Partial<Record<RoutePath, HttpApi>>;
declare const makeHttpRouter: (httpApis: HttpApis) => HttpRouter$1;

declare const Id: <TableName extends string>(tableName: TableName) => Schema.Schema<GenericId<TableName>>;
declare const tableName: <TableName extends string>(ast: SchemaAST.AST) => Option.Option<TableName>;

declare const Id$1_Id: typeof Id;
declare const Id$1_tableName: typeof tableName;
declare namespace Id$1 {
  export { Id$1_Id as Id, Id$1_tableName as tableName };
}

declare const PaginationResult: <Doc extends Schema.Schema.AnyNoContext>(Doc: Doc) => Schema.mutable<Schema.Struct<{
    page: Schema.mutable<Schema.Array$<Doc>>;
    isDone: typeof Schema.Boolean;
    continueCursor: typeof Schema.String;
    splitCursor: Schema.optional<Schema.Union<[typeof Schema.String, typeof Schema.Null]>>;
    pageStatus: Schema.optional<Schema.Union<[Schema.Literal<["SplitRecommended"]>, Schema.Literal<["SplitRequired"]>, typeof Schema.Null]>>;
}>>;

declare const PaginationResult$1_PaginationResult: typeof PaginationResult;
declare namespace PaginationResult$1 {
  export { PaginationResult$1_PaginationResult as PaginationResult };
}

export { ConfectActionCtx, type ConfectDataModelFromConfectSchemaDefinition, type ConfectDoc, ConfectMutationCtx, ConfectQueryCtx, type HttpApi, Id$1 as Id, NotUniqueError, PaginationResult$1 as PaginationResult, type TableNamesInConfectDataModel, compileSchema, defineSchema, defineTable, makeFunctions, makeHttpRouter };
