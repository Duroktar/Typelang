import { ExampleProgram } from "./types";

export const example49DocumentationComments: ExampleProgram = {
  id: 'documentation_comments',
  name: '49. Documentation Comments & Hover Tags',
  category: 'Language Features',
  description: 'A hands-on guide to /// and /** */ docs, summaries, Markdown, parameter and type-parameter tags, returns, examples, deprecation, since, throws, see-also, custom tags, and documenting values and types.',
  code: `// DOCUMENTATION COMMENTS: write docs once, see them on hover.
// Put a contiguous /// or /** ... */ block immediately above its declaration.
// A blank line detaches the comment. Ordinary // and /* */ comments are not docs.

/// A short summary is the first paragraph of the hover documentation.
/// Add more lines for details; Markdown such as **bold**, *emphasis*, and lists works.
///
/// JSDoc-style typed spelling also works: @param {T} value - The wrapped value.
/// @typeparam T The kind of value stored in this box.
/// @param value - The value to wrap.
/// @returns A new box containing the same value.
/// @example
/// let box = Boxed.wrap(42)
/// println(to_string(box.value))
/// @since 1.0
/// @see Boxed.unwrap for the inverse operation.
export function wrap<T>(value: T): { value: T } {
  { value: value }
}

/**
 * Unwraps a value from its box.
 *
 * The block-comment form is interchangeable with /// comments.
 * @param {T} box - The box whose value should be returned.
 * @returns The value held by the box.
 * @example
 * unwrap({ value: "hello" })
 */
export function unwrap<T>(box: { value: T }): T {
  box.value
}

/// @deprecated Use wrap instead when building a new box.
/// This documents a compatibility alias; deprecated APIs remain callable.
/// @template T Documents a generic type parameter (alias of @typeparam).
/// @return A box containing the original value.
export function legacyWrap<T>(value: T): { value: T } {
  wrap(value)
}

/// A documented exported constant (variables can have doc comments too).
/// @since 1.1
export let DEFAULT_GREETING = "Hello";

/// A named type can explain its purpose and any invariants.
/// @see UserId for the identifier used by this record.
export type Greeting = { text: string, recipient: string };

/// Describes a lookup result with explicit success and missing cases.
/// This summary appears when hovering the type name.
export type Lookup<a> =
  /// A successful lookup.
  /// @param value - The value that was found.
  | Found(value: a): Lookup<a>
  /// No matching value exists.
  | Missing: Lookup<a>

/// Formats a greeting for a recipient.
/// @param recipient - The person to greet.
/// @returns A ready-to-display greeting.
/// @example
/// makeGreeting("Ada")
export function makeGreeting(recipient: string): Greeting {
  { text: concat(DEFAULT_GREETING, concat(", ", recipient)), recipient: recipient }
}

/// This function demonstrates tags that add important API guidance.
/// @arg input - The text to validate before processing (@arg and @argument alias @param).
/// @argument [allowEmpty] - Whether an empty string is permitted (brackets mark an optional documented parameter).
/// @throws RangeError when input is empty or too long.
/// @exception ValidationError when the input cannot be used.
/// @return Whether the text passed validation.
/// @note Custom tags are shown as labeled Markdown sections too.
/// @see makeGreeting for a simple documented function.
export function validateText(input: string, allowEmpty: boolean): boolean {
  allowEmpty || String.len(input) > 0
}

let sample = wrap(42)
let message = makeGreeting("Ada")
println(message.text)
println(to_string(unwrap(sample)))
println(to_string(validateText("docs", false)))
`
};
