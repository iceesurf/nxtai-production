voce estava escrevendo e parou dentro mesmo projeto 

# 🚀 SISTEMA NXT.AI - IMPLEMENTAÇÃO COMPLETA

## 📁 ESTRUTURA DO PROJETO

```
nxt-ai-producao-2025/
├── packages/
│   ├── web/                    # Frontend React
│   ├── functions/              # Cloud Functions
│   ├── shared/                 # Código compartilhado
│   └── dialogflow/             # Configurações do bot
├── database/
│   ├── schemas/               # Schemas do banco
│   └── migrations/            # Migrações
├── scripts/
│   └── deploy/                # Scripts de deploy
└── config/
    └── stripe/                # Config pagamentos
```

## 🎨 1. CONFIGURAÇÃO VISUAL E CORES

### A. Tema Global da Aplicação

```typescript
// packages/shared/src/theme/colors.ts
export const nxtTheme = {
  colors: {
    // Cores principais do logo
    primary: {
      purple: '#8B5CF6',      // Roxo vibrante
      blue: '#3B82F6',        // Azul vibrante
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
    },
    // Cores de fundo
    background: {
      dark: '#0F0F23',        // Fundo escuro principal
      darker: '#09091B',      // Fundo mais escuro
      card: '#1A1A2E',        // Cards
      hover: '#252542',       // Hover state
    },
    // Cores de texto
    text: {
      primary: '#FFFFFF',     // Texto principal
      secondary: '#A0A0C0',   // Texto secundário
      muted: '#6B7280',       // Texto desabilitado
    },
    // Estados
    status: {
      success: '#10B981',     // Verde
      warning: '#F59E0B',     // Amarelo
      error: '#EF4444',       // Vermelho
      info: '#3B82F6',        // Azul
    },
    // Efeitos
    effects: {
      glow: '0 0 30px rgba(139, 92, 246, 0.5)',
      neon: '0 0 40px rgba(59, 130, 246, 0.8)',
    }
  }
};
```

## 💼 2. CRM COM KANBAN COMPLETO

### A. Schema do Banco de Dados

```sql
-- database/schemas/crm.sql

-- Tabela de Leads/Clientes
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new',
  stage INTEGER DEFAULT 1,
  assigned_to UUID REFERENCES users(id),
  score INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Tabela de Estágios do Pipeline
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#8B5CF6',
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Atividades
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'note'
  description TEXT,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
```

### B. Componente React do Kanban

