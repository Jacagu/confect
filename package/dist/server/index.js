import {
  Id_exports,
  compileArgsSchema,
  compileReturnsSchema,
  compileSchema,
  confectSystemSchemaDefinition,
  defineSchema,
  defineTable,
  extendWithSystemFields
} from "../chunk-V6ZVKRQJ.js";
import {
  __export
} from "../chunk-PZ5AY32C.js";

// src/server/ctx.ts
import { Context, Effect as Effect5 } from "effect";

// src/server/auth.ts
import { Effect, Option, pipe } from "effect";
var ConfectAuthImpl = class {
  constructor(auth) {
    this.auth = auth;
  }
  getUserIdentity() {
    return pipe(
      Effect.promise(() => this.auth.getUserIdentity()),
      Effect.map(Option.fromNullable)
    );
  }
};

// src/server/database.ts
import {
  Array,
  Chunk,
  Data,
  Effect as Effect2,
  identity,
  Option as Option2,
  pipe as pipe2,
  Record,
  Schema,
  Stream
} from "effect";
var NotUniqueError = class extends Data.TaggedError("NotUniqueError") {
};
var ConfectQueryImpl = class _ConfectQueryImpl {
  q;
  tableSchema;
  tableName;
  constructor(q, tableSchema, tableName) {
    this.q = q;
    this.tableSchema = tableSchema;
    this.tableName = tableName;
  }
  decode(convexDocument) {
    return decodeDocument(this.tableName, this.tableSchema, convexDocument);
  }
  filter(predicate) {
    return new _ConfectQueryImpl(
      this.q.filter(predicate),
      this.tableSchema,
      this.tableName
    );
  }
  order(order) {
    return new _ConfectQueryImpl(
      this.q.order(order),
      this.tableSchema,
      this.tableName
    );
  }
  paginate(paginationOpts) {
    return pipe2(
      Effect2.Do,
      Effect2.bind(
        "paginationResult",
        () => Effect2.promise(() => this.q.paginate(paginationOpts))
      ),
      Effect2.let(
        "parsedPage",
        ({ paginationResult }) => pipe2(
          paginationResult.page,
          Array.map((document) => this.decode(document))
        )
      ),
      Effect2.map(({ paginationResult, parsedPage }) => ({
        page: parsedPage,
        isDone: paginationResult.isDone,
        continueCursor: paginationResult.continueCursor,
        /* v8 ignore next -- @preserve */
        ...paginationResult.splitCursor ? { splitCursor: paginationResult.splitCursor } : {},
        /* v8 ignore next -- @preserve */
        ...paginationResult.pageStatus ? { pageStatus: paginationResult.pageStatus } : {}
      }))
    );
  }
  // It could be better to implement collect() with stream()
  collect() {
    return pipe2(
      Effect2.promise(() => this.q.collect()),
      Effect2.map(Array.map((document) => this.decode(document)))
    );
  }
  take(n) {
    return pipe2(
      this.stream(),
      Stream.take(n),
      Stream.runCollect,
      Effect2.map((chunk) => Chunk.toArray(chunk))
    );
  }
  first() {
    return pipe2(this.stream(), Stream.runHead);
  }
  unique() {
    return pipe2(
      this.stream(),
      Stream.take(2),
      Stream.runCollect,
      Effect2.andThen(
        (chunk) => pipe2(
          chunk,
          Chunk.get(1),
          Option2.match({
            onSome: () => Effect2.fail(new NotUniqueError()),
            onNone: () => Effect2.succeed(Chunk.get(chunk, 0))
          })
        )
      )
    );
  }
  stream() {
    return pipe2(
      Stream.fromAsyncIterable(this.q, identity),
      Stream.map((document) => this.decode(document)),
      Stream.orDie
    );
  }
};
var ConfectQueryInitializerImpl = class {
  q;
  tableSchema;
  tableName;
  constructor(q, tableSchema, tableName) {
    this.q = q;
    this.tableSchema = tableSchema;
    this.tableName = tableName;
  }
  fullTableScan() {
    return new ConfectQueryImpl(
      this.q.fullTableScan(),
      this.tableSchema,
      this.tableName
    );
  }
  withIndex(indexName, indexRange) {
    return new ConfectQueryImpl(
      this.q.withIndex(indexName, indexRange),
      this.tableSchema,
      this.tableName
    );
  }
  withSearchIndex(indexName, searchFilter) {
    return new ConfectQueryImpl(
      this.q.withSearchIndex(indexName, searchFilter),
      this.tableSchema,
      this.tableName
    );
  }
  filter(predicate) {
    return this.fullTableScan().filter(predicate);
  }
  order(order) {
    return this.fullTableScan().order(order);
  }
  paginate(paginationOpts) {
    return this.fullTableScan().paginate(paginationOpts);
  }
  collect() {
    return this.fullTableScan().collect();
  }
  take(n) {
    return this.fullTableScan().take(n);
  }
  first() {
    return this.fullTableScan().first();
  }
  unique() {
    return this.fullTableScan().unique();
  }
  stream() {
    return this.fullTableScan().stream();
  }
};
var ConfectBaseDatabaseReaderImpl = class {
  db;
  databaseSchemas;
  constructor(db, databaseSchemas) {
    this.db = db;
    this.databaseSchemas = databaseSchemas;
  }
  decode(tableName, convexDocument) {
    return decodeDocument(
      tableName,
      this.databaseSchemas[tableName],
      convexDocument
    );
  }
  tableName(id) {
    return Array.findFirst(
      Record.keys(this.databaseSchemas),
      (tableName) => Option2.isSome(this.normalizeId(tableName, id))
    );
  }
  normalizeId(tableName, id) {
    return Option2.fromNullable(this.db.normalizeId(tableName, id));
  }
  get(id) {
    return Effect2.gen(this, function* () {
      const optionConvexDoc = yield* Effect2.promise(() => this.db.get(id)).pipe(
        Effect2.map(Option2.fromNullable)
      );
      const tableName = yield* this.tableName(id).pipe(Effect2.orDie);
      return pipe2(
        optionConvexDoc,
        Option2.map((convexDoc) => this.decode(tableName, convexDoc))
      );
    });
  }
  query(tableName) {
    return new ConfectQueryInitializerImpl(
      this.db.query(tableName),
      this.databaseSchemas[tableName],
      tableName
    );
  }
};
var ConfectDatabaseReaderImpl = class {
  db;
  databaseSchemas;
  system;
  constructor(db, databaseSchemas) {
    this.db = db;
    this.databaseSchemas = databaseSchemas;
    this.system = new ConfectBaseDatabaseReaderImpl(
      this.db.system,
      databaseSchemasFromConfectSchema(
        confectSystemSchemaDefinition.confectSchema
      )
    );
  }
  decode(tableName, convexDocument) {
    return decodeDocument(
      tableName,
      this.databaseSchemas[tableName],
      convexDocument
    );
  }
  tableName(id) {
    return Array.findFirst(
      Record.keys(this.databaseSchemas),
      (tableName) => Option2.isSome(this.normalizeId(tableName, id))
    );
  }
  normalizeId(tableName, id) {
    return Option2.fromNullable(this.db.normalizeId(tableName, id));
  }
  get(id) {
    return Effect2.gen(this, function* () {
      const optionConvexDoc = yield* Effect2.promise(() => this.db.get(id)).pipe(
        Effect2.map(Option2.fromNullable)
      );
      const tableName = yield* this.tableName(id).pipe(Effect2.orDie);
      return pipe2(
        optionConvexDoc,
        Option2.map((convexDoc) => this.decode(tableName, convexDoc))
      );
    });
  }
  query(tableName) {
    return new ConfectQueryInitializerImpl(
      this.db.query(tableName),
      this.databaseSchemas[tableName],
      tableName
    );
  }
};
var ConfectDatabaseWriterImpl = class {
  databaseSchemas;
  db;
  reader;
  constructor(db, databaseSchemas) {
    this.db = db;
    this.databaseSchemas = databaseSchemas;
    this.reader = new ConfectDatabaseReaderImpl(db, databaseSchemas);
  }
  tableName(id) {
    return Array.findFirst(
      Record.keys(this.databaseSchemas),
      (tableName) => Option2.isSome(this.normalizeId(tableName, id))
    );
  }
  query(tableName) {
    return this.reader.query(tableName);
  }
  get(id) {
    return this.reader.get(id);
  }
  normalizeId(tableName, id) {
    return Option2.fromNullable(this.db.normalizeId(tableName, id));
  }
  insert(table, value) {
    return pipe2(
      value,
      Schema.encode(this.databaseSchemas[table]),
      Effect2.andThen(
        (encodedValue) => Effect2.promise(
          () => this.db.insert(
            table,
            encodedValue
          )
        )
      )
    );
  }
  patch(id, value) {
    return Effect2.gen(this, function* () {
      const tableName = yield* this.tableName(id);
      const tableSchema = this.databaseSchemas[tableName];
      const originalConvexDoc = yield* Effect2.promise(
        () => this.db.get(id)
      ).pipe(
        Effect2.andThen(
          (doc) => doc ? Effect2.succeed(doc) : Effect2.die(new InvalidIdProvidedForPatch())
        )
      );
      const originalConfectDoc = yield* Schema.decodeUnknown(tableSchema)(originalConvexDoc);
      const updatedConvexDoc = yield* pipe2(
        value,
        Record.reduce(
          originalConfectDoc,
          (acc, value2, key) => value2 === void 0 ? Record.remove(acc, key) : Record.set(acc, key, value2)
        ),
        Schema.encodeUnknown(tableSchema)
      );
      yield* Effect2.promise(
        () => this.db.replace(
          id,
          updatedConvexDoc
        )
      );
    });
  }
  replace(id, value) {
    return Effect2.promise(() => this.db.replace(id, value));
  }
  delete(id) {
    return Effect2.promise(() => this.db.delete(id));
  }
};
var databaseSchemasFromConfectSchema = (confectSchema) => Record.map(
  confectSchema,
  ({ tableSchema }) => tableSchema
);
var InvalidIdProvidedForPatch = class extends Data.TaggedError(
  "InvalidIdProvidedForPatch"
) {
};
var decodeDocument = (tableName, tableSchema, convexDocument) => Schema.decodeUnknownSync(extendWithSystemFields(tableName, tableSchema), {
  onExcessProperty: "error"
})(convexDocument);

