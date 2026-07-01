import { DurableObject } from 'cloudflare:workers'
import { Context, Env } from 'hono'

// table enum
export enum E<Entity>Table {
  <TABLE> = '<table>',
}

// <entity> DO class
export class <DOClass> extends DurableObject<Env> {
  private initialized = false

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.blockConcurrencyWhile(async () => {
      this.handleMigrations()
    })
  }

  // handle migrations (idempotent)
  private handleMigrations(): void {
    if (this.initialized) return

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS ${E<Entity>Table.<TABLE>} (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_<table>_id ON ${E<Entity>Table.<TABLE>}(id);
    `)

    this.initialized = true
  }

  // get all
  public getAll(table: E<Entity>Table = E<Entity>Table.<TABLE>) {
    return [...this.ctx.storage.sql.exec(`SELECT * FROM ${table} ORDER BY created_at DESC`)]
  }

  // get one
  public getOne(id: string, table: E<Entity>Table = E<Entity>Table.<TABLE>) {
    try {
      const result = this.ctx.storage.sql.exec(`SELECT * FROM ${table} WHERE id = ?`, id).one()
      return result || null
    } catch {
      return null
    }
  }

  // create
  public create(data: { id: string; title: string }, table: E<Entity>Table = E<Entity>Table.<TABLE>) {
    const now = Date.now()

    this.ctx.storage.sql.exec(
      `INSERT INTO ${table} (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      data.id,
      data.title,
      now,
      now,
    )

    return this.getOne(data.id)
  }

  // update
  public update(id: string, data: { title: string }, table: E<Entity>Table = E<Entity>Table.<TABLE>) {
    const now = Date.now()

    this.ctx.storage.sql.exec(`UPDATE ${table} SET title = ?, updated_at = ? WHERE id = ?`, data.title, now, id)

    return this.getOne(id)
  }

  // delete
  public delete(id: string, table: E<Entity>Table = E<Entity>Table.<TABLE>) {
    this.ctx.storage.sql.exec(`DELETE FROM ${table} WHERE id = ?`, id)
    return { id, deleted: true }
  }
}

// accessor — services call this instead of touching ctx.env directly
// identifier = DO partition key (per-tenant, per-resource, or fixed for a singleton)
export const <entity> = (ctx: Context, identifier: string) => {
  const id = ctx.env.<BINDING>.idFromName(identifier)
  return ctx.env.<BINDING>.get(id)
}