```tsx
// packages/web/src/components/crm/KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Lead, PipelineStage } from '@nxtai/shared';

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Buscar dados
  const { data: stagesData } = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => api.get('/crm/stages'),
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.get('/crm/leads'),
  });

  // Mutation para atualizar lead
  const updateLeadMutation = useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: Partial<Lead> }) =>
      api.patch(`/crm/leads/${leadId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  // Drag and Drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const newStage = parseInt(destination.droppableId.split('-')[1]);
      updateLeadMutation.mutate({
        leadId: draggableId,
        data: { stage: newStage }
      });
    }
  };

  useEffect(() => {
    if (stagesData) setStages(stagesData.data);
    if (leadsData) setLeads(leadsData.data);
  }, [stagesData, leadsData]);

  return (
    <div className="bg-background-dark min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          Pipeline de Vendas
        </h1>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <Droppable key={stage.id} droppableId={`stage-${stage.order_index}`}>
              {(provided, snapshot) => (
                <motion.div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    bg-background-card rounded-xl p-4 min-w-[320px]
                    ${snapshot.isDraggingOver ? 'ring-2 ring-primary-purple' : ''}
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">{stage.name}</h3>
                    <span className="bg-background-darker text-text-secondary px-3 py-1 rounded-full text-sm">
                      {leads.filter(l => l.stage === stage.order_index).length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {leads
                      .filter(lead => lead.stage === stage.order_index)
                      .map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                bg-background-darker rounded-lg p-4 cursor-pointer
                                hover:shadow-lg hover:shadow-primary-purple/20
                                ${snapshot.isDragging ? 'shadow-xl shadow-primary-purple/40' : ''}
                              `}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <h4 className="text-white font-medium mb-1">{lead.name}</h4>
                              <p className="text-text-secondary text-sm mb-2">{lead.company}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted">{lead.email}</span>
                                <div className={`
                                  w-2 h-2 rounded-full
                                  ${lead.score > 70 ? 'bg-status-success' : 
                                    lead.score > 40 ? 'bg-status-warning' : 'bg-status-error'}
                                `} />
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </motion.div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
```

### C. API do CRM

```typescript
// packages/functions/src/api/crm.ts
import { Router } from 'express';
import { db } from '../services/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Listar leads
router.get('/leads', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    const leads = await db.query(
      `SELECT l.*, u.name as assigned_to_name 
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.tenant_id = $1
       ORDER BY l.created_at DESC`,
      [tenantId]
    );
    
    res.json({ success: true, data: leads.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar lead
router.post('/leads', authMiddleware, async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { name, email, phone, company, notes, tags } = req.body;
    
    const result = await db.query(
      `INSERT INTO leads (tenant_id, name, email, phone, company, notes, tags, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tenantId, name, email, phone, company, notes, tags, userId]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atualizar lead
router.patch('/leads/:id', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const updates = req.body;
    
    // Construir query dinamicamente
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');
    
    const result = await db.query(
      `UPDATE leads 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      [id, tenantId, ...values]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

## 🤖 3. CHATBOT WHATSAPP COM DIALOGFLOW

### A. Configuração do Dialogflow CX

```typescript
// packages/dialogflow/src/setup-agent.ts
import { AgentsClient, FlowsClient, IntentsClient } from '@google-cloud/dialogflow-cx';

const projectId = 'nxt-ai-prod';
const location = 'us-central1';

export async function setupDialogflowAgent(tenantId: string) {
  const agentsClient = new AgentsClient();
  const flowsClient = new FlowsClient();
  const intentsClient = new IntentsClient();

  // 1. Criar agente para o tenant
  const agent = await agentsClient.createAgent({
    parent: `projects/${projectId}/locations/${location}`,
    agent: {
      displayName: `Agent-${tenantId}`,
      defaultLanguageCode: 'pt-BR',
      timeZone: 'America/Sao_Paulo',
      description: `Agente do tenant ${tenantId}`,
      enableStackdriverLogging: true,
      enableSpellCorrection: true,
    },
  });

  // 2. Criar fluxo principal
  const mainFlow = await flowsClient.createFlow({
    parent: agent.name,
    flow: {
      displayName: 'Main Flow',
      description: 'Fluxo principal de atendimento',
      transitionRoutes: [
        {
          intent: 'Default Welcome Intent',
          triggerFulfillment: {
            messages: [
              {
                text: {
                  text: ['Olá! 👋 Bem-vindo ao atendimento automatizado. Como posso ajudar você hoje?']
                }
              }
            ]
          }
        }
      ]
    }
  });

  // 3. Criar intents básicos
  const intents = [
    {
      displayName: 'product.inquiry',
      trainingPhrases: [
        'quero saber sobre produtos',
        'quais produtos vocês têm',
        'me mostre os produtos',
        'catálogo de produtos',
        'o que vocês vendem'
      ]
    },
    {
      displayName: 'pricing.inquiry',
      trainingPhrases: [
        'quanto custa',
        'qual o preço',
        'valores',
        'tabela de preços',
        'quanto fica'
      ]
    },
    {
      displayName: 'support.request',
      trainingPhrases: [
        'preciso de ajuda',
        'estou com problema',
        'não está funcionando',
        'suporte técnico',
        'falar com atendente'
      ]
    }
  ];

  for (const intentData of intents) {
    await intentsClient.createIntent({
      parent: agent.name,
      intent: {
        displayName: intentData.displayName,
        trainingPhrases: intentData.trainingPhrases.map(phrase => ({
          parts: [{ text: phrase }],
          repeatCount: 1
        }))
      }
    });
  }

  return agent;
}
```

### B. Webhook do WhatsApp

```typescript
// packages/functions/src/webhooks/whatsapp.ts
import { Request, Response } from 'express';
import { SessionsClient } from '@google-cloud/dialogflow-cx';
import axios from 'axios';
import { db } from '../services/database';

const sessionsClient = new SessionsClient();

// Configurações
const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function whatsappWebhook(req: Request, res: Response) {
  // Verificação do webhook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado');
      res.status(200).send(challenge);
      return;
    }
    res.sendStatus(403);
    return;
  }

  // Processar mensagem recebida
  try {
    const { entry } = req.body;
    
    if (!entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      res.sendStatus(200);
      return;
    }
    
    const message = entry[0].changes[0].value.messages[0];
    const from = message.from;
    const messageText = message.text?.body;
    const phoneNumberId = entry[0].changes[0].value.metadata.phone_number_id;
    
    if (messageText) {
      // Buscar tenant pelo número do WhatsApp
      const tenantResult = await db.query(
        'SELECT * FROM tenants WHERE whatsapp_number = $1',
        [phoneNumberId]
      );
      
      if (!tenantResult.rows[0]) {
        await sendWhatsAppMessage(phoneNumberId, from, 
          '❌ Desculpe, este número não está configurado corretamente.');
        res.sendStatus(200);
        return;
      }
      
      const tenant = tenantResult.rows[0];
      const sessionId = `${tenant.id}-${from}`;
      
      // Buscar ou criar conversa
      let conversation = await db.query(
        'SELECT * FROM conversations WHERE tenant_id = $1 AND customer_phone = $2',
        [tenant.id, from]
      );
      
      if (!conversation.rows[0]) {
        const newConv = await db.query(
          `INSERT INTO conversations (tenant_id, customer_phone, channel, status)
           VALUES ($1, $2, 'whatsapp', 'active')
           RETURNING *`,
          [tenant.id, from]
        );
        conversation = { rows: [newConv.rows[0]] };
      }
      
      // Salvar mensagem recebida
      await db.query(
        `INSERT INTO messages (conversation_id, sender_type, content, metadata)
         VALUES ($1, 'customer', $2, $3)`,
        [conversation.rows[0].id, messageText, { phone: from }]
      );
      
      // Enviar para Dialogflow
      const sessionPath = sessionsClient.projectLocationAgentSessionPath(
        tenant.dialogflow_project_id,
        tenant.dialogflow_location,
        tenant.dialogflow_agent_id,
        sessionId
      );
      
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: messageText
          },
          languageCode: 'pt-BR'
        }
      };
      
      const [response] = await sessionsClient.detectIntent(request);
      
      // Processar resposta
      for (const message of response.queryResult.responseMessages) {
        if (message.text) {
          await sendWhatsAppMessage(phoneNumberId, from, message.text.text[0]);
          
          // Salvar resposta do bot
          await db.query(
            `INSERT INTO messages (conversation_id, sender_type, content)
             VALUES ($1, 'bot', $2)`,
            [conversation.rows[0].id, message.text.text[0]]
          );
        }
        
        // Processar rich content (botões, imagens, etc)
        if (message.payload?.whatsapp) {
          await sendWhatsAppRichContent(phoneNumberId, from, message.payload.whatsapp);
        }
      }
      
      // Verificar se precisa transferir para humano
      if (response.queryResult.match?.intent?.displayName === 'support.request') {
        await db.query(
          `UPDATE conversations 
           SET status = 'pending_human', needs_attention = true
           WHERE id = $1`,
          [conversation.rows[0].id]
        );
        
        // Notificar equipe
        await notifyTeam(tenant.id, conversation.rows[0].id, from, messageText);
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    res.sendStatus(500);
  }
}

// Enviar mensagem simples
async function sendWhatsAppMessage(phoneNumberId: string, to: string, text: string) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response?.data || error);
    throw error;
  }
}

// Enviar conteúdo rico (botões, listas, etc)
async function sendWhatsAppRichContent(phoneNumberId: string, to: string, content: any) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        ...content
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar rich content:', error.response?.data || error);
    throw error;
  }
}

