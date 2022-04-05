/**
 * Find the difference between two type unions (essentially subtracting the types)
 *
 * interface TypeA {
 *  a: string;
 *  b: number;
 *  c: number;
 * }
 *
 * interface TypeB {
 *  c: string;
 *  d: number;
 * }
 *
 * type TypeC = Diff<keyof TypeA, keyof TypeB>; // 'a' | 'b'
 *
 */
export type Diff<T extends string | number | symbol, U extends string | number | symbol> = ({ [P in T]: P } & {
    [P in U]: never;
} & { [x: string]: never })[T];
