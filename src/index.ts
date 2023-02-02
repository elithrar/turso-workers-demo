import { connect, Connection } from "./libsql-client";

export interface Env {
  TURSO_DB_URL: string;
}

// Memoize our DB connection across instances
let db: Connection;

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      if (db === undefined) {
        db = connect({ url: env.TURSO_DB_URL });
      }

      let now = Date.now();
      console.log(`executing query...`);
      let res = await db.execute("SELECT * FROM users;");
      console.log(`query latency: ${Date.now() - now}ms`);

      if (res.success) {
        let serialized = JSON.stringify(res);
        return new Response(serialized, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        throw new Error(`query failed: ${res.error}`);
      }
    } catch (e) {
      console.log(`failed to query: ${e}`);
      return new Response(`${e}`, { status: 500 });
    }
  },
};
