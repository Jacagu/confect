import { UserIdentity, GenericDocument, GenericFieldPaths, GenericTableIndexes, GenericTableSearchIndexes, GenericTableVectorIndexes, FilterBuilder, Expression, PaginationOptions, PaginationResult as PaginationResult$2, Indexes, IndexRangeBuilder, DocumentByInfo, NamedIndex, IndexRange, SearchIndexes, SearchFilterBuilder, NamedSearchIndex, SearchFilter, WithoutSystemFields, WithOptionalSystemFields, SchedulableFunctionReference, OptionalRestArgs, FunctionReference, FunctionReturnType, GenericActionCtx, VectorIndexNames, NamedTableInfo, Expand, VectorSearchQuery, GenericMutationCtx, GenericQueryCtx, DefaultFunctionArgs, RegisteredQuery, RegisteredMutation, RegisteredAction, HttpRouter as HttpRouter$1 } from 'convex/server';
import { GenericId } from 'convex/values';
import { Effect, Option, Cause, Stream, ParseResult, Context, Schema, Layer, SchemaAST } from 'effect';
import { ReadonlyRecord } from 'effect/Record';
import { R as ReadonlyValue, C as ConfectSystemDataModel, G as GenericConfectSchema, a as ConfectSchemaDefinition, b as ConfectDataModelFromConfectSchema } from '../schema-mA1DDOxG.js';
export { c as ConfectDataModelFromConfectSchemaDefinition, f as compileSchema, d as defineSchema, e as defineTable } from '../schema-mA1DDOxG.js';
import * as effect_Types from 'effect/Types';
import { HttpApi as HttpApi$1, HttpApp, HttpApiBuilder, HttpRouter, HttpApiScalar } from '@effect/platform';

interface ConfectAuth {
    getUserIdentity(): Effect.Effect<Option.Option<UserIdentity>>;
}

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
        handler: (a: ConfectValue) => Effect.Effect<ConfectReturns_2, E_2, ConfectQueryCtx<ConfectDataModelFromConfectSchema<ConfectSchema>> | ConfectMutationCtx<ConfectDataModelFromConfectSchema<ConfectSchema>>>;
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

export { ConfectActionCtx, type ConfectDoc, ConfectMutationCtx, ConfectQueryCtx, type HttpApi, Id$1 as Id, NotUniqueError, PaginationResult$1 as PaginationResult, type TableNamesInConfectDataModel, makeFunctions, makeHttpRouter };
