import pool from "../config/database.js";

export async function listarRotas(request, response) {
  const [rotas] = await pool.query(
    `SELECT
       r.id_rotas AS id,
       r.nome,
       COALESCE(m.nome, 'Sem motorista') AS motorista,
       r.distancia_km AS distancia,
       r.origem,
       r.destino,
       r.status
     FROM rotas r
     LEFT JOIN motoristas m ON m.id_motoristas = r.id_motorista
     ORDER BY r.id_rotas`,
  );

  // POINT é gravado como (x = longitude, y = latitude)
  const [pontos] = await pool.query(
    `SELECT id_rota, ST_Y(coordenadas) AS lat, ST_X(coordenadas) AS lng
     FROM rotas_pontos
     ORDER BY id_rota, ordem`,
  );

  response.json(
    rotas.map((rota) => ({
      ...rota,
      distancia: `${Number(rota.distancia).toLocaleString("pt-BR")} km`,
      pontos: pontos
        .filter((ponto) => ponto.id_rota === rota.id)
        .map(({ lat, lng }) => ({ lat: Number(lat), lng: Number(lng) })),
    })),
  );
}