// src/server/scheduler.ts
import { Effect as Effect3 } from "effect";
var ConfectSchedulerImpl = class {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }
  runAfter(delayMs, functionReference, ...args) {
    return Effect3.promise(
      () => this.scheduler.runAfter(delayMs, functionReference, ...args)
    );
  }
  runAt(timestamp, functionReference, ...args) {
    return Effect3.promise(
      () => this.scheduler.runAt(timestamp, functionReference, ...args)
    );
  }
};

// src/server/storage.ts
import { Effect as Effect4, Option as Option3 } from "effect";
var ConfectStorageReaderImpl = class {
  constructor(storageReader) {
    this.storageReader = storageReader;
  }
  getUrl(storageId) {
    return Effect4.promise(() => this.storageReader.getUrl(storageId)).pipe(
      Effect4.map(Option3.fromNullable)
    );
  }
};
var ConfectStorageWriterImpl = class {
  constructor(storageWriter) {
    this.storageWriter = storageWriter;
    this.confectStorageReader = new ConfectStorageReaderImpl(storageWriter);
  }
  confectStorageReader;
  getUrl(storageId) {
    return this.confectStorageReader.getUrl(storageId);
  }
  generateUploadUrl() {
    return Effect4.promise(() => this.storageWriter.generateUploadUrl());
  }
  delete(storageId) {
    return Effect4.promise(() => this.storageWriter.delete(storageId));
  }
};

