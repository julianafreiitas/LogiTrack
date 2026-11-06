import { getCoordinates } from '../services/geocodeService.js';
import db from '../config/database.js'; // Certifica-te de que o caminho para a tua conexão db está correto

export async function createDelivery(req, res, next) {
  try {
    const { clientName, address } = req.body;

    if (!clientName || !address) {
      return res.status(400).json({ error: 'Nome do cliente e endereço são obrigatórios.' });
    }

    // Converte o endereço em latitude e longitude usando o serviço de geocodificação
    const { latitude, longitude } = await getCoordinates(address);

    // Gera um código de rastreio único simples (ex: ENT-TIMESTAMP)
    const codigoRastreio = `ENT-${Date.now().toString().slice(-6)}`;

    // Inserção real na base de dados MySQL
    const query = `
      INSERT INTO entregas (codigo_rastreio, cliente, endereco, latitude, longitude, status) 
      VALUES (?, ?, ?, ?, ?, 'Pendente')
    `;
    
    const [result] = await db.execute(query, [codigoRastreio, clientName, address, latitude, longitude]);

    return res.status(201).json({
      message: 'Entrega criada e geocodificada com sucesso!',
      data: {
        id: result.insertId,
        codigoRastreio,
        clientName,
        address,
        latitude,
        longitude
      }
    });
  } catch (error) {
    console.error('Erro ao criar entrega:', error);
    next(error);
  }
}