---
name: HcCell Assistência Técnica
description: Sistema premium de gerenciamento operacional e financeiro para assistência de celulares e dispositivos.
colors:
  primary: "#00CCFF"
  primary-dark: "#00A3CC"
  primary-light: "#E6FAFF"
  neutral-bg-light: "#F8FAFC"
  neutral-bg-dark: "#020617"
  neutral-surface-light: "#FFFFFF"
  neutral-surface-dark: "#0F172A"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.neutral-surface-light}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: HcCell Assistência Técnica

## 1. Overview

**Creative North Star: "The Neon Workbench (A Bancada Neon)"**

O sistema de design da HcCell é concebido sob uma atmosfera moderna, tecnológica e premium. Ele contrasta superfícies profundas (dark slate) com toques vibrantes de ciano neon e verde esmeralda, remetendo a componentes de hardware iluminados e à precisão da engenharia de bancada. O visual foi estruturado para ser altamente legível sob qualquer iluminação e extremamente ágil para proprietários e técnicos na tomada de decisão móvel.

Este sistema rejeita expressamente elementos visuais amadores, como templates prontos ou caixas poluídas sem contraste adequado. O foco principal é a velocidade de escaneamento de informações e a intuitividade dos fluxos.

**Key Characteristics:**
- Interfaces limpas com foco exclusivo nas métricas essenciais.
- Elementos com contornos sutis para demarcação de conteúdo sem poluição.
- Transições de toque altamente fluidas para simular o comportamento de um aplicativo nativo.

## 2. Colors

A paleta é centrada em tons de ciano neon e esmeralda sobre fundos neutros e escuros profundos de alto contraste.

### Primary
- **Neon Cyan** (#00CCFF): Cor de acento principal. Utilizada para marcar estados ativos, links de destaque, linhas de progresso e elementos interativos principais.

### Neutral
- **Slate Dark Background** (#020617): O fundo profundo no modo escuro que reduz a fadiga ocular durante longas sessões de uso.
- **Slate Light Background** (#F8FAFC): O fundo limpo e suave para o modo claro.
- **Surface Dark** (#0F172A): O container para cartões e modais no modo escuro.
- **Surface Light** (#FFFFFF): O container para cartões e modais no modo claro.

### Named Rules
**The 10% Cyan Rule.** O ciano neon é uma cor de alta energia. Para manter o aspecto premium, ele deve cobrir no máximo 10% da área útil de qualquer tela, concentrando-se em CTAs primários, estados selecionados e marcadores de foco.

## 3. Typography

**Display Font:** Inter, sans-serif
**Body Font:** Inter, sans-serif

### Hierarchy
- **Display** (Bold 900, clamp(2rem, 5vw, 3.5rem), 1.1): Reservado para títulos principais, cabeçalhos de páginas e grandes destaques numéricos (ex: faturamento).
- **Headline** (Bold 800, 1.25rem, 1.2): Utilizado em títulos de cards e modais principais.
- **Title** (Bold 700, 1rem, 1.2): Títulos de seções internas e tabelas.
- **Body** (Medium 500, 0.875rem (14px), 1.5): Texto padrão de leitura e corpo de cartões.
- **Label** (Bold 900, 0.6875rem (11px), 1.2, uppercase, tracked wide): Usado em tags, badges de status, pequenas legendas e cabeçalhos de tabela.

### Named Rules
**The Dynamic Sizing Rule.** O tamanho dos textos deve variar claramente para estabelecer contraste imediato. O uso de pesos contrastantes (ex: Ultra-bold para títulos e Medium para descrições) é preferido em vez de variações pequenas de tamanhos de fonte.

## 4. Elevation

O sistema utiliza sombreamento difuso combinado com bordas extremamente sutis para criar profundidade física sem sobrecarga visual.

### Shadow Vocabulary
- **Primary Glow** (`0 0 15px rgba(0, 204, 255, 0.3)`): Usado exclusivamente em estados de foco ativo ou botões de status selecionados.
- **Glass Shadow** (`0 8px 32px 0 rgba(0, 204, 255, 0.1)`): Sombras de containers no modo claro.
- **Glass Dark Shadow** (`0 8px 32px 0 rgba(0, 0, 0, 0.4)`): Sombras profundas para modais e pop-ups no modo escuro.

### Named Rules
**The No-Double-Decoration Rule.** Nunca combine sombras largas com bordas grossas coloridas. Elementos devem ser definidos por uma borda sutil de 1px (de baixa opacidade) ou por uma sombra suave, nunca por ambos ao mesmo tempo.

## 5. Components

### Buttons
- **Shape:** Arredondamento médio (12px / rounded-xl).
- **Primary:** Fundo ciano (#00CCFF) com texto branco ou escuro de alto contraste.
- **Hover / Focus:** Transição de subida suave (`translate-y-[-2px]`) com brilho sutil (`shadow-primary-glow`).

### Cards / Containers
- **Corner Style:** Arredondamento suave (16px / rounded-2xl ou 24px / rounded-3xl).
- **Background:** Branco (#FFFFFF) ou Slate Escuro (#0F172A).
- **Border:** 1px sólido de baixa opacidade para contraste de borda.

### Inputs / Fields
- **Style:** Fundo suave Slate 50 no modo claro, com borda sutil e foco contornado em ciano.

### Navigation
- **Mobile Navigation:** Sidebar retrátil e pílulas de alternância rápida na parte inferior da viewport para facilitar o alcance do polegar.

## 6. Do's and Don'ts

### Do:
- **Do** usar animações de pulso suave e expansivo com Framer Motion em elementos de status ativos (ex: stepper de ordens).
- **Do** manter contraste mínimo de 4.5:1 para qualquer texto sobre fundo cinza ou escuro.
- **Do** usar o backdrop blur (`backdrop-blur-sm`) para focar a atenção do usuário no modal ativo.

### Don't:
- **Don't** usar degradê de texto com `background-clip: text`. Utilize cores sólidas de alto contraste.
- **Don't** aplicar bordas coloridas de destaque vertical (como borda esquerda colorida de 4px) em cards de alertas ou registros.
- **Don't** utilizar cantos excessivamente arredondados superiores a 24px em inputs ou cartões padrão da interface.