// Notificar equipe sobre transferência
async function notifyTeam(tenantId: string, conversationId: string, customerPhone: string, lastMessage: string) {
  // Implementar notificação via email, Slack, etc
  console.log(`Nova conversa precisa de atendimento humano:
    Tenant: ${tenantId}
    Conversa: ${conversationId}
    Cliente: ${customerPhone}
    Última mensagem: ${lastMessage}
  `);
}
```

## 🏢 4. SISTEMA MULTI-EMPRESA

### A. Schema Multi-Tenant

```sql
-- database/schemas/multi-tenant.sql

-- Tabela principal de tenants (empresas)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  theme_config JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  plan_id UUID REFERENCES plans(id),
  subscription_status VARCHAR(50) DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  whatsapp_number VARCHAR(20),
  dialogflow_project_id VARCHAR(100),
  dialogflow_location VARCHAR(50) DEFAULT 'us-central1',
  dialogflow_agent_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);

-- Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir planos padrão
INSERT INTO plans (name, slug, price_monthly, price_yearly, features, limits) VALUES
('Starter', 'starter', 97.00, 970.00, 
 '{"crm": true, "chatbot": true, "campaigns": false, "whitelabel": false}',
 '{"users": 3, "leads": 1000, "conversations": 500}'),
('Professional', 'professional', 297.00, 2970.00,
 '{"crm": true, "chatbot": true, "campaigns": true, "whitelabel": true}',
 '{"users": 10, "leads": 10000, "conversations": 5000}'),
('Enterprise', 'enterprise', 997.00, 9970.00,
 '{"crm": true, "chatbot": true, "campaigns": true, "whitelabel": true, "api": true}',
 '{"users": -1, "leads": -1, "conversations": -1}');

-- Tabela de uso/consumo
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  metric_type VARCHAR(50) NOT NULL, -- 'conversations', 'leads', 'users'
  count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, metric_type, period_start)
);
```

### B. Middleware de Multi-Tenancy

```typescript
// packages/functions/src/middleware/multiTenant.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';

export interface TenantRequest extends Request {
  tenant?: any;
  user?: any;
}

export async function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    // Extrair tenant de diferentes fontes
    let tenantIdentifier = null;
    
    // 1. Subdomain (ex: empresa.nxt.ai)
    const subdomain = req.hostname.split('.')[0];
    if (subdomain && subdomain !== 'app' && subdomain !== 'www') {
      tenantIdentifier = subdomain;
    }
    
    // 2. Header customizado
    if (req.headers['x-tenant-id']) {
      tenantIdentifier = req.headers['x-tenant-id'];
    }
    
    // 3. Query parameter
    if (req.query.tenant) {
      tenantIdentifier = req.query.tenant;
    }
    
    if (!tenantIdentifier) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant não identificado' 
      });
    }
    
    // Buscar tenant
    const result = await db.query(
      'SELECT * FROM tenants WHERE slug = $1 OR id = $1',
      [tenantIdentifier]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tenant não encontrado' 
      });
    }
    
    // Verificar se está ativo
    const tenant = result.rows[0];
    if (tenant.subscription_status === 'cancelled' || 
        tenant.subscription_status === 'expired') {
      return res.status(403).json({ 
        success: false, 
        error: 'Assinatura inativa' 
      });
    }
    
    // Adicionar tenant ao request
    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar tenant' 
    });
  }
}

