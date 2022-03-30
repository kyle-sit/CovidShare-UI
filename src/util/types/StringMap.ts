/**
 * Represent an object as a map with strings as the keys
 */
export default interface StringMap<T> {
    [index: string]: T;
}
