"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server/index.ts
var server_exports = {};
__export(server_exports, {
  ConfectActionCtx: () => ConfectActionCtx,
  ConfectMutationCtx: () => ConfectMutationCtx,
  ConfectQueryCtx: () => ConfectQueryCtx,
  Id: () => Id_exports,
  NotUniqueError: () => NotUniqueError,
  PaginationResult: () => PaginationResult_exports,
  compileSchema: () => compileSchema,
  defineSchema: () => defineSchema,
  defineTable: () => defineTable,
  makeFunctions: () => makeFunctions,
  makeHttpRouter: () => makeHttpRouter
});
module.exports = __toCommonJS(server_exports);

// src/server/ctx.ts
var import_effect9 = require("effect");

// src/server/auth.ts
var import_effect = require("effect");
var ConfectAuthImpl = class {
  constructor(auth) {
    this.auth = auth;
  }
  getUserIdentity() {
    return (0, import_effect.pipe)(
      import_effect.Effect.promise(() => this.auth.getUserIdentity()),
      import_effect.Effect.map(import_effect.Option.fromNullable)
    );
  }
};

// src/server/database.ts
var import_effect6 = require("effect");

// src/server/schema.ts
var import_server = require("convex/server");
var import_effect5 = require("effect");

// src/server/schema-to-validator.ts
var import_values = require("convex/values");
var import_effect3 = require("effect");
var import_Predicate = require("effect/Predicate");

// src/server/schemas/Id.ts
var Id_exports = {};
__export(Id_exports, {
  Id: () => Id,
  tableName: () => tableName
});
var import_effect2 = require("effect");
var ConvexId = Symbol.for("ConvexId");
var Id = (tableName2) => import_effect2.Schema.String.pipe(
  import_effect2.Schema.annotations({ [ConvexId]: tableName2 })
);
var tableName = (ast) => import_effect2.SchemaAST.getAnnotation(ConvexId)(ast);

