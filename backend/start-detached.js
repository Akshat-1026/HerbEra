import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const child = spawn("node", ["server.js"], {
  cwd: __dirname,
  detached: true,
  stdio: "ignore",
});
child.unref();
console.log("Server started with PID:", child.pid);
process.exit(0);
