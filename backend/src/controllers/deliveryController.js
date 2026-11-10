import { getCoordinates } from '../services/geocodeService.js';
import db from '../config/database.js';

export async function createDelivery(req, res, next) {
    try {
        const { clientName, address } = req.body;

        if (!clientName || !address) {
            return res.status(400).json({ error: 'Nome do cliente e endereço são obrigatórios.' });
        }

        // 1. Converte o endereço em latitude e longitude usando o Nominatim
        const { latitude, longitude } = await getCoordinates(address);

        // 2. Gera um código de rastreio único (ex: ENT-timestamp)
        const codigoRastreio = `ENT-${Date.now().toString().slice(-6)}`;

        // 3. Inserção ajustada para as colunas reais do banco de dados (usando POINT para geolocalização)
        // Nota: No MySQL POINT, a ordem padrão é (Longitude, Latitude)
        const query = `
            INSERT INTO entregas (codigo_rastreio, id_cliente, endereco_destino, coordenadas_destino, status)
            VALUES (?, 1, ?, ST_GeomFromText(?), 'Pendente')
        `;
        
        const pointWKT = `POINT(${longitude} ${latitude})`;
        const [result] = await db.execute(query, [codigoRastreio, address, pointWKT]);

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
// Função para listar todas as entregas e retornar um array puro para o frontend
export async function getDeliveries(req, res, next) {
    try {
        const [rows] = await db.query("SELECT * FROM entregas");
        return res.status(200).json(rows); // Retorna os registos como array JSON
    } catch (error) {
        console.error('Erro ao buscar entregas:', error);
        next(error);
    }
}