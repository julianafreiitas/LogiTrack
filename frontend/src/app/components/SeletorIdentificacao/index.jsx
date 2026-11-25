"use client";

import "./seletor.css";

// Seletor provisório de "quem está logado" (motorista ou cliente), só para testar.
export default function SeletorIdentificacao({ rotulo, lista, id, onChange }) {
  if (!lista || lista.length === 0) return null;

  return (
    <label className="seletor-id">
      <span>{rotulo}</span>
      <select value={id ?? ""} onChange={(event) => onChange(Number(event.target.value))} aria-label={rotulo}>
        {lista.map((item) => (
          <option key={item.id} value={item.id}>{item.nome}</option>
        ))}
      </select>
    </label>
  );
}