// Middleware para verificar limites do plano
export async function planLimitsMiddleware(
  metricType: string
) {
  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    try {
      const { tenant } = req;
      
      // Buscar plano do tenant
      const planResult = await db.query(
        'SELECT * FROM plans WHERE id = $1',
        [tenant.plan_id]
      );
      
      const plan = planResult.rows[0];
      const limit = plan.limits[metricType];
      
      // -1 significa ilimitado
      if (limit === -1) {
        return next();
      }
      
      // Verificar uso atual
      const currentMonth = new Date();
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const usageResult = await db.query(
        `SELECT count FROM usage_tracking 
         WHERE tenant_id = $1 AND metric_type = $2 
         AND period_start = $3`,
        [tenant.id, metricType, startDate]
      );
      
      const currentUsage = usageResult.rows[0]?.count || 0;
      
      if (currentUsage >= limit) {
        return res.status(429).json({ 
          success: false, 
          error: `Limite de ${metricType} atingido (${limit})`,
          upgrade_url: `/billing/upgrade`
        });
      }
      
      // Incrementar uso
      await db.query(
        `INSERT INTO usage_tracking (tenant_id, metric_type, count, period_start, period_end)
         VALUES ($1, $2, 1, $3, $4)
         ON CONFLICT (tenant_id, metric_type, period_start)
         DO UPDATE SET count = usage_tracking.count + 1`,
        [tenant.id, metricType, startDate, endDate]
      );
      
      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao verificar limites' 
      });
    }
  };
}
```

## 🎨 5. EDITOR VISUAL DO CLIENTE

### A. Interface do Editor

```tsx
// packages/web/src/components/editor/VisualEditor.tsx
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { Upload, Download, Eye, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  chatPosition: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  offlineMessage: string;
}

