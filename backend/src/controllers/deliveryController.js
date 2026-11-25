import { getCoordinates } from '../services/geocodeService.js';
import db from '../config/database.js';

function gerarCodigoRastreio() {
  const sufixo = Math.random().toString(36).slice(2, 4);
  return `ENT-${Date.now().toString(36)}${sufixo}`.toUpperCase();
}

function criarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
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
        DATE_FORMAT(e.previsao, '%Y-%m-%dT%H:%i:%s') AS previsao,
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

// POST /api/deliveries/quote: calcula uma estimativa sem criar a entrega.
export async function quoteDelivery(req, res, next) {
  try {
    const coleta = String(req.body?.coleta ?? '').trim();
    const destino = String(req.body?.destino ?? '').trim();
    const servico = String(req.body?.servico ?? '');
    const tamanho = String(req.body?.tamanho ?? 'medio');
    const urgencia = String(req.body?.urgencia ?? 'normal');
    const pesoKg = Number(req.body?.pesoKg ?? 0);

    if (!coleta || !destino || coleta.length > 255 || destino.length > 255) {
      return res.status(400).json({ error: 'Informe endereços válidos de coleta e destino (máx. 255 caracteres).' });
    }
    if (!['expressa', 'convencional'].includes(servico) || !['pequeno', 'medio', 'grande'].includes(tamanho) || !['normal', 'urgente'].includes(urgencia)) {
      return res.status(400).json({ error: 'Opções de serviço ou pacote inválidas.' });
    }
    if (!Number.isFinite(pesoKg) || pesoKg < 0 || pesoKg > 1000) {
      return res.status(400).json({ error: 'Informe um peso entre 0 e 1000 kg.' });
    }

    const origemCoords = await getCoordinates(coleta);
    // O Nominatim pede intervalo entre consultas feitas pelo mesmo cliente.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const destinoCoords = await getCoordinates(destino);

    const routeUrl = new URL(`https://router.project-osrm.org/route/v1/driving/${origemCoords.longitude},${origemCoords.latitude};${destinoCoords.longitude},${destinoCoords.latitude}`);
    routeUrl.searchParams.set('overview', 'false');
    const routeResponse = await fetch(routeUrl, { signal: AbortSignal.timeout(10000) });
    if (!routeResponse.ok) throw criarErro('Não foi possível calcular a distância da rota. Tente novamente.', 502);
    const routeData = await routeResponse.json();
    const distanceMeters = routeData?.routes?.[0]?.distance;
    if (!Number.isFinite(distanceMeters)) throw criarErro('Não foi possível encontrar uma rota entre os endereços.', 422);

    const distanciaKm = distanceMeters / 1000;
    const taxaBase = 12;
    const valorPorKm = 2.5;
    const adicionalTamanho = { pequeno: 0, medio: 8, grande: 18 }[tamanho];
    const adicionalPeso = pesoKg * 1.2;
    const multiplicadorServico = servico === 'expressa' ? 1.35 : 1;
    const multiplicadorUrgencia = urgencia === 'urgente' ? 1.25 : 1;
    const subtotal = (taxaBase + distanciaKm * valorPorKm + adicionalTamanho + adicionalPeso) * multiplicadorServico * multiplicadorUrgencia;

    return res.status(200).json({
      distanciaKm: Number(distanciaKm.toFixed(1)),
      taxaBase,
      valorPorKm,
      adicionalTamanho,
      adicionalPeso: Number(adicionalPeso.toFixed(2)),
      multiplicadorServico,
      multiplicadorUrgencia,
      total: Number(subtotal.toFixed(2)),
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('Erro ao calcular orçamento da entrega:', error);
    return next(error);
  }
}
