import "../chunk-PZ5AY32C.js";

// src/react/index.ts
import {
  useAction as useConvexAction,
  useMutation as useConvexMutation,
  useQuery as useConvexQuery
} from "convex/react";
import { Effect, Option, Schema } from "effect";
var useQuery = ({
  query,
  args,
  returns
}) => (actualArgs) => {
  const encodedArgs = Schema.encodeSync(args)(actualArgs);
  const actualReturnsOrUndefined = useConvexQuery(query, encodedArgs);
  if (actualReturnsOrUndefined === void 0) {
    return Option.none();
  } else {
    const decodedReturns = Schema.decodeSync(returns)(
      actualReturnsOrUndefined
    );
    return Option.some(decodedReturns);
  }
};
var useMutation = ({
  mutation,
  args,
  returns
}) => {
  const actualMutation = useConvexMutation(mutation);
  return (actualArgs) => Effect.gen(function* () {
    const encodedArgs = yield* Schema.encode(args)(actualArgs);
    const actualReturns = yield* Effect.promise(
      () => actualMutation(encodedArgs)
    );
    return yield* Schema.decode(returns)(actualReturns);
  }).pipe(Effect.orDie);
};
var useAction = ({
  action,
  args,
  returns
}) => {
  const actualAction = useConvexAction(action);
  return (actualArgs) => Effect.gen(function* () {
    const encodedArgs = yield* Schema.encode(args)(actualArgs);
    const actualReturns = yield* Effect.promise(
      () => actualAction(encodedArgs)
    );
    return yield* Schema.decode(returns)(actualReturns);
  }).pipe(Effect.orDie);
};
export {
  useAction,
  useMutation,
  useQuery
};
//# sourceMappingURL=index.js.map