// <name> service — small helpers shared across slices
export const <name>Service = {
  // encode
  encode: (input: string): string => btoa(input),

  // decode
  decode: (input: string): string => atob(input),
}
