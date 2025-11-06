import {
  __export
} from "../chunk-PZ5AY32C.js";

// src/server/ctx.ts
import { Context, Effect as Effect6 } from "effect";

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
  Array as Array2,
  Chunk,
  Data as Data2,
  Effect as Effect3,
  identity,
  Option as Option3,
  pipe as pipe4,
  Record as Record2,
  Schema as Schema5,
  Stream
} from "effect";

// src/server/schema.ts
import {
  defineSchema as defineConvexSchema,
  defineTable as defineConvexTable
} from "convex/server";
import { pipe as pipe3, Record, Schema as Schema4 } from "effect";

// src/server/schema-to-validator.ts
import { v } from "convex/values";
import {
  Array,
  Cause,
  Data,
  Effect as Effect2,
  Exit,
  Match,
  Number,
  Option as Option2,
  pipe as pipe2,
  Schema as Schema2,
  SchemaAST as SchemaAST2,
  String
} from "effect";
import { not } from "effect/Predicate";

// src/server/schemas/Id.ts
var Id_exports = {};
__export(Id_exports, {
  Id: () => Id,
  tableName: () => tableName
});
import { Schema, SchemaAST } from "effect";
var ConvexId = Symbol.for("ConvexId");
var Id = (tableName2) => Schema.String.pipe(
  Schema.annotations({ [ConvexId]: tableName2 })
);
var tableName = (ast) => SchemaAST.getAnnotation(ConvexId)(ast);

