import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { dialogflowWebhook } from './webhooks/dialogflow';
import { whatsappWebhook } from './webhooks/whatsapp';
import { analyticsProcessor } from './analytics/processor';
import { leadProcessor } from './crm/leadProcessor';
import { campaignProcessor } from './campaigns/processor';

// Initialize Firebase Admin
admin.initializeApp();

// Webhook principal do Dialogflow
export const dialogflow = functions
  .region('us-central1')
  .https
  .onRequest(dialogflowWebhook);

// Webhook do WhatsApp
export const whatsapp = functions
  .region('us-central1')
  .https
  .onRequest(whatsappWebhook);

// Processador de analytics (Pub/Sub)
export const processAnalytics = functions
  .region('us-central1')
  .pubsub
  .topic('dialogflow-analytics')
  .onPublish(analyticsProcessor);

// Processador de leads
export const processLead = functions
  .region('us-central1')
  .firestore
  .document('leads/{leadId}')
  .onCreate(leadProcessor);

// Processador de campanhas
export const processCampaign = functions
  .region('us-central1')
  .firestore
  .document('campaigns/{campaignId}')
  .onUpdate(campaignProcessor);

// Job agendado para relatórios diários
export const dailyReport = functions
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
        channels: {} as { [key: string]: number }
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
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
    }
  });

// Limpeza de dados antigos
export const cleanup = functions
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
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  });