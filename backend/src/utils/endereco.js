// Os endereços do banco seguem o padrão "Rua X, 123 - Bairro, Cidade - UF",
// mas entregas criadas pela tela de solicitação podem ter texto livre.
// Estas funções quebram o texto sem falhar quando o formato for outro.

function partes(endereco) {
  return String(endereco ?? "").split(" - ").map((parte) => parte.trim());
}

// "Rua X, 123"
export function ruaNumero(endereco) {
  const lista = partes(endereco);
  if (lista.length > 1) return lista[0];
  const virgulas = lista[0].split(",").map((parte) => parte.trim());
  return virgulas.length > 2 ? virgulas.slice(0, 2).join(", ") : lista[0];
}

// "Bairro, Cidade - UF"
export function localidade(endereco) {
  const lista = partes(endereco);
  if (lista.length > 1) return lista.slice(1).join(" - ");
  const virgulas = lista[0].split(",").map((parte) => parte.trim());
  return virgulas.length > 2 ? virgulas.slice(2).join(", ") : "";
}

// "Cidade, UF"
export function cidadeDoEndereco(endereco) {
  const lista = partes(endereco);
  if (lista.length >= 3) {
    const cidade = lista[lista.length - 2].split(",").pop().trim();
    return `${cidade}, ${lista[lista.length - 1]}`;
  }
  if (lista.length === 2) return lista[1];
  const virgulas = lista[0].split(",").map((parte) => parte.trim());
  return virgulas.length >= 2 ? virgulas.slice(-2).join(", ") : lista[0];
}

export function iniciais(nome) {
  return String(nome ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
