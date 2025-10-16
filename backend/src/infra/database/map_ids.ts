import pool from './client';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import stringSimilarity from 'string-similarity';

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

interface IbgeUf {
  sigla: string;
  nome: string;
}

interface IbgeCity {
  nome: string;
}

interface DbCity {
  id: number;
  name: string;
  state_uf: string;
  climatempo_id?: number;
}

async function mapClimaTempoWithIbge() {
  console.log('🗺️  Iniciando mapeamento via IBGE + Sitemap...');
  const client = await pool.connect();

  let updatedCount = 0;
  let insertedCount = 0;
  let pendingCount = 0;

  try {
    console.log('0. Garantindo que todos os estados existam...');
    const ufsResponse = await axios.get<IbgeUf[]>('https://brasilapi.com.br/api/ibge/uf/v1');
    const ufs = ufsResponse.data;
    for (const uf of ufs) {
      await client.query(
        `INSERT INTO states (uf, name)
         VALUES ($1, $2)
         ON CONFLICT (uf) DO NOTHING`,
        [uf.sigla, uf.nome]
      );
    }

    console.log('1. Buscando cidades do banco...');
    const { rows: dbCities } = await client.query<DbCity>('SELECT id, name, state_uf, climatempo_id FROM cities');
    const cityMap = new Map<string, DbCity>();
    for (const city of dbCities) {
      const key = `${normalizeString(city.name)}-${normalizeString(city.state_uf)}`;
      cityMap.set(key, city);
    }
    console.log(`   ✅ ${dbCities.length} cidades carregadas.`);

    console.log('2. Baixando e parseando sitemap...');
    const response = await axios.get(SITEMAP_URL);
    const xml = response.data;
    const parsedXml = await parseStringPromise(xml);
    const urls: string[] = parsedXml.urlset.url.map((u: any) => u.loc[0]);

    // Cria mapa de slug -> climatempo_id
    const sitemapMap = new Map<string, number>();
    for (const loc of urls) {
      const match = loc.match(/\/cidade\/(\d+)\/([a-z0-9-]+)-([a-z]{2})$/);
      if (match) {
        const [, id, slug] = match;
        sitemapMap.set(slug, parseInt(id, 10));
      }
    }

    for (const uf of ufs) {
      console.log(`   Processando cidades de ${uf.sigla}...`);
      const citiesResponse = await axios.get<IbgeCity[]>(`https://brasilapi.com.br/api/ibge/municipios/v1/${uf.sigla}`);
      const ibgeCities = citiesResponse.data;

      for (const ibgeCity of ibgeCities) {
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
            await client.query(
              'UPDATE cities SET climatempo_id = $1 WHERE id = $2',
              [matchedId, dbCity.id]
            );
            updatedCount++;
          }
        } else {
          await client.query(
            'INSERT INTO cities (name, state_uf, climatempo_id) VALUES ($1, $2, $3)',
            [ibgeCity.nome, uf.sigla, matchedId]
          );
          insertedCount++;
        }
      }
    }

    console.log('\n🏁 Mapeamento concluído!');
    console.log(`   ✅ Atualizações diretas: ${updatedCount}`);
    console.log(`   ➕ Novas cidades inseridas: ${insertedCount}`);
    console.log(`   ⏳ Cidades não encontradas no sitemap: ${pendingCount}`);

  } catch (err) {
    console.error('\n🚨 Erro durante o mapeamento:', err);
  } finally {
    await client.release();
    await pool.end();
  }
}

mapClimaTempoWithIbge();
