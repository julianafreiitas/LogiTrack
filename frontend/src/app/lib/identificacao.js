"use client";

// Guarda o id selecionado do motorista e o id autenticado do cliente no navegador.

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./api";

const CONFIG = {
  motorista: { chave: "logitrack:motoristaId", lista: "/portal/motorista" },
  cliente: { chave: "logitrack:clienteId", lista: "/portal/cliente" },
};

export function salvarSessaoCliente(cliente, token) {
  window.localStorage.setItem(CONFIG.cliente.chave, String(cliente.id));
  window.localStorage.setItem("logitrack:clienteToken", token);
}

export function salvarSessaoAdmin(usuario, token) {
  window.localStorage.setItem("logitrack:adminId", String(usuario.id));
  window.localStorage.setItem("logitrack:adminToken", token);
  window.localStorage.setItem("logitrack:admin", JSON.stringify(usuario));
}

export function limparSessaoCliente() {
  window.localStorage.removeItem(CONFIG.cliente.chave);
  window.localStorage.removeItem("logitrack:clienteToken");
}

// GET/PATCH na API devolvendo JSON; lança Error com a mensagem do servidor quando falha
export async function chamarApi(caminho, opcoes) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(opcoes?.headers ?? {}) },
  });
  const texto = await resposta.text();
  let dados = {};
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      // Respostas HTML/texto de proxy também precisam virar erros legíveis.
    }
  }
  if (!resposta.ok) {
    const erro = new Error(dados.message || dados.error || dados.erro || `Não foi possível completar a operação (HTTP ${resposta.status}).`);
    erro.status = resposta.status;
    throw erro;
  }
  if (!texto || dados === null || typeof dados !== "object") {
    throw new Error("O servidor retornou uma resposta inválida. Tente novamente.");
  }
  return dados;
}

export function useIdentificacao(tipo) {
  const { chave, lista: caminhoLista } = CONFIG[tipo];
  const [lista, setLista] = useState([]);
  const [id, setId] = useState(null);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    chamarApi(caminhoLista)
      .then((dados) => {
        if (cancelado) return;
        let salvo = null;
        try {
          salvo = Number(window.localStorage.getItem(chave));
        } catch {
          // localStorage indisponível: segue com o primeiro da lista
        }
        const escolhido = dados.find((item) => item.id === salvo) ?? dados[0] ?? null;
        setLista(dados);
        setId(escolhido ? escolhido.id : null);
      })
      .catch((falha) => {
        if (!cancelado) setErro(falha.message);
      })
      .finally(() => {
        if (!cancelado) setPronto(true);
      });

    return () => {
      cancelado = true;
    };
  }, [caminhoLista, chave]);

  const escolher = useCallback(
    (novoId) => {
      setId(novoId);
      try {
        window.localStorage.setItem(chave, String(novoId));
      } catch {
        // sem localStorage a escolha vale só até recarregar a página
      }
    },
    [chave],
  );

  return { lista, id, escolher, pronto, erro, atual: lista.find((item) => item.id === id) ?? null };
}