// src/server/ctx.ts
var ConfectMutationCtx = () => Context.GenericTag(
  "@rjdellecese/confect/ConfectMutationCtx"
);
var ConfectQueryCtx = () => Context.GenericTag(
  "@rjdellecese/confect/ConfectQueryCtx"
);
var ConfectActionCtx = () => Context.GenericTag(
  "@rjdellecese/confect/ConfectActionCtx"
);
var makeConfectQueryCtx = (ctx, databaseSchemas) => ({
  ctx,
  db: new ConfectDatabaseReaderImpl(ctx.db, databaseSchemas),
  auth: new ConfectAuthImpl(ctx.auth),
  storage: new ConfectStorageReaderImpl(ctx.storage)
});
var makeConfectMutationCtx = (ctx, databaseSchemas) => ({
  ctx,
  db: new ConfectDatabaseWriterImpl(ctx.db, databaseSchemas),
  auth: new ConfectAuthImpl(ctx.auth),
  storage: new ConfectStorageWriterImpl(ctx.storage),
  scheduler: new ConfectSchedulerImpl(ctx.scheduler)
});
var makeConfectActionCtx = (ctx) => ({
  runQuery: (query, ...queryArgs) => Effect5.promise(() => ctx.runQuery(query, ...queryArgs)),
  runMutation: (mutation, ...mutationArgs) => Effect5.promise(() => ctx.runMutation(mutation, ...mutationArgs)),
  runAction: (action, ...actionArgs) => Effect5.promise(() => ctx.runAction(action, ...actionArgs)),
  vectorSearch: (tableName, indexName, query) => Effect5.promise(() => ctx.vectorSearch(tableName, indexName, query)),
  ctx,
  auth: new ConfectAuthImpl(ctx.auth),
  storage: new ConfectStorageWriterImpl(ctx.storage),
  scheduler: new ConfectSchedulerImpl(ctx.scheduler)
});

