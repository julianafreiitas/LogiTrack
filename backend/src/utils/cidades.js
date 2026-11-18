// Coordenadas (longitude, latitude) das cidades usadas pelo sistema.
// Servem para preencher a posição inicial de um motorista novo.
const cidades = {
  "sao paulo": [-46.6333, -23.5505],
  campinas: [-47.0608, -22.9099],
  santos: [-46.3336, -23.9608],
  "sao bernardo": [-46.565, -23.6914],
  "sao bernardo do campo": [-46.565, -23.6914],
  sorocaba: [-47.4526, -23.5015],
  jundiai: [-46.8842, -23.1857],
  "santo andre": [-46.5383, -23.6639],
  guarulhos: [-46.5333, -23.4543],
  osasco: [-46.7919, -23.5325],
  maua: [-46.4613, -23.6677],
};

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Cidade desconhecida cai em São Paulo.
export function pontoDaCidade(cidade) {
  const [lng, lat] = cidades[normalizar(cidade)] || cidades["sao paulo"];
  return `POINT(${lng} ${lat})`;
}
