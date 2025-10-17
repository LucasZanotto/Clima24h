import { FastifyInstance } from "fastify";
import pool from "../database/client"; 
import axios from "axios";
import { parseStringPromise } from "xml2js";
import stringSimilarity from "string-similarity";

const SITEMAP_URL = 'https://www.climatempo.com.br/sitemap/previsoes-cidades.xml';

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function nameFromSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface IbgeUf { sigla: string; nome: string; }
interface IbgeCity { nome: string; }
interface DbCity { id: number; name: string; state_uf: string; climatempo_id?: number; }

export async function runSeedRoute(app: FastifyInstance) {
  app.post("/run-seed", async (request, reply) => {
    try {
      const client = await pool.connect();

      const ufsResponse = await axios.get<IbgeUf[]>('https://brasilapi.com.br/api/ibge/uf/v1');
      const ufs = ufsResponse.data;
      for (const uf of ufs) {
        await client.query(
          `INSERT INTO states (uf, name) VALUES ($1, $2) ON CONFLICT (uf) DO NOTHING`,
          [uf.sigla, uf.nome]
        );
      }

      const { rows: dbCities } = await client.query<DbCity>('SELECT id, name, state_uf, climatempo_id FROM cities');
      const cityMap = new Map<string, DbCity>();
      for (const city of dbCities) {
        const key = `${normalizeString(city.name)}-${normalizeString(city.state_uf)}`;
        cityMap.set(key, city);
      }

      // 3️⃣ Baixar sitemap
      const response = await axios.get(SITEMAP_URL);
      const parsedXml = await parseStringPromise(response.data);
      const urls: string[] = parsedXml.urlset.url.map((u: any) => u.loc[0]);
      const sitemapMap = new Map<string, number>();
      for (const loc of urls) {
        const match = loc.match(/\/cidade\/(\d+)\/([a-z0-9-]+)-([a-z]{2})$/);
        if (match) sitemapMap.set(match[2], parseInt(match[1], 10));
      }

      const CHUNK_SIZE = 50; 
      let insertedCount = 0;
      let updatedCount = 0;

      for (const uf of ufs) {
        const citiesResponse = await axios.get<IbgeCity[]>(`https://brasilapi.com.br/api/ibge/municipios/v1/${uf.sigla}`);
        const ibgeCities = citiesResponse.data;

        for (let i = 0; i < ibgeCities.length; i += CHUNK_SIZE) {
          const chunk = ibgeCities.slice(i, i + CHUNK_SIZE);

          await Promise.all(chunk.map(async (ibgeCity) => {
            const key = `${normalizeString(ibgeCity.nome)}-${normalizeString(uf.sigla)}`;
            const dbCity = cityMap.get(key);

            let matchedId: number | null = null;
            for (const [slug, id] of sitemapMap) {
              const slugNormalized = normalizeString(nameFromSlug(slug));
              const similarity = stringSimilarity.compareTwoStrings(slugNormalized, normalizeString(ibgeCity.nome));
              if (similarity > 0.85) {
                matchedId = id;
                break;
              }
            }

            if (dbCity) {
              if (!dbCity.climatempo_id && matchedId) {
                await client.query('UPDATE cities SET climatempo_id = $1 WHERE id = $2', [matchedId, dbCity.id]);
                updatedCount++;
              }
            } else {
              await client.query('INSERT INTO cities (name, state_uf, climatempo_id) VALUES ($1, $2, $3)',
                [ibgeCity.nome, uf.sigla, matchedId]);
              insertedCount++;
            }
          }));

          console.log(`✅ Processado chunk ${i} a ${i + CHUNK_SIZE} de ${uf.sigla}`);
        }
      }

      client.release();
      return reply.send({ message: `Seed concluído: ${insertedCount} cidades inseridas, ${updatedCount} atualizadas` });

    } catch (err) {
      console.error("Erro ao executar seed/map_ids:", err);
      return reply.status(500).send({ error: "Erro ao executar seed/map_ids" });
    }
  });
}
