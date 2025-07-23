# 🚀 NXT.AI Production Platform

<div align="center">
  <img src="https://via.placeholder.com/200x200/2563eb/ffffff?text=NXT.AI" alt="NXT.AI Logo" width="200"/>
  
  [![Deploy Status](https://github.com/iceesurf/nxt-ai-production/workflows/Deploy%20NXT.AI/badge.svg)](https://github.com/iceesurf/nxt-ai-production/actions)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)](https://nodejs.org/)
  [![Firebase](https://img.shields.io/badge/firebase-10+-orange.svg)](https://firebase.google.com/)
</div>

## 📋 Visão Geral

NXT.AI é uma plataforma completa de automação inteligente que oferece:

- **🤖 Chatbots Inteligentes**: Powered by Dialogflow CX
- **📊 CRM Integrado**: Gestão completa de leads e clientes
- **📱 Multi-canal**: WhatsApp, Web, Email e mais
- **📈 Analytics Avançado**: Métricas em tempo real com BigQuery
- **🔒 Seguro**: Autenticação robusta e regras de segurança
- **☁️ Cloud-Native**: Totalmente baseado no Google Cloud Platform

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Google Cloud SDK
- Firebase CLI
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/iceesurf/nxt-ai-production.git
cd nxt-ai-production
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Google Cloud

```bash
# Login no Google Cloud
gcloud auth login

# Execute o setup automático
./scripts/setup-gcp.sh
```

### 4. Configure o Firebase

```bash
# Login no Firebase
firebase login

# Selecione o projeto
firebase use nxt-ai-dev  # ou nxt-ai-stg/nxt-ai-prod
```

### 5. Deploy da Aplicação

```bash
# Deploy completo
./scripts/deploy.sh dev

# Ou manualmente
npm run build:all
firebase deploy
```

### 6. Acesse a Aplicação

- **Development**: https://nxt-ai-dev.web.app
- **Staging**: https://nxt-ai-stg.web.app  
- **Production**: https://nxt-ai-prod.web.app

## 📁 Estrutura do Projeto

```
nxt-ai-production/
├── packages/
│   ├── shared/           # Tipos e serviços compartilhados
│   ├── web/             # Aplicação React
│   ├── functions/       # Cloud Functions
│   ├── mobile/          # App React Native (futuro)
│   └── admin/           # Painel administrativo (futuro)
├── dialogflow/          # Configuração do Dialogflow CX
├── scripts/             # Scripts de automação
├── .github/            # GitHub Actions
├── firebase.json       # Configuração Firebase
├── firestore.rules     # Regras de segurança
└── package.json        # Configuração do monorepo
```

## 💻 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                # Inicia servidor de desenvolvimento
npm run build:all          # Build completo

# Deploy
npm run deploy:dev         # Deploy para desenvolvimento
npm run deploy:stg         # Deploy para staging  
npm run deploy:prod        # Deploy para produção

# Scripts utilitários
./scripts/setup-gcp.sh     # Setup inicial do GCP
./scripts/deploy.sh        # Deploy script customizado
./scripts/test-system.sh   # Validação do sistema
```

## 🔧 Configuração

### Ambientes

| Ambiente | URL | Projeto GCP |
|----------|-----|-------------|
| Development | https://nxt-ai-dev.web.app | `nxt-ai-dev` |
| Staging | https://nxt-ai-stg.web.app | `nxt-ai-stg` |
| Production | https://nxt-ai-prod.web.app | `nxt-ai-prod` |

## 📚 Documentação Completa

Para documentação detalhada, incluindo:
- Configuração de ambientes
- Integração WhatsApp
- Setup do Dialogflow
- Analytics e monitoramento
- Testes e validação

Consulte a [documentação completa](docs/) no repositório.

## 🤝 Suporte

- **Email**: samuel@dnxtai.com
- **Issues**: [GitHub Issues](https://github.com/iceesurf/nxt-ai-production/issues)

## 📄 Licença

Copyright © 2025 NXT.AI. Todos os direitos reservados.