// src/server/functions.ts
import {
  actionGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric
} from "convex/server";
import { Effect as Effect6, pipe as pipe3, Schema as Schema2 } from "effect";
var makeFunctions = (confectSchemaDefinition) => {
  const databaseSchemas = databaseSchemasFromConfectSchema(
    confectSchemaDefinition.confectSchema
  );
  const query = ({
    args,
    returns,
    handler
  }) => queryGeneric(
    confectQueryFunction({ databaseSchemas, args, returns, handler })
  );
  const internalQuery = ({
    args,
    handler,
    returns
  }) => internalQueryGeneric(
    confectQueryFunction({ databaseSchemas, args, returns, handler })
  );
  const mutation = ({
    args,
    returns,
    handler
  }) => mutationGeneric(
    confectMutationFunction({ databaseSchemas, args, returns, handler })
  );
  const internalMutation = ({
    args,
    returns,
    handler
  }) => internalMutationGeneric(
    confectMutationFunction({ databaseSchemas, args, returns, handler })
  );
  const action = ({
    args,
    returns,
    handler
  }) => actionGeneric(confectActionFunction({ args, returns, handler }));
  const internalAction = ({
    args,
    returns,
    handler
  }) => internalActionGeneric(confectActionFunction({ args, returns, handler }));
  return {
    query,
    internalQuery,
    mutation,
    internalMutation,
    action,
    internalAction
  };
};
var confectQueryFunction = ({
  databaseSchemas,
  args,
  returns,
  handler
}) => ({
  args: compileArgsSchema(args),
  returns: compileReturnsSchema(returns),
  handler: (ctx, actualArgs) => pipe3(
    actualArgs,
    Schema2.decode(args),
    Effect6.orDie,
    Effect6.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        Effect6.provideService(
          ConfectQueryCtx(),
          makeConfectQueryCtx(ctx, databaseSchemas)
        )
      )
    ),
    Effect6.andThen(
      (convexReturns) => Schema2.encodeUnknown(returns)(convexReturns)
    ),
    Effect6.runPromise
  )
});
var confectMutationFunction = ({
  databaseSchemas,
  args,
  returns,
  handler
}) => ({
  args: compileArgsSchema(args),
  returns: compileReturnsSchema(returns),
  handler: (ctx, actualArgs) => pipe3(
    actualArgs,
    Schema2.decode(args),
    Effect6.orDie,
    Effect6.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        Effect6.provideService(
          ConfectQueryCtx(),
          makeConfectQueryCtx(ctx, databaseSchemas)
        ),
        Effect6.provideService(
          ConfectMutationCtx(),
          makeConfectMutationCtx(ctx, databaseSchemas)
        )
      )
    ),
    Effect6.andThen(
      (convexReturns) => Schema2.encodeUnknown(returns)(convexReturns)
    ),
    Effect6.runPromise
  )
});
var confectActionFunction = ({
  args,
  returns,
  handler
}) => ({
  args: compileArgsSchema(args),
  returns: compileReturnsSchema(returns),
  handler: (ctx, actualArgs) => pipe3(
    actualArgs,
    Schema2.decode(args),
    Effect6.orDie,
    Effect6.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        Effect6.provideService(
          ConfectActionCtx(),
          makeConfectActionCtx(ctx)
        )
      )
    ),
    Effect6.andThen(
      (convexReturns) => Schema2.encodeUnknown(returns)(convexReturns)
    ),
    Effect6.runPromise
  )
});

