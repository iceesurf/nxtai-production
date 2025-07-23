"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.dailyReport = exports.processCampaign = exports.processLead = exports.processAnalytics = exports.whatsapp = exports.dialogflow = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const dialogflow_1 = require("./webhooks/dialogflow");
const whatsapp_1 = require("./webhooks/whatsapp");
const processor_1 = require("./analytics/processor");
const leadProcessor_1 = require("./crm/leadProcessor");
const processor_2 = require("./campaigns/processor");
// Initialize Firebase Admin
admin.initializeApp();
// Webhook principal do Dialogflow
exports.dialogflow = functions
    .region('us-central1')
    .https
    .onRequest(dialogflow_1.dialogflowWebhook);
// Webhook do WhatsApp
exports.whatsapp = functions
    .region('us-central1')
    .https
    .onRequest(whatsapp_1.whatsappWebhook);
// Processador de analytics (Pub/Sub)
exports.processAnalytics = functions
    .region('us-central1')
    .pubsub
    .topic('dialogflow-analytics')
    .onPublish(processor_1.analyticsProcessor);
// Processador de leads
exports.processLead = functions
    .region('us-central1')
    .firestore
    .document('leads/{leadId}')
    .onCreate(leadProcessor_1.leadProcessor);
// Processador de campanhas
exports.processCampaign = functions
    .region('us-central1')
    .firestore
    .document('campaigns/{campaignId}')
    .onUpdate(processor_2.campaignProcessor);
// Job agendado para relatórios diários
exports.dailyReport = functions
    .region('us-central1')
    .pubsub
    .schedule('0 6 * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
    console.log('📊 Gerando relatório diário...');
    try {
        const db = admin.firestore();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Buscar métricas do dia anterior
        const conversationsSnapshot = await db
            .collection('conversations')
            .where('createdAt', '>=', yesterday)
            .where('createdAt', '<', today)
            .get();
        const leadsSnapshot = await db
            .collection('leads')
            .where('createdAt', '>=', yesterday)
            .where('createdAt', '<', today)
            .get();
        const metrics = {
            date: yesterday.toISOString().split('T')[0],
            conversations: conversationsSnapshot.size,
            leads: leadsSnapshot.size,
            channels: {}
        };
        // Calcular métricas por canal
        conversationsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            metrics.channels[data.channel] = (metrics.channels[data.channel] || 0) + 1;
        });
        // Salvar relatório
        await db.collection('reports').add({
            type: 'daily',
            metrics,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Relatório diário gerado:', metrics);
    }
    catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
    }
});
// Limpeza de dados antigos
exports.cleanup = functions
    .region('us-central1')
    .pubsub
    .schedule('0 2 * * 0') // Todo domingo às 2h
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
    console.log('🧹 Iniciando limpeza de dados...');
    try {
        const db = admin.firestore();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Limpar conversas antigas resolvidas
        const oldConversations = await db
            .collection('conversations')
            .where('status', '==', 'resolved')
            .where('updatedAt', '<', thirtyDaysAgo)
            .limit(500)
            .get();
        const batch = db.batch();
        let deleteCount = 0;
        oldConversations.docs.forEach(doc => {
            batch.delete(doc.ref);
            deleteCount++;
        });
        if (deleteCount > 0) {
            await batch.commit();
            console.log(`🗑️ ${deleteCount} conversas antigas removidas`);
        }
    }
    catch (error) {
        console.error('❌ Erro na limpeza:', error);
    }
});
//# sourceMappingURL=index.js.map