# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2026-03-15

### ✨ Experiência Fluida & Micro-Interações
- **Animações Framer Motion**: Implementação de sistema de animações em todo o app. Cards agora respondem ao toque e hover com efeitos de escala e transições elásticas.
- **Entrada Orgânica**: Modais de estatísticas e detalhes agora utilizam transições `Spring` e desfoque de fundo gradativo.
- **Micro-feedback**: Efeitos visuais ao interagir com botões de ação para uma sensação de interface "viva".

### ⚡ Produtividade "Fast Action"
- **Ações Rápidas nos Cards (Mobile)**: Botões de WhatsApp e Edição integrados diretamente nos cards de OS e Estoque. Menos toques para as tarefas mais comuns.
- **Ajuste de Estoque Direto**: Botões de +/- quantidade visíveis nos cards de inventário mobile, eliminando a necessidade de abrir o formulário para ajustes simples.

### 📄 Documentos & Recibos
- **Preview de Recibo em Tempo Real**: Nova área de visualização no desktop que reflete instantaneamente as configurações de impressão (CPF, Garantia, Técnicos).
- **Refatoração de Layout**: Código unificado para garantir que o preview seja identico à impressão final (A4 ou Térmica).
- **Recibo Térmico 80mm**: Otimização de espaçamento e fontes para impressoras térmicas padrão.

### 🧩 Outras Melhorias
- **Dashboard Mobile Clean**: Ocultação automática de cards de estatísticas no mobile para priorizar a lista de ordens e agilizar o fluxo visual.
- **ConfirmModal Custom**: Novo modal reutilizável de confirmação com suporte a Bottom Sheet mobile, substituindo diálogos nativos do navegador (`window.confirm`) no PDV e Exclusão.


## [1.0.0] - 2026-03-14

### 🚀 Modernização UI/UX "Pro Max"
- **Novo Calendário Customizado**: Design premium com seleção circular, animações suaves e navegação facilitada.
- **DatePicker Adaptável**: Nova experiência de seleção de data com Popovers no Desktop e Bottom Sheets (arrastáveis) no Mobile.
- **CustomDropdown Inteligente**: Seletor customizado com busca integrada, suporte a sub-legendas e adaptação automática para Mobile.
- **Página de Configurações**: Refatoração completa para layout de lista vertical intuitivo (estilo iOS/Telegram).

### 📱 Navegação Mobile
- **Barra de Navegação Otimizada**: Redesign da navbar com 5 botões estrategicos (Início, Ordens, Novo +, Relatórios, Mais).
- **Menu "Mais" Limpo**: Remoção de itens redundantes (Relatórios) para uma interface mais direta.
- **Menu "Mais"**: Consolidação de ações secundárias (Troca de Tema, Logout, Clientes, Estoque) em um popover elegante.
- **Gestos Mobile**: Implementação de "Pull-to-close" (arrastar para fechar) em modais e seletores no mobile.

### 📋 Gestão de Ordens
- **Formulário de OS Modernizado**: Novo layout de campos com bordas arredondadas (24px), inputs de alta visibilidade e seleção de clientes via dropdown com busca.
- **PDV Mobile Otimizado**: Correção de travamento no scroll e melhoria na visibilidade do carrinho.
- **Layout de Itens Avulsos**: Reorganização dos campos de adição manual (OS e PDV) para evitar rolagem lateral e garantir visibilidade total em dispositivos móveis.
- **Status "Retirada"**: Renomeação do status "Aguardando Pagamento" para "Aguardando Retirada" em todo o sistema.
- **Detalhes da Ordem**: Substituição de seletores padrão do navegador por `CustomDropdowns` modernos no gerenciamento de status.
- **WhatsApp Inteligente**: Atualização das mensagens rápidas para refletir o novo status de retirada.
- **Estilo Glassmorphism**: Aplicação de efeitos de transparência e desfoque em menus e sobreposições.

### 🛠️ Correções e Ajustes
- **Ajuste de Calendário**: Correção do erro que deixava o calendário "espremido" no Dashboard e Ordens.
- **Estabilidade**: Correção de imports ausentes e otimização de performance nas transições de página.
- **Responsividade**: Ajuste fino em todos os novos componentes para garantir visual perfeito em qualquer tamanho de tela.

---
Desenvolvido com ❤️ para HcCell Assistência Técnica
