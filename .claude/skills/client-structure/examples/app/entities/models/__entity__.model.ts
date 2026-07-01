// request body
export interface I<Api>Body {
  <field>: string
  <count>?: number
}

// query params
export interface I<Api>Params {
  id: string
}

// response
export interface I<Api>Res {
  id: string
  <field>: string
  createdAt: string
}
