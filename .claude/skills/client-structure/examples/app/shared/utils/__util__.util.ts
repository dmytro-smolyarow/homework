// pure utility — no React, no I/O, no module imports above shared
export const <name>Util = (input: number, label?: string): string => {
  if (input == null) return ''

  return `${label ?? ''}${input.toFixed(2)}`
}
