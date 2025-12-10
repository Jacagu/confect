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

// src/server/schema-to-validator.ts
var schema_to_validator_exports = {};
__export(schema_to_validator_exports, {
  EmptyTupleIsNotSupportedError: () => EmptyTupleIsNotSupportedError,
  IndexSignaturesAreNotSupportedError: () => IndexSignaturesAreNotSupportedError,
  OptionalTupleElementsAreNotSupportedError: () => OptionalTupleElementsAreNotSupportedError,
  TopLevelMustBeObjectError: () => TopLevelMustBeObjectError,
  TopLevelMustBeObjectOrUnionError: () => TopLevelMustBeObjectOrUnionError,
  UnsupportedPropertySignatureKeyTypeError: () => UnsupportedPropertySignatureKeyTypeError,
  UnsupportedSchemaTypeError: () => UnsupportedSchemaTypeError,
  compileArgsSchema: () => compileArgsSchema,
  compileAst: () => compileAst,
  compileReturnsSchema: () => compileReturnsSchema,
  compileSchema: () => compileSchema,
  compileTableSchema: () => compileTableSchema,
  isRecursive: () => isRecursive
});
module.exports = __toCommonJS(schema_to_validator_exports);
var import_values = require("convex/values");
var import_effect2 = require("effect");
var import_Predicate = require("effect/Predicate");

// src/server/schemas/Id.ts
var import_effect = require("effect");
var ConvexId = Symbol.for("ConvexId");
var tableName = (ast) => import_effect.SchemaAST.getAnnotation(ConvexId)(ast);

