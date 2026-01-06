# HcCell - Sistema de Assistência Técnica

Sistema completo de gerenciamento para assistências técnicas de celulares e eletrônicos.

![HcCell Logo](public/logo-full.png)

## 🚀 Funcionalidades

- **Dashboard** - Visão geral com métricas e gráficos
- **Gestão de Clientes** - Cadastro e histórico de clientes
- **Ordens de Serviço** - Controle completo de reparos
- **Estoque** - Gerenciamento de peças e produtos
- **Categorias** - Organização do inventário
- **Relatórios** - Faturamento, serviços e análises
- **Rastreamento** - Link público para clientes acompanharem
- **Impressão** - Recibos (A4 e Térmica 80mm) e etiquetas
- **PWA** - Instalável como aplicativo

## 🛠️ Tecnologias

- **Frontend:** React 19 + TypeScript
- **Estilização:** Tailwind CSS
- **Roteamento:** React Router DOM
- **Backend:** Supabase (PostgreSQL + Auth)
- **Gráficos:** Recharts
- **Build:** Vite
- **PWA:** Vite PWA Plugin

## 📦 Instalação

```bash
# Clonar repositório
git clone https://github.com/pedrokstro/HcCell.git
cd HcCell

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Iniciar desenvolvimento
npm run dev
```

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 🌐 Deploy na Vercel

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático!

## 📱 PWA

O sistema é um Progressive Web App e pode ser instalado:

- **Android:** Chrome → Menu ⋮ → "Instalar app"
- **iOS:** Safari → Compartilhar → "Adicionar à Tela de Início"

## 📄 Licença

Este projeto é privado e de uso exclusivo da HcCell.

---

Desenvolvido com ❤️ para HcCell Assistência Técnica