// src/server/schema-to-validator.ts
var compileArgsSchema = (argsSchema) => {
  const ast = import_effect3.Schema.encodedSchema(argsSchema).ast;
  return (0, import_effect3.pipe)(
    ast,
    import_effect3.Match.value,
    import_effect3.Match.tag(
      "TypeLiteral",
      (typeLiteralAst) => import_effect3.Array.isEmptyReadonlyArray(typeLiteralAst.indexSignatures) ? handlePropertySignatures(typeLiteralAst) : import_effect3.Effect.fail(new IndexSignaturesAreNotSupportedError())
    ),
    import_effect3.Match.orElse(() => import_effect3.Effect.fail(new TopLevelMustBeObjectError())),
    runSyncThrow
  );
};
var compileReturnsSchema = (schema) => runSyncThrow(compileAst(import_effect3.Schema.encodedSchema(schema).ast));
var compileTableSchema = (schema) => {
  const ast = import_effect3.Schema.encodedSchema(schema).ast;
  return (0, import_effect3.pipe)(
    ast,
    import_effect3.Match.value,
    import_effect3.Match.tag(
      "TypeLiteral",
      ({ indexSignatures }) => import_effect3.Array.isEmptyReadonlyArray(indexSignatures) ? compileAst(ast) : import_effect3.Effect.fail(new IndexSignaturesAreNotSupportedError())
    ),
    import_effect3.Match.tag("Union", (unionAst) => compileAst(unionAst)),
    import_effect3.Match.orElse(() => import_effect3.Effect.fail(new TopLevelMustBeObjectOrUnionError())),
    runSyncThrow
  );
};
var compileSchema = (schema) => runSyncThrow(compileAst(schema.ast));
var isRecursive = (ast) => (0, import_effect3.pipe)(
  ast,
  import_effect3.Match.value,
  import_effect3.Match.tag(
    "Literal",
    "BooleanKeyword",
    "StringKeyword",
    "NumberKeyword",
    "BigIntKeyword",
    "UnknownKeyword",
    "AnyKeyword",
    "Declaration",
    "UniqueSymbol",
    "SymbolKeyword",
    "UndefinedKeyword",
    "VoidKeyword",
    "NeverKeyword",
    "Enums",
    "TemplateLiteral",
    "ObjectKeyword",
    "Transformation",
    () => false
  ),
  import_effect3.Match.tag(
    "Union",
    ({ types }) => import_effect3.Array.some(types, (type) => isRecursive(type))
  ),
  import_effect3.Match.tag(
    "TypeLiteral",
    ({ propertySignatures }) => import_effect3.Array.some(propertySignatures, ({ type }) => isRecursive(type))
  ),
  import_effect3.Match.tag(
    "TupleType",
    ({ elements: optionalElements, rest: elements }) => import_effect3.Array.some(
      optionalElements,
      (optionalElement) => isRecursive(optionalElement.type)
    ) || import_effect3.Array.some(elements, (element) => isRecursive(element.type))
  ),
  import_effect3.Match.tag("Refinement", ({ from }) => isRecursive(from)),
  import_effect3.Match.tag("Suspend", () => true),
  import_effect3.Match.exhaustive
);
var compileAst = (ast, isOptionalPropertyOfTypeLiteral = false) => isRecursive(ast) ? import_effect3.Effect.succeed(import_values.v.any()) : (0, import_effect3.pipe)(
  ast,
  import_effect3.Match.value,
  import_effect3.Match.tag(
    "Literal",
    ({ literal }) => (0, import_effect3.pipe)(
      literal,
      import_effect3.Match.value,
      import_effect3.Match.whenOr(
        import_effect3.Match.string,
        import_effect3.Match.number,
        import_effect3.Match.bigint,
        import_effect3.Match.boolean,
        (l) => import_values.v.literal(l)
      ),
      import_effect3.Match.when(import_effect3.Match.null, () => import_values.v.null()),
      import_effect3.Match.exhaustive,
      import_effect3.Effect.succeed
    )
  ),
  import_effect3.Match.tag("BooleanKeyword", () => import_effect3.Effect.succeed(import_values.v.boolean())),
  import_effect3.Match.tag(
    "StringKeyword",
    (stringAst) => tableName(stringAst).pipe(
      import_effect3.Option.match({
        onNone: () => import_effect3.Effect.succeed(import_values.v.string()),
        onSome: (tableName2) => import_effect3.Effect.succeed(import_values.v.id(tableName2))
      })
    )
  ),
  import_effect3.Match.tag("NumberKeyword", () => import_effect3.Effect.succeed(import_values.v.float64())),
  import_effect3.Match.tag("BigIntKeyword", () => import_effect3.Effect.succeed(import_values.v.int64())),
  import_effect3.Match.tag(
    "Union",
    (unionAst) => handleUnion(unionAst, isOptionalPropertyOfTypeLiteral)
  ),
  import_effect3.Match.tag(
    "TypeLiteral",
    (typeLiteralAst) => handleTypeLiteral(typeLiteralAst)
  ),
  import_effect3.Match.tag("TupleType", (tupleTypeAst) => handleTupleType(tupleTypeAst)),
  import_effect3.Match.tag(
    "UnknownKeyword",
    "AnyKeyword",
    () => import_effect3.Effect.succeed(import_values.v.any())
  ),
  import_effect3.Match.tag(
    "Declaration",
    (declaration) => import_effect3.Effect.mapBoth(
      declaration.decodeUnknown(...declaration.typeParameters)(
        new ArrayBuffer(0),
        {},
        declaration
      ),
      {
        onSuccess: () => import_values.v.bytes(),
        onFailure: () => new UnsupportedSchemaTypeError({
          schemaType: declaration._tag
        })
      }
    )
  ),
  import_effect3.Match.tag("Refinement", ({ from }) => compileAst(from)),
  /* v8 ignore next -- @preserve */
  import_effect3.Match.tag(
    "Suspend",
    () => import_effect3.Effect.dieMessage(
      "Suspended schema should have already been handled by recursion check; this should be impossible."
    )
  ),
  import_effect3.Match.tag(
    "UniqueSymbol",
    "SymbolKeyword",
    "UndefinedKeyword",
    "VoidKeyword",
    "NeverKeyword",
    "Enums",
    "TemplateLiteral",
    "ObjectKeyword",
    "Transformation",
    () => import_effect3.Effect.fail(
      new UnsupportedSchemaTypeError({
        schemaType: ast._tag
      })
    )
  ),
  import_effect3.Match.exhaustive
);
var handleUnion = ({ types: [first, second, ...rest] }, isOptionalPropertyOfTypeLiteral) => import_effect3.Effect.gen(function* () {
  const validatorEffects = isOptionalPropertyOfTypeLiteral ? import_effect3.Array.filterMap(
    [first, second, ...rest],
    (type) => (0, import_Predicate.not)(import_effect3.SchemaAST.isUndefinedKeyword)(type) ? import_effect3.Option.some(compileAst(type)) : import_effect3.Option.none()
  ) : import_effect3.Array.map([first, second, ...rest], (type) => compileAst(type));
  const [firstValidator, secondValidator, ...restValidators] = yield* import_effect3.Effect.all(validatorEffects);
  if (firstValidator === void 0) {
    return yield* import_effect3.Effect.dieMessage(
      "First validator of union is undefined; this should be impossible."
    );
  } else if (secondValidator === void 0) {
    return firstValidator;
  } else {
    return import_values.v.union(firstValidator, secondValidator, ...restValidators);
  }
});
var handleTypeLiteral = (typeLiteralAst) => (0, import_effect3.pipe)(
  typeLiteralAst.indexSignatures,
  import_effect3.Array.head,
  import_effect3.Option.match({
    onNone: () => (0, import_effect3.pipe)(handlePropertySignatures(typeLiteralAst), import_effect3.Effect.map(import_values.v.object)),
    /* v8 ignore next -- @preserve */
    onSome: () => import_effect3.Effect.fail(new IndexSignaturesAreNotSupportedError())
  })
);
var handleTupleType = ({ elements, rest }) => import_effect3.Effect.gen(function* () {
  const restValidator = (0, import_effect3.pipe)(
    rest,
    import_effect3.Array.head,
    import_effect3.Option.map(({ type }) => compileAst(type)),
    import_effect3.Effect.flatten
  );
  const [f, s, ...r] = elements;
  const elementToValidator = ({ type, isOptional }) => import_effect3.Effect.if(isOptional, {
    onTrue: () => import_effect3.Effect.fail(new OptionalTupleElementsAreNotSupportedError()),
    onFalse: () => compileAst(type)
  });
  const arrayItemsValidator = yield* f === void 0 ? (0, import_effect3.pipe)(
    restValidator,
    import_effect3.Effect.catchTag(
      "NoSuchElementException",
      () => import_effect3.Effect.fail(new EmptyTupleIsNotSupportedError())
    )
  ) : s === void 0 ? elementToValidator(f) : import_effect3.Effect.gen(function* () {
    const firstValidator = yield* elementToValidator(f);
    const secondValidator = yield* elementToValidator(s);
    const restValidators = yield* import_effect3.Effect.forEach(r, elementToValidator);
    return import_values.v.union(firstValidator, secondValidator, ...restValidators);
  });
  return import_values.v.array(arrayItemsValidator);
});
var handlePropertySignatures = (typeLiteralAst) => (0, import_effect3.pipe)(
  typeLiteralAst.propertySignatures,
  // biome-ignore lint/suspicious/useIterableCallbackReturn: False positive.
  import_effect3.Effect.forEach(({ type, name, isOptional }) => {
    if (import_effect3.String.isString(name)) {
      return import_effect3.Option.match(import_effect3.Number.parse(name), {
        onNone: () => import_effect3.Effect.gen(function* () {
          const validator = yield* compileAst(type, isOptional);
          return {
            propertyName: name,
            validator: isOptional ? import_values.v.optional(validator) : validator
          };
        }),
        onSome: (number) => import_effect3.Effect.fail(
          new UnsupportedPropertySignatureKeyTypeError({
            propertyKey: number
          })
        )
      });
    } else {
      return import_effect3.Effect.fail(
        new UnsupportedPropertySignatureKeyTypeError({ propertyKey: name })
      );
    }
  }),
  import_effect3.Effect.andThen(
    (propertyNamesWithValidators) => (0, import_effect3.pipe)(
      propertyNamesWithValidators,
      import_effect3.Array.reduce(
        {},
        (acc, { propertyName, validator }) => ({
          [propertyName]: validator,
          ...acc
        })
      ),
      import_effect3.Effect.succeed
    )
  )
);
var runSyncThrow = (effect) => (0, import_effect3.pipe)(
  effect,
  import_effect3.Effect.runSyncExit,
  import_effect3.Exit.match({
    onSuccess: (validator) => validator,
    onFailure: (cause) => {
      throw import_effect3.Cause.squash(cause);
    }
  })
);
var TopLevelMustBeObjectError = class extends import_effect3.Data.TaggedError(
  "TopLevelMustBeObjectError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Top level schema must be an object";
  }
};
var TopLevelMustBeObjectOrUnionError = class extends import_effect3.Data.TaggedError(
  "TopLevelMustBeObjectOrUnionError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Top level schema must be an object or a union";
  }
};
var UnsupportedPropertySignatureKeyTypeError = class extends import_effect3.Data.TaggedError(
  "UnsupportedPropertySignatureKeyTypeError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return `Unsupported property signature '${this.propertyKey.toString()}'. Property is of type '${typeof this.propertyKey}' but only 'string' properties are supported.`;
  }
};
var EmptyTupleIsNotSupportedError = class extends import_effect3.Data.TaggedError(
  "EmptyTupleIsNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Tuple must have at least one element";
  }
};
var UnsupportedSchemaTypeError = class extends import_effect3.Data.TaggedError(
  "UnsupportedSchemaTypeError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return `Unsupported schema type '${this.schemaType}'`;
  }
};
var IndexSignaturesAreNotSupportedError = class extends import_effect3.Data.TaggedError(
  "IndexSignaturesAreNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Index signatures are not supported";
  }
};
var OptionalTupleElementsAreNotSupportedError = class extends import_effect3.Data.TaggedError(
  "OptionalTupleElementsAreNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Optional tuple elements are not supported";
  }
};

