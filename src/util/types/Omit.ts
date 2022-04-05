import { Diff } from './Diff';

/**
 * Omit specific keys in a type.
 *
 * interface Info {
 *  firstName: string;
 *  lastName: string;
 *  address: string;
 *  email: string;
 * }
 *
 * type Name = Omit<Info, 'address' | 'email'>; // { firstName: string, lastName: string }
 *
 */
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
