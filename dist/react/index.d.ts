import { FunctionReference } from 'convex/server';
import { Schema, Option, Effect } from 'effect';

declare const useQuery: <Query extends FunctionReference<"query">, Args, Returns>({ query, args, returns, }: {
    query: Query;
    args: Schema.Schema<Args, Query["_args"]>;
    returns: Schema.Schema<Returns, Query["_returnType"]>;
}) => (actualArgs: Args) => Option.Option<Returns>;
declare const useMutation: <Mutation extends FunctionReference<"mutation">, Args, Returns>({ mutation, args, returns, }: {
    mutation: Mutation;
    args: Schema.Schema<Args, Mutation["_args"]>;
    returns: Schema.Schema<Returns, Mutation["_returnType"]>;
}) => (actualArgs: Args) => Effect.Effect<Returns>;
declare const useAction: <Action extends FunctionReference<"action">, Args, Returns>({ action, args, returns, }: {
    action: Action;
    args: Schema.Schema<Args, Action["_args"]>;
    returns: Schema.Schema<Returns, Action["_returnType"]>;
}) => (actualArgs: Args) => Effect.Effect<Returns>;

export { useAction, useMutation, useQuery };
