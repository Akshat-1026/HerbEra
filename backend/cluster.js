import cluster from "cluster";
import os from "os";
import dotenv from "dotenv";

dotenv.config();

const CPUS = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} starting ${CPUS} workers`);

  for (let i = 0; i < CPUS; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code) => {
    console.log(`Worker ${worker.process.pid} died (code ${code}). Restarting...`);
    cluster.fork();
  });

  process.on("SIGTERM", () => {
    for (const id in cluster.workers) {
      cluster.workers[id].process.kill("SIGTERM");
    }
  });
} else {
  import("./server.js");
}
