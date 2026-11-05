import { getCoordinates } from '../services/geocodeService.js';
// Importe também a sua conexão com o banco de dados aqui, se necessário

export async function createDelivery(req, res, next) {
  try {
    const { clientName, address } = req.body;

    // Converte o endereço em latitude e longitude usando o Nominatim
    const { latitude, longitude } = await getCoordinates(address);

    // Exemplo de inserção no MySQL (ajuste conforme a sua tabela):
    // const query = 'INSERT INTO deliveries (client_name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    // await db.query(query, [clientName, address, latitude, longitude]);

    return res.status(201).json({
      message: 'Entrega criada com sucesso!',
      data: {
        clientName,
        address,
        latitude,
        longitude
      }
    });
  } catch (error) {
    next(error);
  }
}