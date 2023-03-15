import { createClient, Client, ResultSet } from "@libsql/client/http";

export interface Env {
  TURSO_DB_URL: string;
  NUM_QUERIES: Number;
}

// Memoize our DB connection across instances
let db: Client;

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response | void> {
    try {
      let start = Date.now();
      if (db === undefined) {
        db = createClient({ url: env.TURSO_DB_URL });
      }
      console.log(`setup latency: ${Date.now() - start}ms`);

      let numQueries = env.NUM_QUERIES ? env.NUM_QUERIES : 5;

      let now = Date.now();

      // Generate some subrequests for Smart Placement
      for (let i = 1; i <= numQueries; i++) {
        console.log(`executing query #${i}...`);
        await db.execute("SELECT * FROM users LIMIT 5;");
        console.log(`query latency: ${Date.now() - now}ms`);
      }

      // Actual data query
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