export function VisualEditor() {
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    logoUrl: '',
    chatPosition: 'bottom-right',
    welcomeMessage: 'Olá! Como posso ajudar?',
    offlineMessage: 'No momento estamos offline. Deixe sua mensagem!'
  });
  
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  // Mutation para salvar tema
  const saveThemeMutation = useMutation({
    mutationFn: (themeData: ThemeConfig) => 
      api.put('/tenant/theme', themeData),
    onSuccess: () => {
      alert('Tema salvo com sucesso!');
    }
  });

  // Upload de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await api.post('/tenant/upload-logo', formData);
      setTheme({ ...theme, logoUrl: response.data.url });
    } catch (error) {
      alert('Erro ao fazer upload do logo');
    }
  };

  return (
    <div className="min-h-screen bg-background-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            Editor Visual
          </h1>
          <p className="text-text-secondary mt-2">
            Personalize a aparência do seu chatbot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Edição */}
          <motion.div 
            className="bg-background-card rounded-xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Configurações</h2>

            {/* Upload de Logo */}
            <div className="mb-6">
              <label className="block text-text-secondary mb-2">Logo da Empresa</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-background-darker rounded-lg flex items-center justify-center overflow-hidden">
                  {theme.logoUrl ? (
                    <img src={theme.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-text-muted" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="px-4 py-2 bg-primary-purple text-white rounded-lg cursor-pointer hover:opacity-90"
                >
                  Escolher Logo
                </label>
              </div>
            </div>

            {/* Cores */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-text-secondary mb-2">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-background-hover"
                    style={{ backgroundColor: theme.primaryColor }}
                    onClick={() => setShowColorPicker('primary')}
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-background-darker text-white rounded-lg"
                  />
                </div>
                {showColorPicker === 'primary' && (
                  <div className="absolute z-10 mt-2">
                    <SketchPicker
                      color={theme.primaryColor}
                      onChange={(color) => setTheme({ ...theme, primaryColor: color.hex })}
                    />
                    <button
                      onClick={() => setShowColorPicker(null)}
                      className="mt-2 px-4 py-1 bg-background-card text-white rounded"
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-text-secondary mb-2">Cor Secundária</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-background-hover"
                    style={{ backgroundColor: theme.secondaryColor }}
                    onClick={() => setShowColorPicker('secondary')}
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-background-darker text-white rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-text-secondary mb-2">Mensagem de Boas-vindas</label>
                <textarea
                  value={theme.welcomeMessage}
                  onChange={(e) => setTheme({ ...theme, welcomeMessage: e.target.value })}
                  className="w-full px-4 py-2 bg-background-darker text-white rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-2">Mensagem Offline</label>
                <textarea
                  value={theme.offlineMessage}
                  onChange={(e) => setTheme({ ...theme, offlineMessage: e.target.value })}
                  className="w-full px-4 py-2 bg-background-darker text-white rounded-lg resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Posição do Chat */}
            <div className="mb-6">
              <label className="block text-text-secondary mb-2">Posição do Chat</label>
              <select
                value={theme.chatPosition}
                onChange={(e) => setTheme({ ...theme, chatPosition: e.target.value as any })}
                className="w-full px-4 py-2 bg-background-darker text-white rounded-lg"
              >
                <option value="bottom-right">Canto Inferior Direito</option>
                <option value="bottom-left">Canto Inferior Esquerdo</option>
              </select>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <button
                onClick={() => saveThemeMutation.mutate(theme)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Salvar Alterações
              </button>
              <button
                onClick={() => setPreview(!preview)}
                className="px-4 py-2 bg-background-darker text-white rounded-lg hover:bg-background-hover flex items-center gap-2"
              >
                <Eye size={20} />
                Preview
              </button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            className="bg-background-card rounded-xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Preview</h2>
            <div className="bg-gray-100 rounded-lg h-[600px] relative overflow-hidden">
              {/* Simular site */}
              <div className="p-4">
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>

              {/* Chat Widget Preview */}
              <div
                className={`absolute ${
                  theme.chatPosition === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'
                }`}
              >
                {preview ? (
                  <div className="bg-white rounded-lg shadow-2xl w-80 overflow-hidden">
                    <div
                      className="p-4 text-white"
                      style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                    >
                      <div className="flex items-center gap-3">
                        {theme.logoUrl && (
                          <img src={theme.logoUrl} alt="Logo" className="w-10 h-10 rounded-full bg-white p-1" />
                        )}
                        <div>
                          <h3 className="font-semibold">Atendimento Online</h3>
                          <p className="text-sm opacity-90">Resposta em segundos</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 h-64 bg-gray-50">
                      <div className="bg-white rounded-lg p-3 mb-3 shadow">
                        <p className="text-gray-800">{theme.welcomeMessage}</p>
                      </div>
                    </div>
                    <div className="p-4 border-t">
                      <input
                        type="text"
                        placeholder="Digite sua mensagem..."
                        className="w-full px-4 py-2 border rounded-full text-sm"
                        disabled
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

### B. Editor de Fluxos do Bot

```tsx
// packages/web/src/components/editor/FlowEditor.tsx
import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, Upload } from 'lucide-react';

// Componente de nó customizado
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-background-card border-2 border-primary-purple rounded-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="text-white font-medium mb-2">{data.label}</div>
      <div className="text-text-secondary text-sm">{data.description}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 50 },
      data: { 
        label: 'Início', 
        description: 'Mensagem de boas-vindas'
      },
    },
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(2);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ label: '', description: '' });

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNewNode = () => {
    const newNode: Node = {
      id: nodeIdCounter.toString(),
      type: 'custom',
      position: { x: 250, y: nodes.length * 150 },
      data: { 
        label: newNodeData.label || `Nó ${nodeIdCounter}`,
        description: newNodeData.description || 'Descrição do nó'
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
    setNodeIdCounter(nodeIdCounter + 1);
    setShowNodeModal(false);
    setNewNodeData({ label: '', description: '' });
  };

  const saveFlow = async () => {
    const flow = {
      nodes,
      edges,
      metadata: {
        version: '1.0',
        updatedAt: new Date().toISOString()
      }
    };
    
    try {
      const response = await fetch('/api/dialogflow/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flow)
      });
      
      if (response.ok) {
        alert('Fluxo salvo com sucesso!');
      }
    } catch (error) {
      alert('Erro ao salvar fluxo');
    }
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="p-4 border-b border-background-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Editor de Fluxos do Bot</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNodeModal(true)}
              className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <Plus size={20} />
              Adicionar Nó
            </button>
            <button
              onClick={saveFlow}
              className="px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <Save size={20} />
              Salvar Fluxo
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 'calc(100vh - 80px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#444" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={() => '#8B5CF6'}
            style={{
              backgroundColor: '#1A1A2E',
            }}
          />
        </ReactFlow>
      </div>

      {/* Modal para adicionar nó */}
      {showNodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-card rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-white mb-4">Adicionar Novo Nó</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-2">Nome do Nó</label>
                <input
                  type="text"
                  value={newNodeData.label}
                  onChange={(e) => setNewNodeData({ ...newNodeData, label: e.target.value })}
                  className="w-full px-4 py-2 bg-background-darker text-white rounded-lg"
                  placeholder="Ex: Perguntar Nome"
                />
              </div>
              <div>
                <label className="block text-text-secondary mb-2">Descrição</label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background-darker text-white rounded-lg resize-none"
                  rows={3}
                  placeholder="Ex: Solicita o nome do cliente"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addNewNode}
                  className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:opacity-90"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowNodeModal(false)}
                  className="flex-1 px-4 py-2 bg-background-darker text-white rounded-lg hover:bg-background-hover"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 💳 6. SISTEMA DE PAGAMENTOS COM STRIPE

### A. Integração Stripe Backend

```typescript
// packages/functions/src/services/stripe.ts
import Stripe from 'stripe';
import { db } from './database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  // Criar cliente no Stripe
  async createCustomer(tenant: any) {
    const customer = await stripe.customers.create({
      email: tenant.email,
      name: tenant.name,
      metadata: {
        tenant_id: tenant.id
      }
    });

    // Salvar ID do cliente
    await db.query(
      'UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2',
      [customer.id, tenant.id]
    );

    return customer;
  }

  // Criar sessão de checkout
  async createCheckoutSession(tenantId: string, planSlug: string) {
    // Buscar tenant
    const tenantResult = await db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenantId]
    );
    const tenant = tenantResult.rows[0];

    // Buscar plano
    const planResult = await db.query(
      'SELECT * FROM plans WHERE slug = $1',
      [planSlug]
    );
    const plan = planResult.rows[0];

    // Criar cliente se não existir
    if (!tenant.stripe_customer_id) {
      await this.createCustomer(tenant);
    }

    // Criar preços no Stripe (uma vez apenas)
    const price = await this.getOrCreatePrice(plan);

    // Criar sessão
    const session = await stripe.checkout.sessions.create({
      customer: tenant.stripe_customer_id,
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
      metadata: {
        tenant_id: tenantId,
        plan_slug: planSlug
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          tenant_id: tenantId,
          plan_slug: planSlug
        }
      }
    });

    return session;
  }

  // Criar ou buscar preço no Stripe
  async getOrCreatePrice(plan: any) {
    // Verificar se já existe
    const prices = await stripe.prices.list({
      product: plan.stripe_product_id,
      active: true,
    });

    if (prices.data.length > 0) {
      return prices.data[0];
    }

    // Criar produto se não existir
    let productId = plan.stripe_product_id;
    if (!productId) {
      const product = await stripe.products.create({
        name: plan.name,
        metadata: {
          plan_slug: plan.slug
        }
      });
      productId = product.id;

      await db.query(
        'UPDATE plans SET stripe_product_id = $1 WHERE id = $2',
        [productId, plan.id]
      );
    }

    // Criar preço
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: plan.price_monthly * 100, // Em centavos
      currency: 'brl',
      recurring: {
        interval: 'month'
      }
    });

    return price;
  }

  // Webhook do Stripe
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  // Processar checkout completo
  async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const tenantId = session.metadata?.tenant_id;
    const planSlug = session.metadata?.plan_slug;

    if (!tenantId || !planSlug) return;

    // Buscar plano
    const planResult = await db.query(
      'SELECT * FROM plans WHERE slug = $1',
      [planSlug]
    );
    const plan = planResult.rows[0];

    // Atualizar tenant
    await db.query(
      `UPDATE tenants 
       SET plan_id = $1, 
           subscription_status = 'active',
           stripe_subscription_id = $2,
           trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '7 days'
       WHERE id = $3`,
      [plan.id, session.subscription, tenantId]
    );

    // Enviar email de boas-vindas
    // await emailService.sendWelcomeEmail(tenantId);
  }

  // Atualizar assinatura
  async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const tenantId = subscription.metadata.tenant_id;
    
    await db.query(
      `UPDATE tenants 
       SET subscription_status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $2`,
      [subscription.status, subscription.id]
    );
  }

  // Cancelar assinatura
  async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    await db.query(
      `UPDATE tenants 
       SET subscription_status = 'cancelled',
           plan_id = (SELECT id FROM plans WHERE slug = 'free'),
           updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );
  }

  // Portal do cliente
  async createCustomerPortal(tenantId: string) {
    const tenantResult = await db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenantId]
    );
    const tenant = tenantResult.rows[0];

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${process.env.APP_URL}/billing`,
    });

    return session;
  }
}

