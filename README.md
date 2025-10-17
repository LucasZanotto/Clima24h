# Clima24h 🌤️

Clima24h é um projeto de **web scraping** que coleta dados de previsão do tempo do site [Clima Tempo](https://www.climatempo.com.br) e disponibiliza essas informações via API REST.

---

## 📌 Funcionalidades

- Listar estados do Brasil.
- Listar cidades de cada estado.
- Obter previsão do tempo de uma cidade.
- Seed automatizado do banco de dados com todos os estados e cidades.
- Mapeamento de IDs do Clima Tempo para cada cidade.

---

## 🛠 Tecnologias utilizadas

- **Backend:** Node.js + TypeScript + Fastify  
- **Frontend:** React.js + Vite
- **Banco de Dados:** PostgreSQL
- **Testes:** Vitest

---

## 📡 Endpoints principais

- `GET /states` → Lista todos os estados  
- `GET /cities/:stateUf` → Lista cidades de um estado  
- `GET /weather/:cityId` → Previsão do tempo da cidade

---

## 📄 Observações

- O projeto é **apenas para demonstração**.  

