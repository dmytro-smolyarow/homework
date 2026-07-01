// <widget> interfaces

// input
export interface I<Widget>Input {
  payload: unknown
  // …
}

// result
export interface I<Widget>Result {
  ok: boolean
  result: unknown
  // …
}
