# Plano de Modernização Visual HcCell - "Technical Precision 2025"

Este documento detalha as etapas para elevar o **HcCell** ao nível de um software industrial/técnico *premium*, utilizando o Ciano (#00CCFF) como cor de destaque central.

## 🎨 Compromisso de Design

*   **Estilo:** Technical Precision (Inspirado em painéis de aviação e interfaces de precisão).
*   **Geometria:** Transição de `rounded-xl` (12px) para **Sharp/Crisp (4px)** em elementos de interface e **0px** em divisores, transmitindo maior seriedade técnica.
*   **Destaque:** O Ciano será usado em estados de `hover`, `focus` e indicadores ativos, criando um efeito de "luz de painel".
*   **Tipografia:** Foco em hierarquia pesada. Inter Extra Bold para títulos e Mono para códigos de OS/Valores.

---

## 🛠️ Cronograma de Implementação

### Fase 1: Fundação do Design System
- [x] **Configuração Tailwind:** Refinar `tailwind.config.js` com tokens de espaçamento e cores industriais.
- [x] **Global CSS:** Implementar efeitos de profundidade e animações de reveal escalonadas.

### Fase 2: Componentes Estruturais
- [x] **Sidebar Profissional:** Redesign da barra lateral com efeitos de vidro fosco no modo escuro e indicadores ativos em ciano neon.
- [x] **Mobile Navigation:** Redesign do menu móvel para consistência técnica.
- [ ] **Header de Navegação:** Implementar um cabeçalho mais "limpo" com breadcrumbs dinâmicos.

### Fase 3: Dashboard (O Maestro)
- [x] **Stats Widgets:** Substituir caixas simples por widgets técnicos com micro-gráficos.
- [ ] **Empty States:** Criar artes vetoriais minimalistas com o ciano de destaque.

### Fase 4: Telas Analíticas (OS & Inventário)
- [/] **Tabelas de Dados:** Modernizar as tabelas (Iniciado no Dashboard).
- [ ] **Cartões de Serviço:** Design de "etiqueta técnica" para as ordens de serviço.

---

## ✅ Critérios de Sucesso
- [ ] Zero erros de TypeScript.
- [ ] Nota 90+ no Lighthouse (Performance/Best Practices).
- [ ] Interface visualmente memorável e diferenciada de templates SaaS comuns.