// src/server/schemas/SystemFields.ts
var import_effect4 = require("effect");
var SystemFields = (tableName2) => import_effect4.Schema.Struct({
  _id: Id(tableName2),
  _creationTime: import_effect4.Schema.Number
});
var extendWithSystemFields = (tableName2, schema) => import_effect4.Schema.extend(schema, SystemFields(tableName2));

// src/server/schema.ts
var confectTableSchemas = {
  _scheduled_functions: import_effect5.Schema.Struct({
    name: import_effect5.Schema.String,
    args: import_effect5.Schema.Array(import_effect5.Schema.Any),
    scheduledTime: import_effect5.Schema.Number,
    completedTime: import_effect5.Schema.optional(import_effect5.Schema.Number),
    state: import_effect5.Schema.Union(
      import_effect5.Schema.Struct({ kind: import_effect5.Schema.Literal("pending") }),
      import_effect5.Schema.Struct({ kind: import_effect5.Schema.Literal("inProgress") }),
      import_effect5.Schema.Struct({ kind: import_effect5.Schema.Literal("success") }),
      import_effect5.Schema.Struct({
        kind: import_effect5.Schema.Literal("failed"),
        error: import_effect5.Schema.String
      }),
      import_effect5.Schema.Struct({ kind: import_effect5.Schema.Literal("canceled") })
    )
  }),
  _storage: import_effect5.Schema.Struct({
    sha256: import_effect5.Schema.String,
    size: import_effect5.Schema.Number,
    contentType: import_effect5.Schema.optional(import_effect5.Schema.String)
  })
};
var tableSchemasFromConfectSchema = (confectSchema) => ({
  ...import_effect5.Record.map(confectSchema, ({ tableSchema }, tableName2) => ({
    withSystemFields: extendWithSystemFields(tableName2, tableSchema),
    withoutSystemFields: tableSchema
  })),
  ...import_effect5.Record.map(confectTableSchemas, (tableSchema, tableName2) => ({
    withSystemFields: extendWithSystemFields(tableName2, tableSchema),
    withoutSystemFields: tableSchema
  }))
});
var ConfectSchemaDefinitionImpl = class {
  confectSchema;
  convexSchemaDefinition;
  tableSchemas;
  constructor(confectSchema) {
    this.confectSchema = confectSchema;
    this.convexSchemaDefinition = (0, import_effect5.pipe)(
      confectSchema,
      import_effect5.Record.map(({ tableDefinition }) => tableDefinition),
      import_server.defineSchema
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
    this.tableDefinition = (0, import_server.defineTable)(tableValidator);
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

// src/server/database.ts
var NotUniqueError = class extends import_effect6.Data.TaggedError("NotUniqueError") {
};
var ConfectQueryImpl = class _ConfectQueryImpl {
  q;
  tableSchema;
  tableName;
  constructor(q, tableSchema, tableName2) {
    this.q = q;
    this.tableSchema = tableSchema;
    this.tableName = tableName2;
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
    return (0, import_effect6.pipe)(
      import_effect6.Effect.Do,
      import_effect6.Effect.bind(
        "paginationResult",
        () => import_effect6.Effect.promise(() => this.q.paginate(paginationOpts))
      ),
      import_effect6.Effect.let(
        "parsedPage",
        ({ paginationResult }) => (0, import_effect6.pipe)(
          paginationResult.page,
          import_effect6.Array.map((document) => this.decode(document))
        )
      ),
      import_effect6.Effect.map(({ paginationResult, parsedPage }) => ({
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
    return (0, import_effect6.pipe)(
      import_effect6.Effect.promise(() => this.q.collect()),
      import_effect6.Effect.map(import_effect6.Array.map((document) => this.decode(document)))
    );
  }
  take(n) {
    return (0, import_effect6.pipe)(
      this.stream(),
      import_effect6.Stream.take(n),
      import_effect6.Stream.runCollect,
      import_effect6.Effect.map((chunk) => import_effect6.Chunk.toArray(chunk))
    );
  }
  first() {
    return (0, import_effect6.pipe)(this.stream(), import_effect6.Stream.runHead);
  }
  unique() {
    return (0, import_effect6.pipe)(
      this.stream(),
      import_effect6.Stream.take(2),
      import_effect6.Stream.runCollect,
      import_effect6.Effect.andThen(
        (chunk) => (0, import_effect6.pipe)(
          chunk,
          import_effect6.Chunk.get(1),
          import_effect6.Option.match({
            onSome: () => import_effect6.Effect.fail(new NotUniqueError()),
            onNone: () => import_effect6.Effect.succeed(import_effect6.Chunk.get(chunk, 0))
          })
        )
      )
    );
  }
  stream() {
    return (0, import_effect6.pipe)(
      import_effect6.Stream.fromAsyncIterable(this.q, import_effect6.identity),
      import_effect6.Stream.map((document) => this.decode(document)),
      import_effect6.Stream.orDie
    );
  }
};
var ConfectQueryInitializerImpl = class {
  q;
  tableSchema;
  tableName;
  constructor(q, tableSchema, tableName2) {
    this.q = q;
    this.tableSchema = tableSchema;
    this.tableName = tableName2;
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
  decode(tableName2, convexDocument) {
    return decodeDocument(
      tableName2,
      this.databaseSchemas[tableName2],
      convexDocument
    );
  }
  tableName(id) {
    return import_effect6.Array.findFirst(
      import_effect6.Record.keys(this.databaseSchemas),
      (tableName2) => import_effect6.Option.isSome(this.normalizeId(tableName2, id))
    );
  }
  normalizeId(tableName2, id) {
    return import_effect6.Option.fromNullable(this.db.normalizeId(tableName2, id));
  }
  get(id) {
    return import_effect6.Effect.gen(this, function* () {
      const optionConvexDoc = yield* import_effect6.Effect.promise(() => this.db.get(id)).pipe(
        import_effect6.Effect.map(import_effect6.Option.fromNullable)
      );
      const tableName2 = yield* this.tableName(id).pipe(import_effect6.Effect.orDie);
      return (0, import_effect6.pipe)(
        optionConvexDoc,
        import_effect6.Option.map((convexDoc) => this.decode(tableName2, convexDoc))
      );
    });
  }
  query(tableName2) {
    return new ConfectQueryInitializerImpl(
      this.db.query(tableName2),
      this.databaseSchemas[tableName2],
      tableName2
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
  decode(tableName2, convexDocument) {
    return decodeDocument(
      tableName2,
      this.databaseSchemas[tableName2],
      convexDocument
    );
  }
  tableName(id) {
    return import_effect6.Array.findFirst(
      import_effect6.Record.keys(this.databaseSchemas),
      (tableName2) => import_effect6.Option.isSome(this.normalizeId(tableName2, id))
    );
  }
  normalizeId(tableName2, id) {
    return import_effect6.Option.fromNullable(this.db.normalizeId(tableName2, id));
  }
  get(id) {
    return import_effect6.Effect.gen(this, function* () {
      const optionConvexDoc = yield* import_effect6.Effect.promise(() => this.db.get(id)).pipe(
        import_effect6.Effect.map(import_effect6.Option.fromNullable)
      );
      const tableName2 = yield* this.tableName(id).pipe(import_effect6.Effect.orDie);
      return (0, import_effect6.pipe)(
        optionConvexDoc,
        import_effect6.Option.map((convexDoc) => this.decode(tableName2, convexDoc))
      );
    });
  }
  query(tableName2) {
    return new ConfectQueryInitializerImpl(
      this.db.query(tableName2),
      this.databaseSchemas[tableName2],
      tableName2
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
    return import_effect6.Array.findFirst(
      import_effect6.Record.keys(this.databaseSchemas),
      (tableName2) => import_effect6.Option.isSome(this.normalizeId(tableName2, id))
    );
  }
  query(tableName2) {
    return this.reader.query(tableName2);
  }
  get(id) {
    return this.reader.get(id);
  }
  normalizeId(tableName2, id) {
    return import_effect6.Option.fromNullable(this.db.normalizeId(tableName2, id));
  }
  insert(table, value) {
    return (0, import_effect6.pipe)(
      value,
      import_effect6.Schema.encode(this.databaseSchemas[table]),
      import_effect6.Effect.andThen(
        (encodedValue) => import_effect6.Effect.promise(
          () => this.db.insert(
            table,
            encodedValue
          )
        )
      )
    );
  }
  patch(id, value) {
    return import_effect6.Effect.gen(this, function* () {
      const tableName2 = yield* this.tableName(id);
      const tableSchema = this.databaseSchemas[tableName2];
      const originalConvexDoc = yield* import_effect6.Effect.promise(
        () => this.db.get(id)
      ).pipe(
        import_effect6.Effect.andThen(
          (doc) => doc ? import_effect6.Effect.succeed(doc) : import_effect6.Effect.die(new InvalidIdProvidedForPatch())
        )
      );
      const originalConfectDoc = yield* import_effect6.Schema.decodeUnknown(tableSchema)(originalConvexDoc);
      const updatedConvexDoc = yield* (0, import_effect6.pipe)(
        value,
        import_effect6.Record.reduce(
          originalConfectDoc,
          (acc, value2, key) => value2 === void 0 ? import_effect6.Record.remove(acc, key) : import_effect6.Record.set(acc, key, value2)
        ),
        import_effect6.Schema.encodeUnknown(tableSchema)
      );
      yield* import_effect6.Effect.promise(
        () => this.db.replace(
          id,
          updatedConvexDoc
        )
      );
    });
  }
  replace(id, value) {
    return import_effect6.Effect.promise(() => this.db.replace(id, value));
  }
  delete(id) {
    return import_effect6.Effect.promise(() => this.db.delete(id));
  }
};
var databaseSchemasFromConfectSchema = (confectSchema) => import_effect6.Record.map(
  confectSchema,
  ({ tableSchema }) => tableSchema
);
var InvalidIdProvidedForPatch = class extends import_effect6.Data.TaggedError(
  "InvalidIdProvidedForPatch"
) {
};
var decodeDocument = (tableName2, tableSchema, convexDocument) => import_effect6.Schema.decodeUnknownSync(extendWithSystemFields(tableName2, tableSchema), {
  onExcessProperty: "error"
})(convexDocument);

// src/server/scheduler.ts
var import_effect7 = require("effect");
var ConfectSchedulerImpl = class {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }
  runAfter(delayMs, functionReference, ...args) {
    return import_effect7.Effect.promise(
      () => this.scheduler.runAfter(delayMs, functionReference, ...args)
    );
  }
  runAt(timestamp, functionReference, ...args) {
    return import_effect7.Effect.promise(
      () => this.scheduler.runAt(timestamp, functionReference, ...args)
    );
  }
};

// src/server/storage.ts
var import_effect8 = require("effect");
var ConfectStorageReaderImpl = class {
  constructor(storageReader) {
    this.storageReader = storageReader;
  }
  getUrl(storageId) {
    return import_effect8.Effect.promise(() => this.storageReader.getUrl(storageId)).pipe(
      import_effect8.Effect.map(import_effect8.Option.fromNullable)
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
    return import_effect8.Effect.promise(() => this.storageWriter.generateUploadUrl());
  }
  delete(storageId) {
    return import_effect8.Effect.promise(() => this.storageWriter.delete(storageId));
  }
};

// src/server/ctx.ts
var ConfectMutationCtx = () => import_effect9.Context.GenericTag(
  "@rjdellecese/confect/ConfectMutationCtx"
);
var ConfectQueryCtx = () => import_effect9.Context.GenericTag(
  "@rjdellecese/confect/ConfectQueryCtx"
);
var ConfectActionCtx = () => import_effect9.Context.GenericTag(
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
  runQuery: (query, ...queryArgs) => import_effect9.Effect.promise(() => ctx.runQuery(query, ...queryArgs)),
  runMutation: (mutation, ...mutationArgs) => import_effect9.Effect.promise(() => ctx.runMutation(mutation, ...mutationArgs)),
  runAction: (action, ...actionArgs) => import_effect9.Effect.promise(() => ctx.runAction(action, ...actionArgs)),
  vectorSearch: (tableName2, indexName, query) => import_effect9.Effect.promise(() => ctx.vectorSearch(tableName2, indexName, query)),
  ctx,
  auth: new ConfectAuthImpl(ctx.auth),
  storage: new ConfectStorageWriterImpl(ctx.storage),
  scheduler: new ConfectSchedulerImpl(ctx.scheduler)
});

// src/server/functions.ts
var import_server2 = require("convex/server");
var import_effect10 = require("effect");
var makeFunctions = (confectSchemaDefinition) => {
  const databaseSchemas = databaseSchemasFromConfectSchema(
    confectSchemaDefinition.confectSchema
  );
  const query = ({
    args,
    returns,
    handler
  }) => (0, import_server2.queryGeneric)(
    confectQueryFunction({ databaseSchemas, args, returns, handler })
  );
  const internalQuery = ({
    args,
    handler,
    returns
  }) => (0, import_server2.internalQueryGeneric)(
    confectQueryFunction({ databaseSchemas, args, returns, handler })
  );
  const mutation = ({
    args,
    returns,
    handler
  }) => (0, import_server2.mutationGeneric)(
    confectMutationFunction({ databaseSchemas, args, returns, handler })
  );
  const internalMutation = ({
    args,
    returns,
    handler
  }) => (0, import_server2.internalMutationGeneric)(
    confectMutationFunction({ databaseSchemas, args, returns, handler })
  );
  const action = ({
    args,
    returns,
    handler
  }) => (0, import_server2.actionGeneric)(confectActionFunction({ args, returns, handler }));
  const internalAction = ({
    args,
    returns,
    handler
  }) => (0, import_server2.internalActionGeneric)(confectActionFunction({ args, returns, handler }));
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
  handler: (ctx, actualArgs) => (0, import_effect10.pipe)(
    actualArgs,
    import_effect10.Schema.decode(args),
    import_effect10.Effect.orDie,
    import_effect10.Effect.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        import_effect10.Effect.provideService(
          ConfectQueryCtx(),
          makeConfectQueryCtx(ctx, databaseSchemas)
        )
      )
    ),
    import_effect10.Effect.andThen(
      (convexReturns) => import_effect10.Schema.encodeUnknown(returns)(convexReturns)
    ),
    import_effect10.Effect.runPromise
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
  handler: (ctx, actualArgs) => (0, import_effect10.pipe)(
    actualArgs,
    import_effect10.Schema.decode(args),
    import_effect10.Effect.orDie,
    import_effect10.Effect.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        import_effect10.Effect.provideService(
          ConfectQueryCtx(),
          makeConfectQueryCtx(ctx, databaseSchemas)
        ),
        import_effect10.Effect.provideService(
          ConfectMutationCtx(),
          makeConfectMutationCtx(ctx, databaseSchemas)
        )
      )
    ),
    import_effect10.Effect.andThen(
      (convexReturns) => import_effect10.Schema.encodeUnknown(returns)(convexReturns)
    ),
    import_effect10.Effect.runPromise
  )
});
var confectActionFunction = ({
  args,
  returns,
  handler
}) => ({
  args: compileArgsSchema(args),
  returns: compileReturnsSchema(returns),
  handler: (ctx, actualArgs) => (0, import_effect10.pipe)(
    actualArgs,
    import_effect10.Schema.decode(args),
    import_effect10.Effect.orDie,
    import_effect10.Effect.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        import_effect10.Effect.provideService(
          ConfectActionCtx(),
          makeConfectActionCtx(ctx)
        )
      )
    ),
    import_effect10.Effect.andThen(
      (convexReturns) => import_effect10.Schema.encodeUnknown(returns)(convexReturns)
    ),
    import_effect10.Effect.runPromise
  )
});

// src/server/http.ts
var import_platform = require("@effect/platform");
var import_server3 = require("convex/server");
var import_effect11 = require("effect");
var makeHandler = ({
  pathPrefix,
  apiLive,
  middleware,
  scalar
}) => (ctx, request) => {
  const ConfectActionCtxLive = import_effect11.Layer.succeed(
    ConfectActionCtx(),
    makeConfectActionCtx(ctx)
  );
  const ApiLive = apiLive.pipe(import_effect11.Layer.provide(ConfectActionCtxLive));
  const ApiDocsLive = import_platform.HttpApiScalar.layer({
    path: `${pathPrefix}docs`,
    scalar: {
      baseServerURL: `${// biome-ignore lint/complexity/useLiteralKeys: TS says this must be accessed with a string literal
      process.env["CONVEX_SITE_URL"]}${pathPrefix}`,
      ...scalar
    }
  }).pipe(import_effect11.Layer.provide(ApiLive));
  const EnvLive = import_effect11.Layer.mergeAll(
    ApiLive,
    ApiDocsLive,
    import_platform.HttpServer.layerContext
  );
  const { handler } = import_platform.HttpApiBuilder.toWebHandler(EnvLive, { middleware });
  return handler(request);
};
var makeHttpAction = ({
  pathPrefix,
  apiLive,
  middleware,
  scalar
}) => (0, import_server3.httpActionGeneric)(makeHandler({ pathPrefix, apiLive, middleware, scalar }));
var mountEffectHttpApi = ({
  pathPrefix,
  apiLive,
  middleware,
  scalar
}) => (convexHttpRouter) => {
  const handler = makeHttpAction({ pathPrefix, apiLive, middleware, scalar });
  import_effect11.Array.forEach(import_server3.ROUTABLE_HTTP_METHODS, (method) => {
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
  return (0, import_effect11.pipe)(
    httpApis,
    import_effect11.Record.toEntries,
    import_effect11.Array.reduce(
      (0, import_server3.httpRouter)(),
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
var import_effect12 = require("effect");
var PaginationResult = (Doc) => import_effect12.Schema.Struct({
  page: import_effect12.Schema.Array(Doc).pipe(import_effect12.Schema.mutable),
  isDone: import_effect12.Schema.Boolean,
  continueCursor: import_effect12.Schema.String,
  splitCursor: import_effect12.Schema.optional(import_effect12.Schema.Union(import_effect12.Schema.String, import_effect12.Schema.Null)),
  pageStatus: import_effect12.Schema.optional(
    import_effect12.Schema.Union(
      import_effect12.Schema.Literal("SplitRecommended"),
      import_effect12.Schema.Literal("SplitRequired"),
      import_effect12.Schema.Null
    )
  )
}).pipe(import_effect12.Schema.mutable);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConfectActionCtx,
  ConfectMutationCtx,
  ConfectQueryCtx,
  Id,
  NotUniqueError,
  PaginationResult,
  compileSchema,
  defineSchema,
  defineTable,
  makeFunctions,
  makeHttpRouter
});
/* v8 ignore next -- @preserve */
/* v8 ignore if -- @preserve */
//# sourceMappingURL=index.cjs.map