export const stripeService = new StripeService();
```

### B. Página de Billing

```tsx
// packages/web/src/pages/Billing.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, Check, X, Loader } from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
}

export function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Buscar planos
  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get('/billing/plans'),
  });

  // Buscar assinatura atual
  const { data: currentSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get('/billing/subscription'),
  });

  // Mutation para criar checkout
  const createCheckoutMutation = useMutation({
    mutationFn: (planSlug: string) => 
      api.post('/billing/create-checkout', { planSlug, billingPeriod }),
    onSuccess: (data) => {
      // Redirecionar para Stripe Checkout
      window.location.href = data.data.url;
    }
  });

  // Mutation para gerenciar assinatura
  const manageSubscriptionMutation = useMutation({
    mutationFn: () => api.post('/billing/customer-portal'),
    onSuccess: (data) => {
      window.location.href = data.data.url;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-text-secondary text-lg">
            Comece com 7 dias grátis. Cancele quando quiser.
          </p>
        </div>

        {/* Toggle de período */}
        <div className="flex justify-center mb-12">
          <div className="bg-background-card rounded-full p-1 flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-primary-purple to-primary-blue text-white'
                  : 'text-text-secondary'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-primary-purple to-primary-blue text-white'
                  : 'text-text-secondary'
              }`}
            >
              Anual
              <span className="ml-2 text-sm opacity-75">Economize 20%</span>
            </button>
          </div>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans?.data.map((plan: Plan) => (
            <motion.div
              key={plan.id}
              className={`
                bg-background-card rounded-2xl p-8 relative
                ${currentSubscription?.data.plan_id === plan.id ? 'ring-2 ring-primary-purple' : ''}
                ${plan.slug === 'professional' ? 'transform scale-105' : ''}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
            >
              {plan.slug === 'professional' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-1 rounded-full text-sm">
                    Mais Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {formatPrice(
                    billingPeriod === 'monthly' 
                      ? plan.price_monthly 
                      : plan.price_yearly / 12
                  )}
                </span>
                <span className="text-text-secondary">/mês</span>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-status-success mt-1">
                    Total: {formatPrice(plan.price_yearly)}/ano
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-text-secondary">
                  <Check className="text-status-success mr-2" size={20} />
                  {plan.limits.users === -1 ? 'Usuários ilimitados' : `${plan.limits.users} usuários`}
                </li>
                <li className="flex items-center text-text-secondary">
                  <Check className="text-status-success mr-2" size={20} />
                  {plan.limits.leads === -1 ? 'Leads ilimitados' : `${plan.limits.leads} leads/mês`}
                </li>
                <li className="flex items-center text-text-secondary">
                  <Check className="text-status-success mr-2" size={20} />
                  {plan.limits.conversations === -1 ? 'Conversas ilimitadas' : `${plan.limits.conversations} conversas/mês`}
                </li>
                {plan.features.campaigns && (
                  <li className="flex items-center text-text-secondary">
                    <Check className="text-status-success mr-2" size={20} />
                    Campanhas de Email/WhatsApp
                  </li>
                )}
                {plan.features.whitelabel && (
                  <li className="flex items-center text-text-secondary">
                    <Check className="text-status-success mr-2" size={20} />
                    White Label Completo
                  </li>
                )}
                {plan.features.api && (
                  <li className="flex items-center text-text-secondary">
                    <Check className="text-status-success mr-2" size={20} />
                    Acesso à API
                  </li>
                )}
              </ul>

              {/* Botão */}
              {currentSubscription?.data.plan_id === plan.id ? (
                <button
                  onClick={() => manageSubscriptionMutation.mutate()}
                  className="w-full py-3 bg-background-darker text-white rounded-lg hover:bg-background-hover"
                >
                  Gerenciar Assinatura
                </button>
              ) : (
                <button
                  onClick={() => createCheckoutMutation.mutate(plan.slug)}
                  disabled={createCheckoutMutation.isLoading}
                  className={`
                    w-full py-3 rounded-lg font-medium transition-all
                    ${plan.slug === 'professional'
                      ? 'bg-gradient-to-r from-primary-purple to-primary-blue text-white hover:opacity-90'
                      : 'bg-background-darker text-white hover:bg-background-hover'
                    }
                  `}
                >
                  {createCheckoutMutation.isLoading ? (
                    <Loader className="animate-spin mx-auto" size={20} />
                  ) : (
                    'Começar Agora'
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Garantias */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 text-text-secondary">
            <div className="flex items-center gap-2">
              <CreditCard size={24} />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>Cancele a qualquer momento</span>
            </div>
            <div className="flex items-center gap-2">
              <X size={24} />
              <span>Sem taxas ocultas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 📊 7. GRÁFICOS E ANALYTICS

### A. Dashboard com Gráficos

```tsx
// packages/web/src/components/dashboard/Analytics.tsx
import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TrendingUp, Users, MessageSquare, DollarSign } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

export function AnalyticsDashboard() {
  // Buscar dados de analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics/dashboard'),
  });

  const stats = analyticsData?.data || {
    totalLeads: 0,
    totalConversations: 0,
    conversionRate: 0,
    revenue: 0,
    conversationsOverTime: [],
    leadsBySource: [],
    conversionFunnel: [],
    topIntents: []
  };

  return (
    <div className="min-h-screen bg-background-dark p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Analytics Dashboard
        </h1>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-primary-purple" size={24} />
              <span className="text-status-success text-sm">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalLeads}</h3>
            <p className="text-text-secondary">Total de Leads</p>
          </div>

          <div className="bg-background-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="text-primary-blue" size={24} />
              <span className="text-status-success text-sm">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalConversations}</h3>
            <p className="text-text-secondary">Conversas</p>
          </div>

          <div className="bg-background-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-status-success" size={24} />
              <span className="text-status-warning text-sm">-2%</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.conversionRate}%</h3>
            <p className="text-text-secondary">Taxa de Conversão</p>
          </div>

          <div className="bg-background-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-status-warning" size={24} />
              <span className="text-status-success text-sm">+25%</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.revenue)}
            </h3>
            <p className="text-text-secondary">Receita</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversas ao longo do tempo */}
          <div className="bg-background-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Conversas por Dia
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.conversationsOverTime}>
                <defs>
                  <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1A2E', 
                    border: '1px solid #444',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8B5CF6" 
                  fillOpacity={1} 
                  fill="url(#colorConversations)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Leads por fonte */}
          <div className="bg-background-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Origem dos Leads
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.leadsBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.leadsBySource.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1A2E', 
                    border: '1px solid #444',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Funil de conversão */}
          <div className="bg-background-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Funil de Conversão
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.conversionFunnel} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="stage" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1A2E', 
                    border: '1px solid #444',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top intents */}
          <div className="bg-background-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Intenções Mais Comuns
            </h3>
            <div className="space-y-3">
              {stats.topIntents.map((intent: any, index: number) => (
                <div key={intent.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-text-secondary">{intent.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-background-darker rounded-full h-2">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${intent.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <span className="text-white font-medium">{intent.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🚀 8. SCRIPTS DE DEPLOY COMPLETO

### A. Script de Deploy Principal

```bash
#!/bin/bash
# deploy-nxtai-complete.sh

set -e

# Configurações
PROJECT_ID="nxt-ai-prod"
REGION="us-central1"

echo "🚀 Iniciando deploy completo do NXT.AI..."

# 1. Build do frontend
echo "📦 Building frontend..."
cd packages/web
npm run build
cd ../..

# 2. Deploy do frontend no Firebase Hosting
echo "🌐 Deploying frontend..."
firebase deploy --only hosting --project $PROJECT_ID

# 3. Build das Cloud Functions
echo "☁️ Building Cloud Functions..."
cd packages/functions
npm run build
cd ../..

# 4. Deploy das Cloud Functions
echo "🚀 Deploying Cloud Functions..."
firebase deploy --only functions --project $PROJECT_ID

# 5. Aplicar regras de segurança
echo "🔒 Applying security rules..."
firebase deploy --only firestore:rules,storage:rules --project $PROJECT_ID

# 6. Configurar Dialogflow
echo "🤖 Configurando Dialogflow..."
cd packages/dialogflow
node setup-agent.js
cd ../..

# 7. Executar migrações do banco
echo "💾 Running database migrations..."
node scripts/migrate.js

# 8. Configurar webhooks
echo "🔗 Configurando webhooks..."
curl -X POST https://api.whatsapp.com/webhooks \
  -H "Authorization: Bearer $WHATSAPP_TOKEN" \
  -d "{\"url\": \"https://$REGION-$PROJECT_ID.cloudfunctions.net/whatsappWebhook\"}"

# 9. Verificar deploy
echo "✅ Verificando deploy..."
curl https://app.nxt.ai/api/health

echo "🎉 Deploy completo! Sistema disponível em https://app.nxt.ai"
```

### B. Docker Compose para Desenvolvimento

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: nxtai
      POSTGRES_USER: nxtai
      POSTGRES_PASSWORD: nxtai123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  firebase-emulator:
    image: node:18
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "4000:4000" # Emulator UI
      - "5001:5001" # Functions
      - "8080:8080" # Firestore
      - "5000:5000" # Hosting
    command: npm run emulators

volumes:
  postgres_data:
```

## 📝 PÁGINA COMING SOON

```html
<!-- packages/web/public/coming-soon.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NXT.AI - Em Breve</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0F0F23;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .container {
      text-align: center;
      z-index: 10;
      padding: 2rem;
    }

    .logo {
      font-size: 4rem;
      font-weight: bold;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 2rem;
      animation: glow 2s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)); }
      50% { filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.8)); }
    }

    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #fff, #a0a0c0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      font-size: 1.2rem;
      color: #a0a0c0;
      margin-bottom: 3rem;
      max-width: 600px;
    }

    .countdown {
      display: flex;
      gap: 2rem;
      justify-content: center;
      margin-bottom: 3rem;
    }

    .countdown-item {
      text-align: center;
    }

    .countdown-value {
      background: linear-gradient(135deg, #1A1A2E, #252542);
      border: 2px solid #8B5CF6;
      border-radius: 12px;
      padding: 1.5rem;
      font-size: 2.5rem;
      font-weight: bold;
      min-width: 80px;
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
    }

    .countdown-label {
      color: #a0a0c0;
      margin-top: 0.5rem;
      text-transform: uppercase;
      font-size: 0.8rem;
    }

    .notify-form {
      display: flex;
      gap: 1rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .notify-input {
      flex: 1;
      padding: 1rem 1.5rem;
      background: #1A1A2E;
      border: 2px solid #252542;
      border-radius: 50px;
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .notify-input:focus {
      outline: none;
      border-color: #8B5CF6;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }

    .notify-button {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      border: none;
      border-radius: 50px;
      color: #fff;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }

    .notify-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.5);
    }

    .features {
      margin-top: 5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      max-width: 800px;
    }

    .feature {
      background: linear-gradient(135deg, #1A1A2E, #252542);
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid #252542;
      transition: all 0.3s;
    }

    .feature:hover {
      transform: translateY(-5px);
      border-color: #8B5CF6;
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    }

    .feature-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .particles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      border-radius: 50%;
      animation: float 10s infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) translateX(100px);
      }
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>

  <div class="container">
    <div class="logo">nxt.ai</div>
    
    <h1>Revolucionando a IA Conversacional</h1>
    <p>
      A plataforma definitiva para automação inteligente, CRM avançado e 
      atendimento 24/7 com Inteligência Artificial de última geração.
    </p>

    <div class="countdown">
      <div class="countdown-item">
        <div class="countdown-value" id="days">00</div>
        <div class="countdown-label">Dias</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-value" id="hours">00</div>
        <div class="countdown-label">Horas</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-value" id="minutes">00</div>
        <div class="countdown-label">Minutos</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-value" id="seconds">00</div>
        <div class="countdown-label">Segundos</div>
      </div>
    </div>

    <form class="notify-form" id="notifyForm">
      <input 
        type="email" 
        placeholder="Seu melhor email" 
        class="notify-input"
        required
      />
      <button type="submit" class="notify-button">
        Me Avise!
      </button>
    </form>

    <div class="features">
      <div class="feature">
        <div class="feature-icon">🤖</div>
        <h3>IA Avançada</h3>
        <p>Chatbot com processamento de linguagem natural</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📊</div>
        <h3>CRM Inteligente</h3>
        <p>Gestão completa de leads e vendas</p>
      </div>
      <div class="feature">
        <div class="feature-icon">💬</div>
        <h3>Omnichannel</h3>
        <p>WhatsApp, Web, Email em um só lugar</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎨</div>
        <h3>White Label</h3>
        <p>Personalize com sua marca</p>
      </div>
    </div>
  </div>

  <script>
    // Countdown
    const launchDate = new Date('2024-02-01T00:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = String(days).padStart(2, '0');
      document.getElementById('hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    };
    
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Particles
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 10 + 's';
      particle.style.animationDuration = (10 + Math.random() * 10) + 's';
      particlesContainer.appendChild(particle);
    }

    // Form submission
    document.getElementById('notifyForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target[0].value;
      
      try {
        const response = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (response.ok) {
          alert('Obrigado! Você será o primeiro a saber quando lançarmos!');
          e.target.reset();
        }
      } catch (error) {
        alert('Ops! Algo deu errado. Tente novamente.');
      }
    });
  </script>
</body>
</html>
```

## ✅ RESUMO DO SISTEMA COMPLETO

### Funcionalidades Implementadas:

1. ✅ **CRM com Kanban** - Drag & drop, 5 fases, visual moderno
1. ✅ **Chatbot WhatsApp** - Integrado com Dialogflow CX
1. ✅ **Sistema Multi-empresa** - Isolamento completo, planos
1. ✅ **Editor Visual** - Cores, logo, mensagens, fluxos
1. ✅ **Suporte 24h** - Dialogflow sempre ativo
1. ✅ **Upload de Arquivos** - Integrado com Storage
1. ✅ **Gráficos e Analytics** - Dashboard completo
1. ✅ **Pag