import { connect } from "./libsql-client";

export interface Env {
  TURSO_AUTH_TOKEN: string;
  TURSO_DB_URL: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const config = {
      authString: env.TURSO_AUTH_TOKEN,
      url: env.TURSO_DB_URL,
    };

    try {
      let db = connect(config);

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