// src/server/schema-to-validator.ts
var compileArgsSchema = (argsSchema) => {
  const ast = import_effect2.Schema.encodedSchema(argsSchema).ast;
  return (0, import_effect2.pipe)(
    ast,
    import_effect2.Match.value,
    import_effect2.Match.tag(
      "TypeLiteral",
      (typeLiteralAst) => import_effect2.Array.isEmptyReadonlyArray(typeLiteralAst.indexSignatures) ? handlePropertySignatures(typeLiteralAst) : import_effect2.Effect.fail(new IndexSignaturesAreNotSupportedError())
    ),
    import_effect2.Match.orElse(() => import_effect2.Effect.fail(new TopLevelMustBeObjectError())),
    runSyncThrow
  );
};
var compileReturnsSchema = (schema) => runSyncThrow(compileAst(import_effect2.Schema.encodedSchema(schema).ast));
var compileTableSchema = (schema) => {
  const ast = import_effect2.Schema.encodedSchema(schema).ast;
  return (0, import_effect2.pipe)(
    ast,
    import_effect2.Match.value,
    import_effect2.Match.tag(
      "TypeLiteral",
      ({ indexSignatures }) => import_effect2.Array.isEmptyReadonlyArray(indexSignatures) ? compileAst(ast) : import_effect2.Effect.fail(new IndexSignaturesAreNotSupportedError())
    ),
    import_effect2.Match.tag("Union", (unionAst) => compileAst(unionAst)),
    import_effect2.Match.orElse(() => import_effect2.Effect.fail(new TopLevelMustBeObjectOrUnionError())),
    runSyncThrow
  );
};
var compileSchema = (schema) => runSyncThrow(compileAst(schema.ast));
var isRecursive = (ast) => (0, import_effect2.pipe)(
  ast,
  import_effect2.Match.value,
  import_effect2.Match.tag(
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
  import_effect2.Match.tag(
    "Union",
    ({ types }) => import_effect2.Array.some(types, (type) => isRecursive(type))
  ),
  import_effect2.Match.tag(
    "TypeLiteral",
    ({ propertySignatures }) => import_effect2.Array.some(propertySignatures, ({ type }) => isRecursive(type))
  ),
  import_effect2.Match.tag(
    "TupleType",
    ({ elements: optionalElements, rest: elements }) => import_effect2.Array.some(
      optionalElements,
      (optionalElement) => isRecursive(optionalElement.type)
    ) || import_effect2.Array.some(elements, (element) => isRecursive(element.type))
  ),
  import_effect2.Match.tag("Refinement", ({ from }) => isRecursive(from)),
  import_effect2.Match.tag("Suspend", () => true),
  import_effect2.Match.exhaustive
);
var compileAst = (ast, isOptionalPropertyOfTypeLiteral = false) => isRecursive(ast) ? import_effect2.Effect.succeed(import_values.v.any()) : (0, import_effect2.pipe)(
  ast,
  import_effect2.Match.value,
  import_effect2.Match.tag(
    "Literal",
    ({ literal }) => (0, import_effect2.pipe)(
      literal,
      import_effect2.Match.value,
      import_effect2.Match.whenOr(
        import_effect2.Match.string,
        import_effect2.Match.number,
        import_effect2.Match.bigint,
        import_effect2.Match.boolean,
        (l) => import_values.v.literal(l)
      ),
      import_effect2.Match.when(import_effect2.Match.null, () => import_values.v.null()),
      import_effect2.Match.exhaustive,
      import_effect2.Effect.succeed
    )
  ),
  import_effect2.Match.tag("BooleanKeyword", () => import_effect2.Effect.succeed(import_values.v.boolean())),
  import_effect2.Match.tag(
    "StringKeyword",
    (stringAst) => tableName(stringAst).pipe(
      import_effect2.Option.match({
        onNone: () => import_effect2.Effect.succeed(import_values.v.string()),
        onSome: (tableName2) => import_effect2.Effect.succeed(import_values.v.id(tableName2))
      })
    )
  ),
  import_effect2.Match.tag("NumberKeyword", () => import_effect2.Effect.succeed(import_values.v.float64())),
  import_effect2.Match.tag("BigIntKeyword", () => import_effect2.Effect.succeed(import_values.v.int64())),
  import_effect2.Match.tag(
    "Union",
    (unionAst) => handleUnion(unionAst, isOptionalPropertyOfTypeLiteral)
  ),
  import_effect2.Match.tag(
    "TypeLiteral",
    (typeLiteralAst) => handleTypeLiteral(typeLiteralAst)
  ),
  import_effect2.Match.tag("TupleType", (tupleTypeAst) => handleTupleType(tupleTypeAst)),
  import_effect2.Match.tag(
    "UnknownKeyword",
    "AnyKeyword",
    () => import_effect2.Effect.succeed(import_values.v.any())
  ),
  import_effect2.Match.tag(
    "Declaration",
    (declaration) => import_effect2.Effect.mapBoth(
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
  import_effect2.Match.tag("Refinement", ({ from }) => compileAst(from)),
  /* v8 ignore next -- @preserve */
  import_effect2.Match.tag(
    "Suspend",
    () => import_effect2.Effect.dieMessage(
      "Suspended schema should have already been handled by recursion check; this should be impossible."
    )
  ),
  import_effect2.Match.tag(
    "UniqueSymbol",
    "SymbolKeyword",
    "UndefinedKeyword",
    "VoidKeyword",
    "NeverKeyword",
    "Enums",
    "TemplateLiteral",
    "ObjectKeyword",
    "Transformation",
    () => import_effect2.Effect.fail(
      new UnsupportedSchemaTypeError({
        schemaType: ast._tag
      })
    )
  ),
  import_effect2.Match.exhaustive
);
var handleUnion = ({ types: [first, second, ...rest] }, isOptionalPropertyOfTypeLiteral) => import_effect2.Effect.gen(function* () {
  const validatorEffects = isOptionalPropertyOfTypeLiteral ? import_effect2.Array.filterMap(
    [first, second, ...rest],
    (type) => (0, import_Predicate.not)(import_effect2.SchemaAST.isUndefinedKeyword)(type) ? import_effect2.Option.some(compileAst(type)) : import_effect2.Option.none()
  ) : import_effect2.Array.map([first, second, ...rest], (type) => compileAst(type));
  const [firstValidator, secondValidator, ...restValidators] = yield* import_effect2.Effect.all(validatorEffects);
  if (firstValidator === void 0) {
    return yield* import_effect2.Effect.dieMessage(
      "First validator of union is undefined; this should be impossible."
    );
  } else if (secondValidator === void 0) {
    return firstValidator;
  } else {
    return import_values.v.union(firstValidator, secondValidator, ...restValidators);
  }
});
var handleTypeLiteral = (typeLiteralAst) => (0, import_effect2.pipe)(
  typeLiteralAst.indexSignatures,
  import_effect2.Array.head,
  import_effect2.Option.match({
    onNone: () => (0, import_effect2.pipe)(handlePropertySignatures(typeLiteralAst), import_effect2.Effect.map(import_values.v.object)),
    /* v8 ignore next -- @preserve */
    onSome: () => import_effect2.Effect.fail(new IndexSignaturesAreNotSupportedError())
  })
);
var handleTupleType = ({ elements, rest }) => import_effect2.Effect.gen(function* () {
  const restValidator = (0, import_effect2.pipe)(
    rest,
    import_effect2.Array.head,
    import_effect2.Option.map(({ type }) => compileAst(type)),
    import_effect2.Effect.flatten
  );
  const [f, s, ...r] = elements;
  const elementToValidator = ({ type, isOptional }) => import_effect2.Effect.if(isOptional, {
    onTrue: () => import_effect2.Effect.fail(new OptionalTupleElementsAreNotSupportedError()),
    onFalse: () => compileAst(type)
  });
  const arrayItemsValidator = yield* f === void 0 ? (0, import_effect2.pipe)(
    restValidator,
    import_effect2.Effect.catchTag(
      "NoSuchElementException",
      () => import_effect2.Effect.fail(new EmptyTupleIsNotSupportedError())
    )
  ) : s === void 0 ? elementToValidator(f) : import_effect2.Effect.gen(function* () {
    const firstValidator = yield* elementToValidator(f);
    const secondValidator = yield* elementToValidator(s);
    const restValidators = yield* import_effect2.Effect.forEach(r, elementToValidator);
    return import_values.v.union(firstValidator, secondValidator, ...restValidators);
  });
  return import_values.v.array(arrayItemsValidator);
});
var handlePropertySignatures = (typeLiteralAst) => (0, import_effect2.pipe)(
  typeLiteralAst.propertySignatures,
  // biome-ignore lint/suspicious/useIterableCallbackReturn: False positive.
  import_effect2.Effect.forEach(({ type, name, isOptional }) => {
    if (import_effect2.String.isString(name)) {
      return import_effect2.Option.match(import_effect2.Number.parse(name), {
        onNone: () => import_effect2.Effect.gen(function* () {
          const validator = yield* compileAst(type, isOptional);
          return {
            propertyName: name,
            validator: isOptional ? import_values.v.optional(validator) : validator
          };
        }),
        onSome: (number) => import_effect2.Effect.fail(
          new UnsupportedPropertySignatureKeyTypeError({
            propertyKey: number
          })
        )
      });
    } else {
      return import_effect2.Effect.fail(
        new UnsupportedPropertySignatureKeyTypeError({ propertyKey: name })
      );
    }
  }),
  import_effect2.Effect.andThen(
    (propertyNamesWithValidators) => (0, import_effect2.pipe)(
      propertyNamesWithValidators,
      import_effect2.Array.reduce(
        {},
        (acc, { propertyName, validator }) => ({
          [propertyName]: validator,
          ...acc
        })
      ),
      import_effect2.Effect.succeed
    )
  )
);
var runSyncThrow = (effect) => (0, import_effect2.pipe)(
  effect,
  import_effect2.Effect.runSyncExit,
  import_effect2.Exit.match({
    onSuccess: (validator) => validator,
    onFailure: (cause) => {
      throw import_effect2.Cause.squash(cause);
    }
  })
);
var TopLevelMustBeObjectError = class extends import_effect2.Data.TaggedError(
  "TopLevelMustBeObjectError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Top level schema must be an object";
  }
};
var TopLevelMustBeObjectOrUnionError = class extends import_effect2.Data.TaggedError(
  "TopLevelMustBeObjectOrUnionError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Top level schema must be an object or a union";
  }
};
var UnsupportedPropertySignatureKeyTypeError = class extends import_effect2.Data.TaggedError(
  "UnsupportedPropertySignatureKeyTypeError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return `Unsupported property signature '${this.propertyKey.toString()}'. Property is of type '${typeof this.propertyKey}' but only 'string' properties are supported.`;
  }
};
var EmptyTupleIsNotSupportedError = class extends import_effect2.Data.TaggedError(
  "EmptyTupleIsNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Tuple must have at least one element";
  }
};
var UnsupportedSchemaTypeError = class extends import_effect2.Data.TaggedError(
  "UnsupportedSchemaTypeError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return `Unsupported schema type '${this.schemaType}'`;
  }
};
var IndexSignaturesAreNotSupportedError = class extends import_effect2.Data.TaggedError(
  "IndexSignaturesAreNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Index signatures are not supported";
  }
};
var OptionalTupleElementsAreNotSupportedError = class extends import_effect2.Data.TaggedError(
  "OptionalTupleElementsAreNotSupportedError"
) {
  /* v8 ignore next -- @preserve */
  get message() {
    return "Optional tuple elements are not supported";
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmptyTupleIsNotSupportedError,
  IndexSignaturesAreNotSupportedError,
  OptionalTupleElementsAreNotSupportedError,
  TopLevelMustBeObjectError,
  TopLevelMustBeObjectOrUnionError,
  UnsupportedPropertySignatureKeyTypeError,
  UnsupportedSchemaTypeError,
  compileArgsSchema,
  compileAst,
  compileReturnsSchema,
  compileSchema,
  compileTableSchema,
  isRecursive
});
/* v8 ignore next -- @preserve */
/* v8 ignore if -- @preserve */
//# sourceMappingURL=schema-to-validator.cjs.map