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

// src/react/index.ts
var react_exports = {};
__export(react_exports, {
  useAction: () => useAction,
  useMutation: () => useMutation,
  useQuery: () => useQuery
});
module.exports = __toCommonJS(react_exports);
var import_react = require("convex/react");
var import_effect = require("effect");
var useQuery = ({
  query,
  args,
  returns
}) => (actualArgs) => {
  const encodedArgs = import_effect.Schema.encodeSync(args)(actualArgs);
  const actualReturnsOrUndefined = (0, import_react.useQuery)(query, encodedArgs);
  if (actualReturnsOrUndefined === void 0) {
    return import_effect.Option.none();
  } else {
    const decodedReturns = import_effect.Schema.decodeSync(returns)(
      actualReturnsOrUndefined
    );
    return import_effect.Option.some(decodedReturns);
  }
};
var useMutation = ({
  mutation,
  args,
  returns
}) => {
  const actualMutation = (0, import_react.useMutation)(mutation);
  return (actualArgs) => import_effect.Effect.gen(function* () {
    const encodedArgs = yield* import_effect.Schema.encode(args)(actualArgs);
    const actualReturns = yield* import_effect.Effect.promise(
      () => actualMutation(encodedArgs)
    );
    return yield* import_effect.Schema.decode(returns)(actualReturns);
  }).pipe(import_effect.Effect.orDie);
};
var useAction = ({
  action,
  args,
  returns
}) => {
  const actualAction = (0, import_react.useAction)(action);
  return (actualArgs) => import_effect.Effect.gen(function* () {
    const encodedArgs = yield* import_effect.Schema.encode(args)(actualArgs);
    const actualReturns = yield* import_effect.Effect.promise(
      () => actualAction(encodedArgs)
    );
    return yield* import_effect.Schema.decode(returns)(actualReturns);
  }).pipe(import_effect.Effect.orDie);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useAction,
  useMutation,
  useQuery
});
//# sourceMappingURL=index.cjs.map