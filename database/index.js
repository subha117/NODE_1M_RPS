import pkg from "pg";
import keys from "./keys.js";

// Read PG_CONNECT environment variable.
// If PG_CONNECT=false, PostgreSQL connection is disabled.
const shouldConnect = process.env.PG_CONNECT !== "false";

export const pool = shouldConnect
  ? new pkg.Pool({
      user: keys.dbUser,
      host: keys.dbHost,
      database: keys.dbDatabase,
      password: keys.dbPassword,
      port: keys.dbPort,

      // Local PostgreSQL does not require SSL.
      // Enable SSL only when PG_SSL=true.
      ssl:
        process.env.PG_SSL === "true"
          ? {
              rejectUnauthorized: false,
            }
          : false,
    })
  : null;

// Test PostgreSQL connection when DB is enabled.
if (shouldConnect) {
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("[postgres] connection failed.");
      console.error("Error details:\n", err);
      process.exit(1);
    }

    console.log(
      "[postgres] connected successfully to " + keys.dbDatabase + ".",
    );
  });
}

// General database query function.
const query = (query, values) => {
  if (!shouldConnect) {
    console.warn(
      "[postgres] Query attempted but DB connection is disabled.",
    );

    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    pool.query(query, values, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
};

export const DB = {
  query,
};