import * as effect_Types from 'effect/Types';
import { GenericId, VAny, VId, VLiteral, VNull, VFloat64, VInt64, VBoolean, VString, VBytes, Validator, VArray, VOptional, OptionalProperty, VObject, VUnion, PropertyValidators } from 'convex/values';
import { Brand, Schema, SchemaAST, Effect, Cause } from 'effect';

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

declare const compileArgsSchema: <ConfectValue, ConvexValue>(argsSchema: Schema.Schema<ConfectValue, ConvexValue>) => PropertyValidators;
declare const compileReturnsSchema: <ConfectValue, ConvexValue>(schema: Schema.Schema<ConfectValue, ConvexValue>) => Validator<any, any, any>;
/**
 * Convert a table `Schema` to a table `Validator`.
 */
type TableSchemaToTableValidator<TableSchema extends Schema.Schema.AnyNoContext> = ValueToValidator<TableSchema["Encoded"]> extends infer Vd extends VObject<any, any, any, any> | VUnion<any, any, any, any> ? Vd : never;
declare const compileTableSchema: <TableSchema extends Schema.Schema.AnyNoContext>(schema: TableSchema) => TableSchemaToTableValidator<TableSchema>;
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
declare const isRecursive: (ast: SchemaAST.AST) => boolean;
declare const compileAst: (ast: SchemaAST.AST, isOptionalPropertyOfTypeLiteral?: boolean) => Effect.Effect<Validator<any, any, any>, UnsupportedSchemaTypeError | UnsupportedPropertySignatureKeyTypeError | IndexSignaturesAreNotSupportedError | OptionalTupleElementsAreNotSupportedError | EmptyTupleIsNotSupportedError>;
declare const TopLevelMustBeObjectError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "TopLevelMustBeObjectError";
} & Readonly<A>;
declare class TopLevelMustBeObjectError extends TopLevelMustBeObjectError_base {
    get message(): string;
}
declare const TopLevelMustBeObjectOrUnionError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "TopLevelMustBeObjectOrUnionError";
} & Readonly<A>;
declare class TopLevelMustBeObjectOrUnionError extends TopLevelMustBeObjectOrUnionError_base {
    get message(): string;
}
declare const UnsupportedPropertySignatureKeyTypeError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "UnsupportedPropertySignatureKeyTypeError";
} & Readonly<A>;
declare class UnsupportedPropertySignatureKeyTypeError extends UnsupportedPropertySignatureKeyTypeError_base<{
    readonly propertyKey: number | symbol;
}> {
    get message(): string;
}
declare const EmptyTupleIsNotSupportedError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "EmptyTupleIsNotSupportedError";
} & Readonly<A>;
declare class EmptyTupleIsNotSupportedError extends EmptyTupleIsNotSupportedError_base {
    get message(): string;
}
declare const UnsupportedSchemaTypeError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "UnsupportedSchemaTypeError";
} & Readonly<A>;
declare class UnsupportedSchemaTypeError extends UnsupportedSchemaTypeError_base<{
    readonly schemaType: SchemaAST.AST["_tag"];
}> {
    get message(): string;
}
declare const IndexSignaturesAreNotSupportedError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "IndexSignaturesAreNotSupportedError";
} & Readonly<A>;
declare class IndexSignaturesAreNotSupportedError extends IndexSignaturesAreNotSupportedError_base {
    get message(): string;
}
declare const OptionalTupleElementsAreNotSupportedError_base: new <A extends Record<string, any> = {}>(args: effect_Types.Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => Cause.YieldableError & {
    readonly _tag: "OptionalTupleElementsAreNotSupportedError";
} & Readonly<A>;
declare class OptionalTupleElementsAreNotSupportedError extends OptionalTupleElementsAreNotSupportedError_base {
    get message(): string;
}

export { EmptyTupleIsNotSupportedError, IndexSignaturesAreNotSupportedError, OptionalTupleElementsAreNotSupportedError, type ReadonlyRecordValue, type ReadonlyValue, type TableSchemaToTableValidator, TopLevelMustBeObjectError, TopLevelMustBeObjectOrUnionError, type UndefinedOrValueToValidator, UnsupportedPropertySignatureKeyTypeError, UnsupportedSchemaTypeError, type ValueToValidator, compileArgsSchema, compileAst, compileReturnsSchema, compileSchema, compileTableSchema, isRecursive };
