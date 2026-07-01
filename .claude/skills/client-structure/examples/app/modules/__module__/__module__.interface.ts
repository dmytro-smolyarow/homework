// input
export interface I<Module>Input {
  <field>: string
}

// result
export interface I<Module>Result {
  <field>: string
  <count>: number
}

// step enum
export enum E<Module>Step {
  INTRO = 'intro',
  DETAILS = 'details',
  DONE = 'done',
}
