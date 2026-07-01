// <widget> interfaces

// input
export interface I<Widget>Input {
  partitionKey: string
  payload: unknown
}

// result
export interface I<Widget>Result {
  ok: boolean
  persisted?: unknown
}
