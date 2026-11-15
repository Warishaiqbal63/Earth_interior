// Creates the admin account, or resets its password if the email already exists.
// Usage: npm run create-admin -- --email=you@example.com
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const email = process.argv.find((a) => a.startsWith("--email="))?.slice(8).trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npm run create-admin -- --email=you@example.com");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run `npx neon@latest init` and `npm run db:setup` first.");
  process.exit(1);
}

let muted = false;
const output = new Writable({
  write(chunk, _enc, cb) {
    if (!muted) process.stdout.write(chunk);
    cb();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    muted = true;
    rl.question("", (answer) => {
      muted = false;
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const password = await ask("New admin password (min 10 characters): ");
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}
if ((await ask("Repeat password: ")) !== password) {
  console.error("Passwords do not match.");
  process.exit(1);
}
rl.close();

const sql = neon(process.env.DATABASE_URL);
const hash = await bcrypt.hash(password, 12);
await sql`
  INSERT INTO admin_users (email, password_hash) VALUES (${email}, ${hash})
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`;
await sql`DELETE FROM login_attempts WHERE email = ${email}`;
console.log(`Admin ready: ${email}. Sign in at /admin/login`);
