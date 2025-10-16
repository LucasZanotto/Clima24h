import pool from './client';

const createTablesSql = `
  -- Cria tabela de Estados
  CREATE TABLE IF NOT EXISTS states (
    uf CHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );

  -- Cria tabela de Cidades
  CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_uf CHAR(2) NOT NULL REFERENCES states(uf),
    climatempo_id INTEGER,
    UNIQUE(name, state_uf)
  );

  -- Tabela opcional para cidades pendentes
  CREATE TABLE IF NOT EXISTS pending_cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_uf VARCHAR(10),
    climatempo_id INT NOT NULL
  );
`;

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🗄️  Criando tabelas...');
    await client.query('DROP TABLE IF EXISTS pending_cities');
    await client.query('DROP TABLE IF EXISTS cities');
    await client.query('DROP TABLE IF EXISTS states');

    await client.query(createTablesSql);

    console.log('✅ Tabelas criadas com sucesso!');

  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