// src/server/schema-to-validator.ts
var compileArgsSchema = (argsSchema) => {
  const ast = Schema2.encodedSchema(argsSchema).ast;
  return pipe2(
    ast,
    Match.value,
    Match.tag(
      "TypeLiteral",
      (typeLiteralAst) => Array.isEmptyReadonlyArray(typeLiteralAst.indexSignatures) ? handlePropertySignatures(typeLiteralAst) : Effect2.fail(new IndexSignaturesAreNotSupportedError())
    ),
    Match.orElse(() => Effect2.fail(new TopLevelMustBeObjectError())),
    runSyncThrow
  );
};
var compileReturnsSchema = (schema) => runSyncThrow(compileAst(Schema2.encodedSchema(schema).ast));
var compileTableSchema = (schema) => {
  const ast = Schema2.encodedSchema(schema).ast;
  return pipe2(
    ast,
    Match.value,
    Match.tag(
      "TypeLiteral",
      ({ indexSignatures }) => Array.isEmptyReadonlyArray(indexSignatures) ? compileAst(ast) : Effect2.fail(new IndexSignaturesAreNotSupportedError())
    ),
    Match.tag("Union", (unionAst) => compileAst(unionAst)),
    Match.orElse(() => Effect2.fail(new TopLevelMustBeObjectOrUnionError())),
    runSyncThrow
  );
};
var compileSchema = (schema) => runSyncThrow(compileAst(schema.ast));
var isRecursive = (ast) => pipe2(
  ast,
  Match.value,
  Match.tag(
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
  Match.tag(
    "Union",
    ({ types }) => Array.some(types, (type) => isRecursive(type))
  ),
  Match.tag(
    "TypeLiteral",
    ({ propertySignatures }) => Array.some(propertySignatures, ({ type }) => isRecursive(type))
  ),
  Match.tag(
    "TupleType",
    ({ elements: optionalElements, rest: elements }) => Array.some(
      optionalElements,
      (optionalElement) => isRecursive(optionalElement.type)
    ) || Array.some(elements, (element) => isRecursive(element.type))
  ),
  Match.tag("Refinement", ({ from }) => isRecursive(from)),
  Match.tag("Suspend", () => true),
  Match.exhaustive
);
var compileAst = (ast, isOptionalPropertyOfTypeLiteral = false) => isRecursive(ast) ? Effect2.succeed(v.any()) : pipe2(
  ast,
  Match.value,
  Match.tag(
    "Literal",
    ({ literal }) => pipe2(
      literal,
      Match.value,
      Match.whenOr(
        Match.string,
        Match.number,
        Match.bigint,
        Match.boolean,
        (l) => v.literal(l)
      ),
      Match.when(Match.null, () => v.null()),
      Match.exhaustive,
      Effect2.succeed
    )
  ),
  Match.tag("BooleanKeyword", () => Effect2.succeed(v.boolean())),
  Match.tag(
    "StringKeyword",
    (stringAst) => tableName(stringAst).pipe(
      Option2.match({
        onNone: () => Effect2.succeed(v.string()),
        onSome: (tableName2) => Effect2.succeed(v.id(tableName2))
      })
    )
  ),
  Match.tag("NumberKeyword", () => Effect2.succeed(v.float64())),
  Match.tag("BigIntKeyword", () => Effect2.succeed(v.int64())),
  Match.tag(
    "Union",
    (unionAst) => handleUnion(unionAst, isOptionalPropertyOfTypeLiteral)
  ),
  Match.tag(
    "TypeLiteral",
    (typeLiteralAst) => handleTypeLiteral(typeLiteralAst)
  ),
  Match.tag("TupleType", (tupleTypeAst) => handleTupleType(tupleTypeAst)),
  Match.tag(
    "UnknownKeyword",
    "AnyKeyword",
    () => Effect2.succeed(v.any())
  ),
  Match.tag(
    "Declaration",
    (declaration) => Effect2.mapBoth(
      declaration.decodeUnknown(...declaration.typeParameters)(
        new ArrayBuffer(0),
        {},
        declaration
      ),
      {
        onSuccess: () => v.bytes(),
        onFailure: () => new UnsupportedSchemaTypeError({
          schemaType: declaration._tag
        })
      }
    )
  ),
  Match.tag("Refinement", ({ from }) => compileAst(from)),
  /* v8 ignore next -- @preserve */
  Match.tag(
    "Suspend",
    () => Effect2.dieMessage(
      "Suspended schema should have already been handled by recursion check; this should be impossible."
    )
  ),
  Match.tag(
    "UniqueSymbol",
    "SymbolKeyword",
    "UndefinedKeyword",
    "VoidKeyword",
    "NeverKeyword",
    "Enums",
    "TemplateLiteral",
    "ObjectKeyword",
    "Transformation",
    () => Effect2.fail(
      new UnsupportedSchemaTypeError({
        schemaType: ast._tag
      })
    )
  ),
  Match.exhaustive
);
var handleUnion = ({ types: [first, second, ...rest] }, isOptionalPropertyOfTypeLiteral) => Effect2.gen(function* () {
  const validatorEffects = isOptionalPropertyOfTypeLiteral ? Array.filterMap(
    [first, second, ...rest],
    (type) => not(SchemaAST2.isUndefinedKeyword)(type) ? Option2.some(compileAst(type)) : Option2.none()
  ) : Array.map([first, second, ...rest], (type) => compileAst(type));
  const [firstValidator, secondValidator, ...restValidators] = yield* Effect2.all(validatorEffects);
  if (firstValidator === void 0) {
    return yield* Effect2.dieMessage(
      "First validator of union is undefined; this should be impossible."
    );
  } else if (secondValidator === void 0) {
    return firstValidator;
  } else {
    return v.union(firstValidator, secondValidator, ...restValidators);
  }
});
var handleTypeLiteral = (typeLiteralAst) => pipe2(
  typeLiteralAst.indexSignatures,
  Array.head,
  Option2.match({
    onNone: () => pipe2(handlePropertySignatures(typeLiteralAst), Effect2.map(v.object)),
    /* v8 ignore next -- @preserve */
    onSome: () => Effect2.fail(new IndexSignaturesAreNotSupportedError())
  })
);
var handleTupleType = ({ elements, rest }) => Effect2.gen(function* () {
  const restValidator = pipe2(
    rest,
    Array.head,
    Option2.map(({ type }) => compileAst(type)),
    Effect2.flatten
  );
  const [f, s, ...r] = elements;
  const elementToValidator = ({ type, isOptional }) => Effect2.if(isOptional, {
    onTrue: () => Effect2.fail(new OptionalTupleElementsAreNotSupportedError()),
    onFalse: () => compileAst(type)
  });
  const arrayItemsValidator = yield* f === void 0 ? pipe2(
    restValidator,
    Effect2.catchTag(
      "NoSuchElementException",
      () => Effect2.fail(new EmptyTupleIsNotSupportedError())
    )
  ) : s === void 0 ? elementToValidator(f) : Effect2.gen(function* () {
    const firstValidator = yield* elementToValidator(f);
    const secondValidator = yield* elementToValidator(s);
    const restValidators = yield* Effect2.forEach(r, elementToValidator);
    return v.union(firstValidator, secondValidator, ...restValidators);
  });
  return v.array(arrayItemsValidator);
});
var handlePropertySignatures = (typeLiteralAst) => pipe2(
  typeLiteralAst.propertySignatures,
  // biome-ignore lint/suspicious/useIterableCallbackReturn: False positive.
  Effect2.forEach(({ type, name, isOptional }) => {
    if (String.isString(name)) {
      return Option2.match(Number.parse(name), {
        onNone: () => Effect2.gen(function* () {
          const validator = yield* compileAst(type, isOptional);
          return {
            propertyName: name,
            validator: isOptional ? v.optional(validator) : validator
          };
        }),
        onSome: (number) => Effect2.fail(
          new UnsupportedPropertySignatureKeyTypeError({
            propertyKey: number
          })
        )
      });
    } else {
      return Effect2.fail(
        new UnsupportedPropertySignatureKeyTypeError({ propertyKey: name })
      );
    }
  }),
  Effect2.andThen(
    (propertyNamesWithValidators) => pipe2(
      propertyNamesWithValidators,
      Array.reduce(
        {},
        (acc, { propertyName, validator }) => ({
          [propertyName]: validator,
          ...acc
        })
      ),
      Effect2.succeed
    )
  )
);
var runSyncThrow = (effect) => pipe2(
  effect,
  Effect2.runSyncExit,
  Exit.match({
    onSuccess: (validator) => validator,
    onFailure: (cause) => {
      throw Cause.squash(cause);
    }
  })
);
var TopLevelMustBeObjectError = class extends Data.TaggedError(
  "TopLevelMustBeObjectError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Top level schema must be an object";
  }
};
var TopLevelMustBeObjectOrUnionError = class extends Data.TaggedError(
  "TopLevelMustBeObjectOrUnionError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Top level schema must be an object or a union";
  }
};
var UnsupportedPropertySignatureKeyTypeError = class extends Data.TaggedError(
  "UnsupportedPropertySignatureKeyTypeError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return `Unsupported property signature '${this.propertyKey.toString()}'. Property is of type '${typeof this.propertyKey}' but only 'string' properties are supported.`;
  }
};
var EmptyTupleIsNotSupportedError = class extends Data.TaggedError(
  "EmptyTupleIsNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Tuple must have at least one element";
  }
};
var UnsupportedSchemaTypeError = class extends Data.TaggedError(
  "UnsupportedSchemaTypeError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return `Unsupported schema type '${this.schemaType}'`;
  }
};
var IndexSignaturesAreNotSupportedError = class extends Data.TaggedError(
  "IndexSignaturesAreNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Index signatures are not supported";
  }
};
var OptionalTupleElementsAreNotSupportedError = class extends Data.TaggedError(
  "OptionalTupleElementsAreNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Optional tuple elements are not supported";
  }
};

