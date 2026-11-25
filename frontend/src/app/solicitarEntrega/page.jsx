"use client";

import React, { useState } from 'react';
import { MapPin, Flag, Calendar, Box, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import Header from '../components/Header-usuarios';
import '../Main-usuario/pagemain.css';
import './SolicitarEntrega.css';

export default function SolicitarEntrega() {
  const [formData, setFormData] = useState({
    coleta: '', destino: '', data: '', servico: '', observacoes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Solicitação enviada!');
  };

  return (
    <div className="page-container">
      <Header />

      <section className="banner request-hero-banner">
        <div className="banner-text">
          <span className="banner-label">PORTAL DO CLIENTE · LOGITRACK</span>
          <h1>Solicitar entrega</h1>
          <p>Preencha as informações abaixo para solicitar seu serviço de entrega.</p>
        </div>
      </section>

      <main className="request-main-content">
        <div className="form-card">
          <div className="card-header">
            <div className="card-header-icon"><Box size={20} /></div>
            <h2>Dados da Entrega</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label><MapPin size={16} /> Endereço de Coleta</label>
                <div className="input-wrapper">
                  <input type="text" name="coleta" placeholder="Digite o endereço completo" className="form-control" onChange={handleChange} required />
                  <MapPin size={16} className="input-icon-right" />
                </div>
              </div>

              <div className="form-group">
                <label><Flag size={16} /> Endereço de Destino</label>
                <div className="input-wrapper">
                  <input type="text" name="destino" placeholder="Digite o endereço completo" className="form-control" onChange={handleChange} required />
                  <MapPin size={16} className="input-icon-right" />
                </div>
              </div>

              <div className="form-group">
                <label><Calendar size={16} /> Data Desejada para Coleta</label>
                <input type="date" name="data" className="form-control" onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label><Box size={16} /> Tipo de Serviço</label>
                <select name="servico" className="form-control" onChange={handleChange} defaultValue="" required>
                  <option value="" disabled>Selecione o tipo de serviço</option>
                  <option value="expressa">Entrega Expressa</option>
                  <option value="convencional">Carga Convencional</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label><MessageSquare size={16} /> Observações (opcional)</label>
              <textarea name="observacoes" rows="3" placeholder="Adicione informações extras sobre sua entrega..." className="form-control" onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-back" onClick={() => window.history.back()}>
                <ArrowLeft size={16} /> Voltar para início
              </button>
              <button type="submit" className="btn-submit">
                <Send size={16} /> Solicitar Entrega
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="footer-bar" />
    </div>
  );
}
