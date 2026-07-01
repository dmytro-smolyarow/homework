// shared <type>
// cross-layer interface — used by 3+ layers, lifted here so it has a single source of truth

export interface I<Shared> {
  // …
}

// shared <name> enum
export enum E<Name> {
  <MEMBER_A> = '<member_a>',
  <MEMBER_B> = '<member_b>',
}
