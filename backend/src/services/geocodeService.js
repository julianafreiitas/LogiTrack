const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function criarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

export async function getCoordinates(address) {
  const params = new URLSearchParams({
    q: address,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'br',
  });

  let response;
  try {
    response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        // O Nominatim exige um User-Agent que identifique a aplicação
        'User-Agent': process.env.GEOCODER_USER_AGENT || 'LogiTrack/1.0 (projeto academico)',
        'Accept-Language': 'pt-BR',
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error('Falha ao consultar o Nominatim:', error);
    throw criarErro('Serviço de geocodificação indisponível. Tente novamente.', 502);
  }

  if (!response.ok) {
    throw criarErro('O serviço de geocodificação retornou um erro.', 502);
  }

  const resultados = await response.json();

  if (!Array.isArray(resultados) || resultados.length === 0) {
    throw criarErro('Endereço não encontrado. Informe rua, número e cidade.', 404);
  }

  const { lat, lon, display_name: displayName } = resultados[0];
  const latitude = Number.parseFloat(lat);
  const longitude = Number.parseFloat(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw criarErro('O serviço de geocodificação retornou coordenadas inválidas.', 502);
  }

  return { latitude, longitude, displayName };
}