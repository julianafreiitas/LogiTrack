"use client";

import { useState } from "react";
import { Search, Calendar, ChevronLeft, Truck, Package, CheckCircle2, User } from 'lucide-react'; 

export default function AcompanharEntrega() {
  const [busca, setBusca] = useState("");
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // Função para simular o clique no botão "Consultar"
  const handleConsultar = () => {
    if (busca.trim() !== "") {
      setMostrarResultado(true);
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. Header / Navbar */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={{ color: '#0F172A', fontWeight: 'bold' }}>Logi</span>
          <span style={{ color: '#F97316', fontWeight: 'bold' }}>Track</span>
        </div>
        <nav style={styles.nav}>
          <a href="#" style={styles.navLink}>Solicitar entrega</a>
          <a href="#" style={{ ...styles.navLink, ...styles.navLinkActive }}>Acompanhar entrega</a>
        </nav>
        <div style={styles.avatar}>
          <User size={20} color="#64748B" />
        </div>
      </header>

      {/* 2. Banner Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Acompanhar Entrega</h1>
        <p style={styles.heroSubtitle}>
          Informe o código da sua entrega<br />
          para acompanhar o status em tempo real.
        </p>
      </section>

      {/* 3. Seção do Input de Busca */}
      <section style={styles.searchSection}>
        <label style={styles.searchLabel}>
          <Search size={18} color="#0F172A" style={{ marginRight: '8px' }} />
          Código da Entrega
        </label>
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="Digite o código da sua entrega"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleConsultar} style={styles.btnConsultar}>
            <Search size={16} color="#FFF" style={{ marginRight: '6px' }} />
            Consultar
          </button>
        </div>
      </section>

      {/* 4. Card de Resultados (Só aparece se o usuário buscar) */}
      {mostrarResultado && (
        <section style={styles.resultCard}>
          <div style={styles.statusInfoGrid}>
            <div style={styles.statusMain}>
              <div style={styles.iconBox}>
                <Package size={28} color="#F97316" />
              </div>
              <div>
                <span style={styles.statusLabel}>Status da sua entrega</span>
                <h3 style={styles.statusTitle}>Em trânsito</h3>
                <p style={styles.statusDesc}>Sua entrega está a caminho do destino.</p>
              </div>
            </div>

            <div style={styles.deliveryDateBox}>
              <Calendar size={24} color="#0F172A" style={{ marginRight: '12px' }} />
              <div>
                <span style={styles.dateLabel}>Previsão de chegada</span>
                <h4 style={styles.dateValue}>Hoje, até 18h</h4>
              </div>
            </div>
          </div>

          {/* Linha do Tempo (Stepper) */}
          <div style={styles.timeline}>
            <div style={styles.timelineStep}>
              <div style={{ ...styles.stepCheck, backgroundColor: '#0F172A' }}><CheckCircle2 size={14} color="#FFF" /></div>
              <span style={styles.stepText}>Solicitação<br/>recebida</span>
            </div>
            <div style={styles.timelineLine}></div>
            <div style={styles.timelineStep}>
              <div style={{ ...styles.stepCheck, backgroundColor: '#0F172A' }}><CheckCircle2 size={14} color="#FFF" /></div>
              <span style={styles.stepText}>Coleta<br/>realizada</span>
            </div>
            <div style={{ ...styles.timelineLine, backgroundColor: '#F97316' }}></div>
            <div style={styles.timelineStep}>
              <div style={{ ...styles.stepCheck, backgroundColor: '#F97316' }}><Truck size={14} color="#FFF" /></div>
              <span style={{ ...styles.stepText, fontWeight: 'bold', color: '#0F172A' }}>Em trânsito</span>
            </div>
            <div style={{ ...styles.timelineLine, backgroundColor: '#E2E8F0' }}></div>
            <div style={styles.timelineStep}>
              <div style={{ ...styles.stepCheck, backgroundColor: '#E2E8F0' }}></div>
              <span style={{ ...styles.stepText, color: '#94A3B8' }}>Entregue</span>
            </div>
          </div>
        </section>
      )}

      {/* 5. Botão Voltar */}
      <footer style={styles.footer}>
        <button style={styles.btnVoltar}>
          <ChevronLeft size={18} style={{ marginRight: '4px' }} />
          Voltar
        </button>
      </footer>
    </div>
  );
}