// src/server/schemas/SystemFields.ts
import { Schema as Schema3 } from "effect";
var SystemFields = (tableName2) => Schema3.Struct({
  _id: Id(tableName2),
  _creationTime: Schema3.Number
});
var extendWithSystemFields = (tableName2, schema) => Schema3.extend(schema, SystemFields(tableName2));

// src/server/schema.ts
var confectTableSchemas = {
  _scheduled_functions: Schema4.Struct({
    name: Schema4.String,
    args: Schema4.Array(Schema4.Any),
    scheduledTime: Schema4.Number,
    completedTime: Schema4.optional(Schema4.Number),
    state: Schema4.Union(
      Schema4.Struct({ kind: Schema4.Literal("pending") }),
      Schema4.Struct({ kind: Schema4.Literal("inProgress") }),
      Schema4.Struct({ kind: Schema4.Literal("success") }),
      Schema4.Struct({
        kind: Schema4.Literal("failed"),
        error: Schema4.String
      }),
      Schema4.Struct({ kind: Schema4.Literal("canceled") })
    )
  }),
  _storage: Schema4.Struct({
    sha256: Schema4.String,
    size: Schema4.Number,
    contentType: Schema4.optional(Schema4.String)
  })
};
var tableSchemasFromConfectSchema = (confectSchema) => ({
  ...Record.map(confectSchema, ({ tableSchema }, tableName2) => ({
    withSystemFields: extendWithSystemFields(tableName2, tableSchema),
    withoutSystemFields: tableSchema
  })),
  ...Record.map(confectTableSchemas, (tableSchema, tableName2) => ({
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
    this.convexSchemaDefinition = pipe3(
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

// src/server/database.ts
var NotUniqueError = class extends Data2.TaggedError("NotUniqueError") {
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
    return pipe4(
      Effect3.Do,
      Effect3.bind(
        "paginationResult",
        () => Effect3.promise(() => this.q.paginate(paginationOpts))
      ),
      Effect3.let(
        "parsedPage",
        ({ paginationResult }) => pipe4(
          paginationResult.page,
          Array2.map((document) => this.decode(document))
        )
      ),
      Effect3.map(({ paginationResult, parsedPage }) => ({
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
    return pipe4(
      Effect3.promise(() => this.q.collect()),
      Effect3.map(Array2.map((document) => this.decode(document)))
    );
  }
  take(n) {
    return pipe4(
      this.stream(),
      Stream.take(n),
      Stream.runCollect,
      Effect3.map((chunk) => Chunk.toArray(chunk))
    );
  }
  first() {
    return pipe4(this.stream(), Stream.runHead);
  }
  unique() {
    return pipe4(
      this.stream(),
      Stream.take(2),
      Stream.runCollect,
      Effect3.andThen(
        (chunk) => pipe4(
          chunk,
          Chunk.get(1),
          Option3.match({
            onSome: () => Effect3.fail(new NotUniqueError()),
            onNone: () => Effect3.succeed(Chunk.get(chunk, 0))
          })
        )
      )
    );
  }
  stream() {
    return pipe4(
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
    return Array2.findFirst(
      Record2.keys(this.databaseSchemas),
      (tableName2) => Option3.isSome(this.normalizeId(tableName2, id))
    );
  }
  normalizeId(tableName2, id) {
    return Option3.fromNullable(this.db.normalizeId(tableName2, id));
  }
  get(id) {
    return Effect3.gen(this, function* () {
      const optionConvexDoc = yield* Effect3.promise(() => this.db.get(id)).pipe(
        Effect3.map(Option3.fromNullable)
      );
      const tableName2 = yield* this.tableName(id).pipe(Effect3.orDie);
      return pipe4(
        optionConvexDoc,
        Option3.map((convexDoc) => this.decode(tableName2, convexDoc))
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
    return Array2.findFirst(
      Record2.keys(this.databaseSchemas),
      (tableName2) => Option3.isSome(this.normalizeId(tableName2, id))
    );
  }
  normalizeId(tableName2, id) {
    return Option3.fromNullable(this.db.normalizeId(tableName2, id));
  }
  get(id) {
    return Effect3.gen(this, function* () {
      const optionConvexDoc = yield* Effect3.promise(() => this.db.get(id)).pipe(
        Effect3.map(Option3.fromNullable)
      );
      const tableName2 = yield* this.tableName(id).pipe(Effect3.orDie);
      return pipe4(
        optionConvexDoc,
        Option3.map((convexDoc) => this.decode(tableName2, convexDoc))
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
    return Array2.findFirst(
      Record2.keys(this.databaseSchemas),
      (tableName2) => Option3.isSome(this.normalizeId(tableName2, id))
    );
  }
  query(tableName2) {
    return this.reader.query(tableName2);
  }
  get(id) {
    return this.reader.get(id);
  }
  normalizeId(tableName2, id) {
    return Option3.fromNullable(this.db.normalizeId(tableName2, id));
  }
  insert(table, value) {
    return pipe4(
      value,
      Schema5.encode(this.databaseSchemas[table]),
      Effect3.andThen(
        (encodedValue) => Effect3.promise(
          () => this.db.insert(
            table,
            encodedValue
          )
        )
      )
    );
  }
  patch(id, value) {
    return Effect3.gen(this, function* () {
      const tableName2 = yield* this.tableName(id);
      const tableSchema = this.databaseSchemas[tableName2];
      const originalConvexDoc = yield* Effect3.promise(
        () => this.db.get(id)
      ).pipe(
        Effect3.andThen(
          (doc) => doc ? Effect3.succeed(doc) : Effect3.die(new InvalidIdProvidedForPatch())
        )
      );
      const originalConfectDoc = yield* Schema5.decodeUnknown(tableSchema)(originalConvexDoc);
      const updatedConvexDoc = yield* pipe4(
        value,
        Record2.reduce(
          originalConfectDoc,
          (acc, value2, key) => value2 === void 0 ? Record2.remove(acc, key) : Record2.set(acc, key, value2)
        ),
        Schema5.encodeUnknown(tableSchema)
      );
      yield* Effect3.promise(
        () => this.db.replace(
          id,
          updatedConvexDoc
        )
      );
    });
  }
  replace(id, value) {
    return Effect3.promise(() => this.db.replace(id, value));
  }
  delete(id) {
    return Effect3.promise(() => this.db.delete(id));
  }
};
var databaseSchemasFromConfectSchema = (confectSchema) => Record2.map(
  confectSchema,
  ({ tableSchema }) => tableSchema
);
var InvalidIdProvidedForPatch = class extends Data2.TaggedError(
  "InvalidIdProvidedForPatch"
) {
};
var decodeDocument = (tableName2, tableSchema, convexDocument) => Schema5.decodeUnknownSync(extendWithSystemFields(tableName2, tableSchema), {
  onExcessProperty: "error"
})(convexDocument);

// src/server/scheduler.ts
import { Effect as Effect4 } from "effect";
var ConfectSchedulerImpl = class {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }
  runAfter(delayMs, functionReference, ...args) {
    return Effect4.promise(
      () => this.scheduler.runAfter(delayMs, functionReference, ...args)
    );
  }
  runAt(timestamp, functionReference, ...args) {
    return Effect4.promise(
      () => this.scheduler.runAt(timestamp, functionReference, ...args)
    );
  }
};

// src/server/storage.ts
import { Effect as Effect5, Option as Option4 } from "effect";
var ConfectStorageReaderImpl = class {
  constructor(storageReader) {
    this.storageReader = storageReader;
  }
  getUrl(storageId) {
    return Effect5.promise(() => this.storageReader.getUrl(storageId)).pipe(
      Effect5.map(Option4.fromNullable)
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
    return Effect5.promise(() => this.storageWriter.generateUploadUrl());
  }
  delete(storageId) {
    return Effect5.promise(() => this.storageWriter.delete(storageId));
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
  runQuery: (query, ...queryArgs) => Effect6.promise(() => ctx.runQuery(query, ...queryArgs)),
  runMutation: (mutation, ...mutationArgs) => Effect6.promise(() => ctx.runMutation(mutation, ...mutationArgs)),
  runAction: (action, ...actionArgs) => Effect6.promise(() => ctx.runAction(action, ...actionArgs)),
  vectorSearch: (tableName2, indexName, query) => Effect6.promise(() => ctx.vectorSearch(tableName2, indexName, query)),
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
import { Effect as Effect7, pipe as pipe5, Schema as Schema6 } from "effect";
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
  handler: (ctx, actualArgs) => pipe5(
    actualArgs,
    Schema6.decode(args),
    Effect7.orDie,
    Effect7.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        Effect7.provideService(
          ConfectQueryCtx(),
          makeConfectQueryCtx(ctx, databaseSchemas)
        )
      )
    ),
    Effect7.andThen(
      (convexReturns) => Schema6.encodeUnknown(returns)(convexReturns)
    ),
    Effect7.runPromise
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
  handler: (ctx, actualArgs) => pipe5(
    actualArgs,
    Schema6.decode(args),
    Effect7.orDie,
    Effect7.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        Effect7.provideService(
          ConfectQueryCtx(),
          makeConfectQueryCtx(ctx, databaseSchemas)
        ),
        Effect7.provideService(
          ConfectMutationCtx(),
          makeConfectMutationCtx(ctx, databaseSchemas)
        )
      )
    ),
    Effect7.andThen(
      (convexReturns) => Schema6.encodeUnknown(returns)(convexReturns)
    ),
    Effect7.runPromise
  )
});
var confectActionFunction = ({
  args,
  returns,
  handler
}) => ({
  args: compileArgsSchema(args),
  returns: compileReturnsSchema(returns),
  handler: (ctx, actualArgs) => pipe5(
    actualArgs,
    Schema6.decode(args),
    Effect7.orDie,
    Effect7.andThen(
      (decodedArgs) => handler(decodedArgs).pipe(
        Effect7.provideService(
          ConfectActionCtx(),
          makeConfectActionCtx(ctx)
        )
      )
    ),
    Effect7.andThen(
      (convexReturns) => Schema6.encodeUnknown(returns)(convexReturns)
    ),
    Effect7.runPromise
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
import { Array as Array3, Layer, pipe as pipe6, Record as Record3 } from "effect";
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
  Array3.forEach(ROUTABLE_HTTP_METHODS, (method) => {
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
  return pipe6(
    httpApis,
    Record3.toEntries,
    Array3.reduce(
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
import { Schema as Schema7 } from "effect";
var PaginationResult = (Doc) => Schema7.Struct({
  page: Schema7.Array(Doc).pipe(Schema7.mutable),
  isDone: Schema7.Boolean,
  continueCursor: Schema7.String,
  splitCursor: Schema7.optional(Schema7.Union(Schema7.String, Schema7.Null)),
  pageStatus: Schema7.optional(
    Schema7.Union(
      Schema7.Literal("SplitRecommended"),
      Schema7.Literal("SplitRequired"),
      Schema7.Null
    )
  )
}).pipe(Schema7.mutable);
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
/* v8 ignore next -- @preserve */
/* v8 ignore if -- @preserve */
//# sourceMappingURL=index.js.map