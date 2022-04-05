/**
 * A type that describes any kind of content that can be rendered from a React component.
 *
 * Often used as a type for passing in "render props"
 */
export type RenderableContent<T = any> = string | number | JSX.Element | ((props?: T) => string | number | JSX.Element);
