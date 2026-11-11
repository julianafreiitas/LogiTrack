import { getCoordinates } from '../services/geocodeService.js';
import db from '../config/database.js';

function gerarCodigoRastreio() {
  const sufixo = Math.random().toString(36).slice(2, 4);
  return `ENT-${Date.now().toString(36)}${sufixo}`.toUpperCase();
}

// POST /api/deliveries
export async function createDelivery(req, res, next) {
  try {
    const clientName = String(req.body?.clientName ?? '').trim();
    const address = String(req.body?.address ?? '').trim();

    if (!clientName || !address) {
      return res.status(400).json({ error: 'Nome do cliente e endereço são obrigatórios.' });
    }

    if (clientName.length > 100 || address.length > 255) {
      return res.status(400).json({ error: 'Nome (máx. 100) ou endereço (máx. 255) muito longo.' });
    }

    // 1. Converte o endereço em latitude/longitude (Nominatim)
    const { latitude, longitude, displayName } = await getCoordinates(address);

    // 2. Código de rastreio único
    const codigoRastreio = gerarCodigoRastreio();

    // 3. No MySQL o POINT é (longitude latitude). Previsão padrão: 1 dia
    const pointWKT = `POINT(${longitude.toFixed(7)} ${latitude.toFixed(7)})`;

    const query = `
      INSERT INTO entregas
        (codigo_rastreio, id_cliente, nome_cliente, endereco_destino, coordenadas_destino, previsao, status)
      VALUES
        (?, 1, ?, ?, ST_GeomFromText(?), DATE_ADD(NOW(), INTERVAL 1 DAY), 'Pendente')
    `;

    const [result] = await db.execute(query, [codigoRastreio, clientName, address, pointWKT]);

    return res.status(201).json({
      message: 'Entrega criada e geocodificada com sucesso!',
      data: {
        id: result.insertId,
        codigoRastreio,
        clientName,
        address,
        enderecoEncontrado: displayName,
        latitude,
        longitude,
      },
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Erro ao criar entrega:', error);
    return next(error);
  }
}

// GET /api/deliveries
export async function getDeliveries(req, res, next) {
  try {
    const [rows] = await db.query(`
      SELECT
        e.id_entregas AS id,
        e.codigo_rastreio AS titulo,
        COALESCE(m.nome, 'Sem motorista') AS motorista,
        COALESCE(e.nome_cliente, c.nome) AS cliente,
        e.status,
        e.endereco_destino,
        ST_X(e.coordenadas_destino) AS destino_lng,
        ST_Y(e.coordenadas_destino) AS destino_lat,
        -23.550520 AS origem_lat,
        -46.633308 AS origem_lng
      FROM entregas e
      LEFT JOIN motoristas m ON m.id_motoristas = e.id_motorista
      LEFT JOIN cadastro c ON c.id = e.id_cliente
      ORDER BY e.id_entregas DESC
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar entregas:', error);
    return next(error);
  }
}