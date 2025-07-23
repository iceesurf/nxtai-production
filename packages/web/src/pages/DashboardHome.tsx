import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuthStore } from '../store/authStore';

// Mock data - replace with real API calls
const mockStats = {
  totalAgents: 12,
  activeAgents: 8,
  totalConversations: 1247,
  activeConversations: 23,
  totalMessages: 8945,
  avgResponseTime: 2.3,
  satisfactionRate: 94.2,
  resolutionRate: 87.5
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'agent_created',
    title: 'Novo agente criado',
    description: 'Agente "Suporte Vendas" foi criado',
    time: '2 min atrás',
    icon: CpuChipIcon,
    color: 'text-green-500'
  },
  {
    id: '2',
    type: 'conversation_started',
    title: 'Conversa iniciada',
    description: 'Cliente Maria Silva iniciou conversa',
    time: '5 min atrás',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-blue-500'
  },
  {
    id: '3',
    type: 'agent_trained',
    title: 'Agente treinado',
    description: 'Agente "Atendimento" foi retreinado',
    time: '15 min atrás',
    icon: CheckCircleIcon,
    color: 'text-purple-500'
  },
  {
    id: '4',
    type: 'alert',
    title: 'Alta demanda detectada',
    description: 'Pico de conversas no canal WhatsApp',
    time: '1h atrás',
    icon: ExclamationTriangleIcon,
    color: 'text-orange-500'
  }
];

const mockConversationData = [
  { name: 'Seg', conversas: 45, resolvidas: 38 },
  { name: 'Ter', conversas: 52, resolvidas: 44 },
  { name: 'Qua', conversas: 48, resolvidas: 41 },
  { name: 'Qui', conversas: 61, resolvidas: 53 },
  { name: 'Sex', conversas: 55, resolvidas: 48 },
  { name: 'Sab', conversas: 32, resolvidas: 29 },
  { name: 'Dom', conversas: 28, resolvidas: 25 }
];

const mockChannelData = [
  { name: 'WhatsApp', value: 45, color: '#25D366' },
  { name: 'Telegram', value: 30, color: '#0088CC' },
  { name: 'Website', value: 15, color: '#3B82F6' },
  { name: 'Instagram', value: 10, color: '#E4405F' }
];

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('7d');

  // Mock query - replace with real API
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStats;
    }
  });

  const stats = [
    {
      title: 'Agentes Ativos',
      value: mockStats.activeAgents,
      total: mockStats.totalAgents,
      change: +12,
      icon: CpuChipIcon,
      color: 'bg-blue-600',
      href: '/dashboard/agents'
    },
    {
      title: 'Conversas Ativas',
      value: mockStats.activeConversations,
      total: mockStats.totalConversations,
      change: +8,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-green-600',
      href: '/dashboard/messages'
    },
    {
      title: 'Taxa de Satisfação',
      value: `${mockStats.satisfactionRate}%`,
      change: +2.1,
      icon: ChartBarIcon,
      color: 'bg-purple-600',
      href: '/dashboard/analytics'
    },
    {
      title: 'Tempo Médio',
      value: `${mockStats.avgResponseTime}s`,
      change: -0.5,
      icon: ClockIcon,
      color: 'bg-orange-600',
      href: '/dashboard/analytics'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bem-vindo, {user?.displayName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Aqui está o resumo da sua plataforma hoje
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          
          <button
            onClick={() => navigate('/dashboard/agents')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Agente
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.href)}
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center text-sm ${
                stat.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <h3 className="text-gray-400 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            {stat.total && (
              <p className="text-xs text-gray-500 mt-1">de {stat.total} total</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Conversas da Semana</h3>
            <button 
              onClick={() => navigate('/dashboard/analytics')}
              className="text-blue-500 hover:text-blue-400 text-sm flex items-center"
            >
              Ver detalhes
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockConversationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Area
                type="monotone"
                dataKey="conversas"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="resolvidas"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Distribution */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Canais de Atendimento</h3>
            <button 
              onClick={() => navigate('/dashboard/analytics')}
              className="text-blue-500 hover:text-blue-400 text-sm flex items-center"
            >
              Ver todos
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockChannelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockChannelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
            <button className="text-blue-500 hover:text-blue-400 text-sm">
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-750 rounded-lg transition">
                <div className={`p-2 bg-gray-700 rounded-lg ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-gray-400 text-sm">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Ações Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/agents')}
              className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <div className="flex items-center">
                <CpuChipIcon className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-white">Criar Agente</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => navigate('/dashboard/dialogflow')}
              className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-white">Treinar IA</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => navigate('/dashboard/messages')}
              className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-orange-500 mr-3" />
                <span className="text-white">Ver Conversas</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-white">Ver Relatórios</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Status do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-white">Firebase</span>
            </div>
            <span className="text-green-500 text-sm">Operacional</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-white">Dialogflow</span>
            </div>
            <span className="text-green-500 text-sm">Operacional</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-white">WhatsApp API</span>
            </div>
            <span className="text-yellow-500 text-sm">Lentidão</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;