// src/server/http.ts
import {
  HttpApiBuilder,
  HttpApiScalar,
  HttpServer
} from "@effect/platform";
import {
  httpActionGeneric,
  httpRouter,
  ROUTABLE_HTTP_METHODS
} from "convex/server";
import { Array as Array2, Layer, pipe as pipe4, Record as Record2 } from "effect";
var makeHandler = ({
  pathPrefix,
  apiLive,
  middleware,
  scalar
}) => (ctx, request) => {
  const ConfectActionCtxLive = Layer.succeed(
    ConfectActionCtx(),
    makeConfectActionCtx(ctx)
  );
  const ApiLive = apiLive.pipe(Layer.provide(ConfectActionCtxLive));
  const ApiDocsLive = HttpApiScalar.layer({
    path: `${pathPrefix}docs`,
    scalar: {
      baseServerURL: `${// biome-ignore lint/complexity/useLiteralKeys: TS says this must be accessed with a string literal
      process.env["CONVEX_SITE_URL"]}${pathPrefix}`,
      ...scalar
    }
  }).pipe(Layer.provide(ApiLive));
  const EnvLive = Layer.mergeAll(
    ApiLive,
    ApiDocsLive,
    HttpServer.layerContext
  );
  const { handler } = HttpApiBuilder.toWebHandler(EnvLive, { middleware });
  return handler(request);
};
var makeHttpAction = ({
  pathPrefix,
  apiLive,
  middleware,
  scalar
}) => httpActionGeneric(makeHandler({ pathPrefix, apiLive, middleware, scalar }));
var mountEffectHttpApi = ({
  pathPrefix,
  apiLive,
  middleware,
  scalar
}) => (convexHttpRouter) => {
  const handler = makeHttpAction({ pathPrefix, apiLive, middleware, scalar });
  Array2.forEach(ROUTABLE_HTTP_METHODS, (method) => {
    const routeSpec = {
      pathPrefix,
      method,
      handler
    };
    convexHttpRouter.route(routeSpec);
  });
  return convexHttpRouter;
};
var makeHttpRouter = (httpApis) => {
  applyMonkeyPatches();
  return pipe4(
    httpApis,
    Record2.toEntries,
    Array2.reduce(
      httpRouter(),
      (convexHttpRouter, [pathPrefix, { apiLive, middleware }]) => mountEffectHttpApi({
        pathPrefix,
        apiLive,
        middleware
      })(convexHttpRouter)
    )
  );
};
var applyMonkeyPatches = () => {
  URL = class extends URL {
    get username() {
      return "";
    }
    get password() {
      return "";
    }
  };
  Object.defineProperty(Request.prototype, "signal", {
    get: () => new AbortSignal()
  });
};

// src/server/schemas/PaginationResult.ts
var PaginationResult_exports = {};
__export(PaginationResult_exports, {
  PaginationResult: () => PaginationResult
});
import { Schema as Schema3 } from "effect";
var PaginationResult = (Doc) => Schema3.Struct({
  page: Schema3.Array(Doc).pipe(Schema3.mutable),
  isDone: Schema3.Boolean,
  continueCursor: Schema3.String,
  splitCursor: Schema3.optional(Schema3.Union(Schema3.String, Schema3.Null)),
  pageStatus: Schema3.optional(
    Schema3.Union(
      Schema3.Literal("SplitRecommended"),
      Schema3.Literal("SplitRequired"),
      Schema3.Null
    )
  )
}).pipe(Schema3.mutable);
export {
  ConfectActionCtx,
  ConfectMutationCtx,
  ConfectQueryCtx,
  Id_exports as Id,
  NotUniqueError,
  PaginationResult_exports as PaginationResult,
  compileSchema,
  defineSchema,
  defineTable,
  makeFunctions,
  makeHttpRouter
};
//# sourceMappingURL=index.js.map