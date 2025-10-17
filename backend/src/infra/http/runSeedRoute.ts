import { FastifyInstance } from "fastify";
import { exec } from "child_process";
import path from "path";

export async function runSeedRoute(app: FastifyInstance) {
  app.post("/run-seed", async (request, reply) => {

    const backendPath = path.resolve(__dirname, "../.."); 

    const commands = [
      "npm run db:seed",
      "npm run db:map-ids"
    ];

    try {
      for (const cmd of commands) {
        await new Promise<void>((resolve, reject) => {
          const process = exec(cmd, { cwd: backendPath }, (error, stdout, stderr) => {
            if (error) {
              console.error(`❌ Erro no comando ${cmd}:`, stderr || error);
              reject(error);
              return;
            }
            console.log(`✅ ${cmd} OK:\n${stdout}`);
            resolve();
          });
        });
      }

      return reply.send({ message: "✅ Seed e mapeamento executados com sucesso!" });

    } catch (err) {
      console.error("Erro ao executar seed/map_ids:", err);
      return reply.status(500).send({ error: "Erro ao executar seed/map_ids" });
    }
  });
}
