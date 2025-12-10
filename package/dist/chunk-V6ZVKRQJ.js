import {
  __export
} from "./chunk-PZ5AY32C.js";

// src/server/schema.ts
import {
  defineSchema as defineConvexSchema,
  defineTable as defineConvexTable
} from "convex/server";
import { pipe as pipe2, Record, Schema as Schema4 } from "effect";

// src/server/schema-to-validator.ts
import { v } from "convex/values";
import {
  Array,
  Cause,
  Data,
  Effect,
  Exit,
  Match,
  Number,
  Option,
  pipe,
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
  return pipe(
    ast,
    Match.value,
    Match.tag(
      "TypeLiteral",
      (typeLiteralAst) => Array.isEmptyReadonlyArray(typeLiteralAst.indexSignatures) ? handlePropertySignatures(typeLiteralAst) : Effect.fail(new IndexSignaturesAreNotSupportedError())
    ),
    Match.orElse(() => Effect.fail(new TopLevelMustBeObjectError())),
    runSyncThrow
  );
};
var compileReturnsSchema = (schema) => runSyncThrow(compileAst(Schema2.encodedSchema(schema).ast));
var compileTableSchema = (schema) => {
  const ast = Schema2.encodedSchema(schema).ast;
  return pipe(
    ast,
    Match.value,
    Match.tag(
      "TypeLiteral",
      ({ indexSignatures }) => Array.isEmptyReadonlyArray(indexSignatures) ? compileAst(ast) : Effect.fail(new IndexSignaturesAreNotSupportedError())
    ),
    Match.tag("Union", (unionAst) => compileAst(unionAst)),
    Match.orElse(() => Effect.fail(new TopLevelMustBeObjectOrUnionError())),
    runSyncThrow
  );
};
var compileSchema = (schema) => runSyncThrow(compileAst(schema.ast));
var isRecursive = (ast) => pipe(
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
var compileAst = (ast, isOptionalPropertyOfTypeLiteral = false) => isRecursive(ast) ? Effect.succeed(v.any()) : pipe(
  ast,
  Match.value,
  Match.tag(
    "Literal",
    ({ literal }) => pipe(
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
      Effect.succeed
    )
  ),
  Match.tag("BooleanKeyword", () => Effect.succeed(v.boolean())),
  Match.tag(
    "StringKeyword",
    (stringAst) => tableName(stringAst).pipe(
      Option.match({
        onNone: () => Effect.succeed(v.string()),
        onSome: (tableName2) => Effect.succeed(v.id(tableName2))
      })
    )
  ),
  Match.tag("NumberKeyword", () => Effect.succeed(v.float64())),
  Match.tag("BigIntKeyword", () => Effect.succeed(v.int64())),
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
    () => Effect.succeed(v.any())
  ),
  Match.tag(
    "Declaration",
    (declaration) => Effect.mapBoth(
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
    () => Effect.dieMessage(
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
    () => Effect.fail(
      new UnsupportedSchemaTypeError({
        schemaType: ast._tag
      })
    )
  ),
  Match.exhaustive
);
var handleUnion = ({ types: [first, second, ...rest] }, isOptionalPropertyOfTypeLiteral) => Effect.gen(function* () {
  const validatorEffects = isOptionalPropertyOfTypeLiteral ? Array.filterMap(
    [first, second, ...rest],
    (type) => not(SchemaAST2.isUndefinedKeyword)(type) ? Option.some(compileAst(type)) : Option.none()
  ) : Array.map([first, second, ...rest], (type) => compileAst(type));
  const [firstValidator, secondValidator, ...restValidators] = yield* Effect.all(validatorEffects);
  if (firstValidator === void 0) {
    return yield* Effect.dieMessage(
      "First validator of union is undefined; this should be impossible."
    );
  } else if (secondValidator === void 0) {
    return firstValidator;
  } else {
    return v.union(firstValidator, secondValidator, ...restValidators);
  }
});
var handleTypeLiteral = (typeLiteralAst) => pipe(
  typeLiteralAst.indexSignatures,
  Array.head,
  Option.match({
    onNone: () => pipe(handlePropertySignatures(typeLiteralAst), Effect.map(v.object)),
    /* v8 ignore next -- @preserve */
    onSome: () => Effect.fail(new IndexSignaturesAreNotSupportedError())
  })
);
var handleTupleType = ({ elements, rest }) => Effect.gen(function* () {
  const restValidator = pipe(
    rest,
    Array.head,
    Option.map(({ type }) => compileAst(type)),
    Effect.flatten
  );
  const [f, s, ...r] = elements;
  const elementToValidator = ({ type, isOptional }) => Effect.if(isOptional, {
    onTrue: () => Effect.fail(new OptionalTupleElementsAreNotSupportedError()),
    onFalse: () => compileAst(type)
  });
  const arrayItemsValidator = yield* f === void 0 ? pipe(
    restValidator,
    Effect.catchTag(
      "NoSuchElementException",
      () => Effect.fail(new EmptyTupleIsNotSupportedError())
    )
  ) : s === void 0 ? elementToValidator(f) : Effect.gen(function* () {
    const firstValidator = yield* elementToValidator(f);
    const secondValidator = yield* elementToValidator(s);
    const restValidators = yield* Effect.forEach(r, elementToValidator);
    return v.union(firstValidator, secondValidator, ...restValidators);
  });
  return v.array(arrayItemsValidator);
});
var handlePropertySignatures = (typeLiteralAst) => pipe(
  typeLiteralAst.propertySignatures,
  // biome-ignore lint/suspicious/useIterableCallbackReturn: False positive.
  Effect.forEach(({ type, name, isOptional }) => {
    if (String.isString(name)) {
      return Option.match(Number.parse(name), {
        onNone: () => Effect.gen(function* () {
          const validator = yield* compileAst(type, isOptional);
          return {
            propertyName: name,
            validator: isOptional ? v.optional(validator) : validator
          };
        }),
        onSome: (number) => Effect.fail(
          new UnsupportedPropertySignatureKeyTypeError({
            propertyKey: number
          })
        )
      });
    } else {
      return Effect.fail(
        new UnsupportedPropertySignatureKeyTypeError({ propertyKey: name })
      );
    }
  }),
  Effect.andThen(
    (propertyNamesWithValidators) => pipe(
      propertyNamesWithValidators,
      Array.reduce(
        {},
        (acc, { propertyName, validator }) => ({
          [propertyName]: validator,
          ...acc
        })
      ),
      Effect.succeed
    )
  )
);
var runSyncThrow = (effect) => pipe(
  effect,
  Effect.runSyncExit,
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
    this.convexSchemaDefinition = pipe2(
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
  Id_exports,
  compileArgsSchema,
  compileReturnsSchema,
  compileSchema,
  extendWithSystemFields,
  confectTableSchemas,
  defineSchema,
  defineTable,
  confectSystemSchema,
  confectSystemSchemaDefinition
};
/* v8 ignore next -- @preserve */
/* v8 ignore if -- @preserve */
//# sourceMappingURL=chunk-V6ZVKRQJ.js.map