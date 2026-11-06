import axios from 'axios';

export async function getCoordinates(address) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'LogiTrack-App'
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      };
    }
    throw new Error('Endereço não encontrado.');
  } catch (error) {
    console.error('Erro na geocodificação:', error.message);
    throw error;
  }
}