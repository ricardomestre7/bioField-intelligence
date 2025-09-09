/**
 * Sistema de Notificações Push Inteligentes
 * Implementa notificações personalizadas, segmentação de usuários,
 * integração com PWA, análise de engajamento e automação inteligente
 */

class NotificationSystem {
    constructor() {
        this.notifications = new Map();
        this.subscribers = new Map();
        this.templates = new Map();
        this.campaigns = new Map();
        this.segments = new Map();
        this.analytics = new Map();
        this.settings = {
            enabled: true,
            maxNotificationsPerDay: 5,
            quietHours: { start: 22, end: 7 },
            enableSound: true,
            enableVibration: true,
            enableBadge: true,
            personalizedContent: true,
            aiOptimization: true,
            respectDoNotDisturb: true
        };
        this.serviceWorkerRegistration = null;
        this.vapidKeys = {
            publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
            privateKey: 'UGb2UzA1BAPXakCKo1kEtRSbudZWA6SwIigVjXhlHcE'
        };
        this.eventHandlers = new Map();
        this.aiEngine = null;
        this.init();
    }

    async init() {
        try {
            await this.initializeServiceWorker();
            await this.loadTemplates();
            await this.loadSegments();
            await this.loadSubscribers();
            await this.initializeAI();
            this.setupEventListeners();
            this.startPeriodicTasks();
            console.log('NotificationSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing NotificationSystem:', error);
        }
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered for notifications');
                
                // Configura message handler
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    async loadTemplates() {
        // Templates de notificação personalizáveis
        const notificationTemplates = [
            {
                id: 'welcome',
                name: 'Boas-vindas',
                title: 'Bem-vindo ao RegenTech! 🌱',
                body: 'Comece sua jornada sustentável hoje mesmo',
                icon: '/icons/welcome.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'explore', title: 'Explorar', icon: '/icons/explore.png' },
                    { action: 'dismiss', title: 'Dispensar', icon: '/icons/close.png' }
                ],
                category: 'onboarding',
                priority: 'high',
                personalized: false
            },
            {
                id: 'sustainability_tip',
                name: 'Dica de Sustentabilidade',
                title: 'Dica Sustentável do Dia 💡',
                body: '{tip_content}',
                icon: '/icons/tip.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'learn_more', title: 'Saiba Mais', icon: '/icons/info.png' },
                    { action: 'share', title: 'Compartilhar', icon: '/icons/share.png' }
                ],
                category: 'education',
                priority: 'medium',
                personalized: true
            },
            {
                id: 'achievement_unlock',
                name: 'Conquista Desbloqueada',
                title: 'Parabéns! 🏆',
                body: 'Você desbloqueou: {achievement_name}',
                icon: '/icons/achievement.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view_achievement', title: 'Ver Conquista', icon: '/icons/trophy.png' },
                    { action: 'share_achievement', title: 'Compartilhar', icon: '/icons/share.png' }
                ],
                category: 'gamification',
                priority: 'high',
                personalized: true
            },
            {
                id: 'carbon_alert',
                name: 'Alerta de Carbono',
                title: 'Meta de Carbono Atingida! 🌍',
                body: 'Você reduziu {carbon_amount}kg de CO2 este mês',
                icon: '/icons/carbon.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view_impact', title: 'Ver Impacto', icon: '/icons/chart.png' },
                    { action: 'set_new_goal', title: 'Nova Meta', icon: '/icons/target.png' }
                ],
                category: 'environmental',
                priority: 'high',
                personalized: true
            },
            {
                id: 'energy_saving',
                name: 'Economia de Energia',
                title: 'Economia Detectada! ⚡',
                body: 'Você economizou {energy_amount}kWh hoje',
                icon: '/icons/energy.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view_savings', title: 'Ver Economia', icon: '/icons/savings.png' },
                    { action: 'optimize_more', title: 'Otimizar Mais', icon: '/icons/optimize.png' }
                ],
                category: 'energy',
                priority: 'medium',
                personalized: true
            },
            {
                id: 'reminder',
                name: 'Lembrete Personalizado',
                title: 'Lembrete: {reminder_title}',
                body: '{reminder_content}',
                icon: '/icons/reminder.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'mark_done', title: 'Concluído', icon: '/icons/check.png' },
                    { action: 'snooze', title: 'Adiar', icon: '/icons/snooze.png' }
                ],
                category: 'reminder',
                priority: 'medium',
                personalized: true
            },
            {
                id: 'market_update',
                name: 'Atualização do Mercado',
                title: 'Mercado Sustentável 📈',
                body: 'Novas oportunidades disponíveis no marketplace',
                icon: '/icons/market.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view_market', title: 'Ver Mercado', icon: '/icons/shop.png' },
                    { action: 'set_alerts', title: 'Configurar Alertas', icon: '/icons/bell.png' }
                ],
                category: 'marketplace',
                priority: 'low',
                personalized: true
            }
        ];
        
        notificationTemplates.forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    async loadSegments() {
        // Segmentos de usuários para targeting
        const userSegments = [
            {
                id: 'new_users',
                name: 'Novos Usuários',
                description: 'Usuários registrados há menos de 7 dias',
                criteria: {
                    registrationDate: { operator: 'gte', value: Date.now() - 7 * 24 * 60 * 60 * 1000 },
                    loginCount: { operator: 'lte', value: 5 }
                },
                priority: 'high',
                maxNotificationsPerDay: 3
            },
            {
                id: 'active_users',
                name: 'Usuários Ativos',
                description: 'Usuários que fizeram login nos últimos 3 dias',
                criteria: {
                    lastLogin: { operator: 'gte', value: Date.now() - 3 * 24 * 60 * 60 * 1000 },
                    sessionCount: { operator: 'gte', value: 10 }
                },
                priority: 'medium',
                maxNotificationsPerDay: 5
            },
            {
                id: 'eco_enthusiasts',
                name: 'Entusiastas Ecológicos',
                description: 'Usuários com alta pontuação de sustentabilidade',
                criteria: {
                    sustainabilityScore: { operator: 'gte', value: 80 },
                    carbonReduction: { operator: 'gte', value: 100 }
                },
                priority: 'high',
                maxNotificationsPerDay: 4
            },
            {
                id: 'inactive_users',
                name: 'Usuários Inativos',
                description: 'Usuários que não fazem login há mais de 7 dias',
                criteria: {
                    lastLogin: { operator: 'lte', value: Date.now() - 7 * 24 * 60 * 60 * 1000 }
                },
                priority: 'medium',
                maxNotificationsPerDay: 2
            },
            {
                id: 'premium_users',
                name: 'Usuários Premium',
                description: 'Usuários com assinatura premium ativa',
                criteria: {
                    subscriptionType: { operator: 'eq', value: 'premium' },
                    subscriptionActive: { operator: 'eq', value: true }
                },
                priority: 'high',
                maxNotificationsPerDay: 6
            },
            {
                id: 'high_engagement',
                name: 'Alto Engajamento',
                description: 'Usuários com alta interação na plataforma',
                criteria: {
                    engagementScore: { operator: 'gte', value: 75 },
                    dailyActiveTime: { operator: 'gte', value: 30 } // minutos
                },
                priority: 'high',
                maxNotificationsPerDay: 5
            }
        ];
        
        userSegments.forEach(segment => {
            this.segments.set(segment.id, {
                ...segment,
                userCount: 0,
                lastUpdated: Date.now()
            });
        });
    }

    async loadSubscribers() {
        const savedSubscribers = localStorage.getItem('notificationSubscribers');
        if (savedSubscribers) {
            const subscribers = JSON.parse(savedSubscribers);
            subscribers.forEach(subscriber => {
                this.subscribers.set(subscriber.userId, subscriber);
            });
        }
    }

    async initializeAI() {
        // Simula engine de IA para otimização de notificações
        this.aiEngine = {
            // Prediz melhor horário para enviar notificação
            predictOptimalTime: (userId, notificationType) => {
                const subscriber = this.subscribers.get(userId);
                if (!subscriber || !subscriber.analytics) {
                    return new Date(); // Horário atual se não há dados
                }
                
                // Analisa padrões de engajamento
                const analytics = subscriber.analytics;
                const bestHours = analytics.engagementByHour || {};
                
                // Encontra horário com maior engajamento
                let bestHour = Object.keys(bestHours)
                    .reduce((a, b) => bestHours[a] > bestHours[b] ? a : b, '12');
                
                const optimalTime = new Date();
                optimalTime.setHours(parseInt(bestHour), 0, 0, 0);
                
                // Se o horário já passou hoje, agenda para amanhã
                if (optimalTime < new Date()) {
                    optimalTime.setDate(optimalTime.getDate() + 1);
                }
                
                return optimalTime;
            },
            
            // Personaliza conteúdo da notificação
            personalizeContent: (userId, template, context = {}) => {
                const subscriber = this.subscribers.get(userId);
                if (!subscriber || !template.personalized) {
                    return { title: template.title, body: template.body };
                }
                
                let personalizedTitle = template.title;
                let personalizedBody = template.body;
                
                // Substitui placeholders com dados do usuário
                const userData = subscriber.profile || {};
                const replacements = {
                    '{user_name}': userData.name || 'Usuário',
                    '{user_level}': userData.level || 1,
                    '{carbon_amount}': context.carbonAmount || '0',
                    '{energy_amount}': context.energyAmount || '0',
                    '{achievement_name}': context.achievementName || 'Nova Conquista',
                    '{tip_content}': context.tipContent || 'Dica sustentável personalizada',
                    '{reminder_title}': context.reminderTitle || 'Lembrete',
                    '{reminder_content}': context.reminderContent || 'Você tem uma tarefa pendente'
                };
                
                Object.entries(replacements).forEach(([placeholder, value]) => {
                    personalizedTitle = personalizedTitle.replace(placeholder, value);
                    personalizedBody = personalizedBody.replace(placeholder, value);
                });
                
                return {
                    title: personalizedTitle,
                    body: personalizedBody
                };
            },
            
            // Calcula score de relevância
            calculateRelevanceScore: (userId, notificationType, context = {}) => {
                const subscriber = this.subscribers.get(userId);
                if (!subscriber) return 0.5;
                
                let score = 0.5; // Score base
                
                // Fatores que aumentam relevância
                const preferences = subscriber.preferences || {};
                if (preferences[notificationType] !== false) score += 0.2;
                
                const analytics = subscriber.analytics || {};
                if (analytics.engagementRate > 0.7) score += 0.2;
                if (analytics.lastInteraction > Date.now() - 24 * 60 * 60 * 1000) score += 0.1;
                
                // Fatores específicos por tipo
                switch (notificationType) {
                    case 'sustainability_tip':
                        if (subscriber.profile?.sustainabilityScore > 50) score += 0.1;
                        break;
                    case 'achievement_unlock':
                        if (analytics.achievementEngagement > 0.8) score += 0.2;
                        break;
                    case 'carbon_alert':
                        if (subscriber.profile?.carbonGoals) score += 0.15;
                        break;
                }
                
                return Math.min(1, Math.max(0, score));
            }
        };
    }

    setupEventListeners() {
        // Escuta eventos de outros sistemas
        document.addEventListener('userAction', (event) => {
            this.handleUserAction(event.detail);
        });
        
        document.addEventListener('achievementUnlocked', (event) => {
            this.sendAchievementNotification(event.detail);
        });
        
        document.addEventListener('sustainabilityGoalReached', (event) => {
            this.sendGoalReachedNotification(event.detail);
        });
        
        document.addEventListener('energySavingDetected', (event) => {
            this.sendEnergySavingNotification(event.detail);
        });
    }

    startPeriodicTasks() {
        // Atualiza segmentos de usuários
        setInterval(() => {
            this.updateUserSegments();
        }, 60 * 60 * 1000); // A cada hora
        
        // Processa campanhas agendadas
        setInterval(() => {
            this.processScheduledCampaigns();
        }, 5 * 60 * 1000); // A cada 5 minutos
        
        // Limpa notificações antigas
        setInterval(() => {
            this.cleanupOldNotifications();
        }, 24 * 60 * 60 * 1000); // Diariamente
    }

    // Métodos de assinatura
    async requestPermission() {
        if (!('Notification' in window)) {
            throw new Error('Este navegador não suporta notificações');
        }
        
        let permission = Notification.permission;
        
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
        
        return permission === 'granted';
    }

    async subscribe(userId, userProfile = {}) {
        try {
            const hasPermission = await this.requestPermission();
            if (!hasPermission) {
                throw new Error('Permissão de notificação negada');
            }
            
            let pushSubscription = null;
            
            if (this.serviceWorkerRegistration) {
                pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.vapidKeys.publicKey)
                });
            }
            
            const subscriber = {
                userId,
                pushSubscription: pushSubscription ? pushSubscription.toJSON() : null,
                profile: userProfile,
                preferences: {
                    welcome: true,
                    sustainability_tip: true,
                    achievement_unlock: true,
                    carbon_alert: true,
                    energy_saving: true,
                    reminder: true,
                    market_update: false
                },
                settings: { ...this.settings },
                analytics: {
                    totalNotifications: 0,
                    clickedNotifications: 0,
                    dismissedNotifications: 0,
                    engagementRate: 0,
                    engagementByHour: {},
                    lastInteraction: Date.now(),
                    achievementEngagement: 0
                },
                segments: [],
                subscribedAt: Date.now(),
                lastActive: Date.now()
            };
            
            this.subscribers.set(userId, subscriber);
            this.updateUserSegments(userId);
            this.saveSubscribers();
            
            // Envia notificação de boas-vindas
            setTimeout(() => {
                this.sendNotification(userId, 'welcome');
            }, 2000);
            
            this.emit('userSubscribed', subscriber);
            return subscriber;
            
        } catch (error) {
            console.error('Error subscribing user:', error);
            throw error;
        }
    }

    async unsubscribe(userId) {
        const subscriber = this.subscribers.get(userId);
        if (!subscriber) return;
        
        if (subscriber.pushSubscription && this.serviceWorkerRegistration) {
            try {
                const pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
                if (pushSubscription) {
                    await pushSubscription.unsubscribe();
                }
            } catch (error) {
                console.error('Error unsubscribing from push:', error);
            }
        }
        
        this.subscribers.delete(userId);
        this.saveSubscribers();
        
        this.emit('userUnsubscribed', { userId });
    }

    // Métodos de envio de notificação
    async sendNotification(userId, templateId, context = {}, options = {}) {
        const subscriber = this.subscribers.get(userId);
        const template = this.templates.get(templateId);
        
        if (!subscriber || !template) {
            console.warn('Subscriber or template not found');
            return null;
        }
        
        // Verifica se pode enviar notificação
        if (!this.canSendNotification(userId, template)) {
            console.log('Cannot send notification due to limits or settings');
            return null;
        }
        
        // Personaliza conteúdo com IA
        const personalizedContent = this.aiEngine.personalizeContent(userId, template, context);
        
        // Calcula relevância
        const relevanceScore = this.aiEngine.calculateRelevanceScore(userId, templateId, context);
        
        // Se relevância muito baixa, não envia
        if (relevanceScore < 0.3 && !options.force) {
            console.log('Notification relevance too low, skipping');
            return null;
        }
        
        const notification = {
            id: this.generateId(),
            userId,
            templateId,
            title: personalizedContent.title,
            body: personalizedContent.body,
            icon: template.icon,
            badge: template.badge,
            actions: template.actions,
            data: {
                templateId,
                userId,
                context,
                relevanceScore,
                timestamp: Date.now()
            },
            tag: options.tag || templateId,
            requireInteraction: template.priority === 'high',
            silent: options.silent || false,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        try {
            // Envia notificação
            if (subscriber.pushSubscription) {
                await this.sendPushNotification(subscriber.pushSubscription, notification);
            } else {
                await this.sendBrowserNotification(notification);
            }
            
            notification.status = 'sent';
            notification.sentAt = Date.now();
            
            // Armazena notificação
            this.notifications.set(notification.id, notification);
            
            // Atualiza analytics
            subscriber.analytics.totalNotifications++;
            subscriber.analytics.lastInteraction = Date.now();
            
            this.saveSubscribers();
            this.emit('notificationSent', notification);
            
            return notification;
            
        } catch (error) {
            console.error('Error sending notification:', error);
            notification.status = 'failed';
            notification.error = error.message;
            return notification;
        }
    }

    async sendPushNotification(pushSubscription, notification) {
        // Em produção, isso seria enviado para o servidor push
        // Aqui simulamos o envio
        const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            badge: notification.badge,
            actions: notification.actions,
            data: notification.data,
            tag: notification.tag,
            requireInteraction: notification.requireInteraction,
            silent: notification.silent
        });
        
        // Simula envio para service worker
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: JSON.parse(payload)
            });
        }
    }

    async sendBrowserNotification(notification) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            throw new Error('Notifications not supported or not permitted');
        }
        
        const browserNotification = new Notification(notification.title, {
            body: notification.body,
            icon: notification.icon,
            badge: notification.badge,
            tag: notification.tag,
            requireInteraction: notification.requireInteraction,
            silent: notification.silent,
            data: notification.data
        });
        
        // Event listeners
        browserNotification.onclick = () => {
            this.handleNotificationClick(notification.id);
            browserNotification.close();
        };
        
        browserNotification.onclose = () => {
            this.handleNotificationDismiss(notification.id);
        };
        
        // Auto-close após 10 segundos se não for high priority
        if (notification.data.templateId !== 'achievement_unlock') {
            setTimeout(() => {
                browserNotification.close();
            }, 10000);
        }
    }

    // Métodos de campanha
    async createCampaign(campaignData) {
        const campaign = {
            id: this.generateId(),
            name: campaignData.name,
            description: campaignData.description,
            templateId: campaignData.templateId,
            targetSegments: campaignData.targetSegments || [],
            scheduledAt: campaignData.scheduledAt || Date.now(),
            context: campaignData.context || {},
            options: campaignData.options || {},
            status: 'scheduled',
            createdAt: Date.now(),
            stats: {
                targeted: 0,
                sent: 0,
                delivered: 0,
                clicked: 0,
                dismissed: 0
            }
        };
        
        this.campaigns.set(campaign.id, campaign);
        this.emit('campaignCreated', campaign);
        
        return campaign;
    }

    async processScheduledCampaigns() {
        const now = Date.now();
        
        for (const [campaignId, campaign] of this.campaigns.entries()) {
            if (campaign.status === 'scheduled' && campaign.scheduledAt <= now) {
                await this.executeCampaign(campaignId);
            }
        }
    }

    async executeCampaign(campaignId) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign || campaign.status !== 'scheduled') return;
        
        campaign.status = 'running';
        campaign.startedAt = Date.now();
        
        // Encontra usuários alvo
        const targetUsers = this.getTargetUsers(campaign.targetSegments);
        campaign.stats.targeted = targetUsers.length;
        
        // Envia notificações
        const sendPromises = targetUsers.map(async (userId) => {
            try {
                const notification = await this.sendNotification(
                    userId, 
                    campaign.templateId, 
                    campaign.context, 
                    campaign.options
                );
                
                if (notification && notification.status === 'sent') {
                    campaign.stats.sent++;
                }
            } catch (error) {
                console.error(`Error sending campaign notification to ${userId}:`, error);
            }
        });
        
        await Promise.all(sendPromises);
        
        campaign.status = 'completed';
        campaign.completedAt = Date.now();
        
        this.emit('campaignCompleted', campaign);
    }

    getTargetUsers(segmentIds) {
        if (!segmentIds || segmentIds.length === 0) {
            return Array.from(this.subscribers.keys());
        }
        
        const targetUsers = new Set();
        
        segmentIds.forEach(segmentId => {
            const segment = this.segments.get(segmentId);
            if (!segment) return;
            
            this.subscribers.forEach((subscriber, userId) => {
                if (this.userMatchesSegment(subscriber, segment)) {
                    targetUsers.add(userId);
                }
            });
        });
        
        return Array.from(targetUsers);
    }

    userMatchesSegment(subscriber, segment) {
        const criteria = segment.criteria;
        
        for (const [field, condition] of Object.entries(criteria)) {
            const userValue = this.getUserFieldValue(subscriber, field);
            
            if (!this.evaluateCondition(userValue, condition)) {
                return false;
            }
        }
        
        return true;
    }

    getUserFieldValue(subscriber, field) {
        switch (field) {
            case 'registrationDate':
                return subscriber.subscribedAt;
            case 'lastLogin':
                return subscriber.lastActive;
            case 'loginCount':
                return subscriber.analytics?.totalNotifications || 0;
            case 'sessionCount':
                return subscriber.analytics?.clickedNotifications || 0;
            case 'sustainabilityScore':
                return subscriber.profile?.sustainabilityScore || 0;
            case 'carbonReduction':
                return subscriber.profile?.carbonReduction || 0;
            case 'subscriptionType':
                return subscriber.profile?.subscriptionType || 'free';
            case 'subscriptionActive':
                return subscriber.profile?.subscriptionActive || false;
            case 'engagementScore':
                return subscriber.analytics?.engagementRate * 100 || 0;
            case 'dailyActiveTime':
                return subscriber.profile?.dailyActiveTime || 0;
            default:
                return null;
        }
    }

    evaluateCondition(value, condition) {
        const { operator, value: conditionValue } = condition;
        
        switch (operator) {
            case 'eq': return value === conditionValue;
            case 'ne': return value !== conditionValue;
            case 'gt': return value > conditionValue;
            case 'gte': return value >= conditionValue;
            case 'lt': return value < conditionValue;
            case 'lte': return value <= conditionValue;
            case 'in': return Array.isArray(conditionValue) && conditionValue.includes(value);
            case 'nin': return Array.isArray(conditionValue) && !conditionValue.includes(value);
            default: return false;
        }
    }

    // Métodos de controle
    canSendNotification(userId, template) {
        const subscriber = this.subscribers.get(userId);
        if (!subscriber || !subscriber.settings.enabled) return false;
        
        // Verifica preferências do usuário
        if (subscriber.preferences[template.id] === false) return false;
        
        // Verifica limite diário
        const today = new Date().toDateString();
        const todayNotifications = Array.from(this.notifications.values())
            .filter(n => n.userId === userId && 
                    new Date(n.timestamp).toDateString() === today &&
                    n.status === 'sent');
        
        const maxDaily = subscriber.settings.maxNotificationsPerDay;
        if (todayNotifications.length >= maxDaily) return false;
        
        // Verifica horário de silêncio
        if (subscriber.settings.respectDoNotDisturb) {
            const now = new Date();
            const currentHour = now.getHours();
            const quietStart = subscriber.settings.quietHours.start;
            const quietEnd = subscriber.settings.quietHours.end;
            
            if (quietStart > quietEnd) {
                // Período atravessa meia-noite
                if (currentHour >= quietStart || currentHour < quietEnd) {
                    return false;
                }
            } else {
                // Período normal
                if (currentHour >= quietStart && currentHour < quietEnd) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // Métodos de evento
    handleNotificationClick(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;
        
        notification.clickedAt = Date.now();
        
        // Atualiza analytics
        const subscriber = this.subscribers.get(notification.userId);
        if (subscriber) {
            subscriber.analytics.clickedNotifications++;
            subscriber.analytics.engagementRate = 
                subscriber.analytics.clickedNotifications / subscriber.analytics.totalNotifications;
            
            // Atualiza engajamento por hora
            const hour = new Date().getHours();
            subscriber.analytics.engagementByHour[hour] = 
                (subscriber.analytics.engagementByHour[hour] || 0) + 1;
            
            this.saveSubscribers();
        }
        
        this.emit('notificationClicked', notification);
    }

    handleNotificationDismiss(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;
        
        notification.dismissedAt = Date.now();
        
        // Atualiza analytics
        const subscriber = this.subscribers.get(notification.userId);
        if (subscriber) {
            subscriber.analytics.dismissedNotifications++;
            this.saveSubscribers();
        }
        
        this.emit('notificationDismissed', notification);
    }

    handleServiceWorkerMessage(data) {
        switch (data.type) {
            case 'NOTIFICATION_CLICKED':
                this.handleNotificationClick(data.notificationId);
                break;
            case 'NOTIFICATION_CLOSED':
                this.handleNotificationDismiss(data.notificationId);
                break;
        }
    }

    handleUserAction(actionData) {
        // Atualiza perfil do usuário baseado em ações
        const subscriber = this.subscribers.get(actionData.userId);
        if (!subscriber) return;
        
        subscriber.lastActive = Date.now();
        
        // Atualiza métricas específicas
        switch (actionData.type) {
            case 'sustainability_action':
                subscriber.profile.sustainabilityScore = 
                    (subscriber.profile.sustainabilityScore || 0) + actionData.points;
                break;
            case 'carbon_reduction':
                subscriber.profile.carbonReduction = 
                    (subscriber.profile.carbonReduction || 0) + actionData.amount;
                break;
            case 'energy_saving':
                subscriber.profile.energySaved = 
                    (subscriber.profile.energySaved || 0) + actionData.amount;
                break;
        }
        
        this.updateUserSegments(actionData.userId);
        this.saveSubscribers();
    }

    // Métodos de notificação específica
    async sendAchievementNotification(achievementData) {
        await this.sendNotification(
            achievementData.userId,
            'achievement_unlock',
            { achievementName: achievementData.name }
        );
    }

    async sendGoalReachedNotification(goalData) {
        const templateId = goalData.type === 'carbon' ? 'carbon_alert' : 'energy_saving';
        const context = goalData.type === 'carbon' ? 
            { carbonAmount: goalData.amount } : 
            { energyAmount: goalData.amount };
        
        await this.sendNotification(goalData.userId, templateId, context);
    }

    async sendEnergySavingNotification(savingData) {
        await this.sendNotification(
            savingData.userId,
            'energy_saving',
            { energyAmount: savingData.amount }
        );
    }

    async sendDailySustainabilityTip(userId) {
        const tips = [
            'Desligue aparelhos eletrônicos quando não estiver usando',
            'Use transporte público ou bicicleta sempre que possível',
            'Reduza o consumo de carne uma vez por semana',
            'Recicle e reutilize materiais sempre que possível',
            'Use lâmpadas LED para economizar energia',
            'Tome banhos mais curtos para economizar água',
            'Plante uma árvore ou cuide de plantas em casa',
            'Compre produtos locais e orgânicos quando possível'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        await this.sendNotification(
            userId,
            'sustainability_tip',
            { tipContent: randomTip }
        );
    }

    async sendCustomReminder(userId, title, content, scheduledTime) {
        const delay = scheduledTime - Date.now();
        
        if (delay > 0) {
            setTimeout(() => {
                this.sendNotification(
                    userId,
                    'reminder',
                    { reminderTitle: title, reminderContent: content }
                );
            }, delay);
        } else {
            await this.sendNotification(
                userId,
                'reminder',
                { reminderTitle: title, reminderContent: content }
            );
        }
    }

    // Métodos de segmentação
    updateUserSegments(userId = null) {
        const usersToUpdate = userId ? [userId] : Array.from(this.subscribers.keys());
        
        usersToUpdate.forEach(uid => {
            const subscriber = this.subscribers.get(uid);
            if (!subscriber) return;
            
            subscriber.segments = [];
            
            this.segments.forEach((segment, segmentId) => {
                if (this.userMatchesSegment(subscriber, segment)) {
                    subscriber.segments.push(segmentId);
                }
            });
        });
        
        // Atualiza contadores dos segmentos
        this.segments.forEach(segment => {
            segment.userCount = 0;
            segment.lastUpdated = Date.now();
        });
        
        this.subscribers.forEach(subscriber => {
            subscriber.segments.forEach(segmentId => {
                const segment = this.segments.get(segmentId);
                if (segment) {
                    segment.userCount++;
                }
            });
        });
        
        this.saveSubscribers();
    }

    // Métodos de limpeza
    cleanupOldNotifications() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        for (const [notificationId, notification] of this.notifications.entries()) {
            if (notification.timestamp < thirtyDaysAgo) {
                this.notifications.delete(notificationId);
            }
        }
    }

    // Métodos de configuração
    updateUserPreferences(userId, preferences) {
        const subscriber = this.subscribers.get(userId);
        if (!subscriber) return;
        
        subscriber.preferences = { ...subscriber.preferences, ...preferences };
        this.saveSubscribers();
        
        this.emit('preferencesUpdated', { userId, preferences });
    }

    updateUserSettings(userId, settings) {
        const subscriber = this.subscribers.get(userId);
        if (!subscriber) return;
        
        subscriber.settings = { ...subscriber.settings, ...settings };
        this.saveSubscribers();
        
        this.emit('settingsUpdated', { userId, settings });
    }

    // Métodos de relatório
    generateAnalyticsReport() {
        const totalSubscribers = this.subscribers.size;
        const totalNotifications = this.notifications.size;
        
        let totalSent = 0;
        let totalClicked = 0;
        let totalDismissed = 0;
        
        this.notifications.forEach(notification => {
            if (notification.status === 'sent') totalSent++;
            if (notification.clickedAt) totalClicked++;
            if (notification.dismissedAt) totalDismissed++;
        });
        
        const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
        const dismissRate = totalSent > 0 ? (totalDismissed / totalSent) * 100 : 0;
        
        // Analytics por template
        const templateStats = new Map();
        this.notifications.forEach(notification => {
            const templateId = notification.templateId;
            if (!templateStats.has(templateId)) {
                templateStats.set(templateId, {
                    sent: 0,
                    clicked: 0,
                    dismissed: 0
                });
            }
            
            const stats = templateStats.get(templateId);
            if (notification.status === 'sent') stats.sent++;
            if (notification.clickedAt) stats.clicked++;
            if (notification.dismissedAt) stats.dismissed++;
        });
        
        // Analytics por segmento
        const segmentStats = new Map();
        this.segments.forEach((segment, segmentId) => {
            segmentStats.set(segmentId, {
                name: segment.name,
                userCount: segment.userCount,
                lastUpdated: segment.lastUpdated
            });
        });
        
        return {
            overview: {
                totalSubscribers,
                totalNotifications,
                totalSent,
                totalClicked,
                totalDismissed,
                clickRate: clickRate.toFixed(2),
                dismissRate: dismissRate.toFixed(2)
            },
            templates: Object.fromEntries(templateStats),
            segments: Object.fromEntries(segmentStats),
            campaigns: Array.from(this.campaigns.values())
        };
    }

    // Métodos de renderização
    renderNotificationInterface() {
        return `
            <div class="notification-system">
                <div class="notification-header">
                    <h3>Sistema de Notificações</h3>
                    <div class="notification-stats">
                        ${this.renderNotificationStats()}
                    </div>
                </div>
                
                <div class="notification-content">
                    <div class="notification-controls">
                        ${this.renderNotificationControls()}
                    </div>
                    
                    <div class="notification-campaigns">
                        ${this.renderCampaigns()}
                    </div>
                    
                    <div class="notification-analytics">
                        ${this.renderAnalytics()}
                    </div>
                </div>
            </div>
        `;
    }

    renderNotificationStats() {
        const stats = this.generateAnalyticsReport().overview;
        
        return `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${stats.totalSubscribers}</span>
                    <span class="stat-label">Inscritos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.totalSent}</span>
                    <span class="stat-label">Enviadas</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.clickRate}%</span>
                    <span class="stat-label">Taxa de Clique</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.dismissRate}%</span>
                    <span class="stat-label">Taxa de Dispensa</span>
                </div>
            </div>
        `;
    }

    renderNotificationControls() {
        return `
            <div class="notification-controls-panel">
                <h4>Controles</h4>
                
                <div class="control-section">
                    <h5>Envio Rápido</h5>
                    <div class="quick-send">
                        <select id="template-select" class="template-select">
                            <option value="">Selecionar Template</option>
                            ${Array.from(this.templates.values()).map(template => 
                                `<option value="${template.id}">${template.name}</option>`
                            ).join('')}
                        </select>
                        
                        <select id="segment-select" class="segment-select">
                            <option value="">Todos os Usuários</option>
                            ${Array.from(this.segments.values()).map(segment => 
                                `<option value="${segment.id}">${segment.name} (${segment.userCount})</option>`
                            ).join('')}
                        </select>
                        
                        <button id="send-now-btn" class="send-btn">Enviar Agora</button>
                    </div>
                </div>
                
                <div class="control-section">
                    <h5>Nova Campanha</h5>
                    <button id="create-campaign-btn" class="create-btn">Criar Campanha</button>
                </div>
            </div>
        `;
    }

    renderCampaigns() {
        const campaigns = Array.from(this.campaigns.values())
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10);
        
        return `
            <div class="campaigns-panel">
                <h4>Campanhas Recentes</h4>
                <div class="campaigns-list">
                    ${campaigns.map(campaign => `
                        <div class="campaign-item" data-campaign-id="${campaign.id}">
                            <div class="campaign-info">
                                <span class="campaign-name">${campaign.name}</span>
                                <span class="campaign-status ${campaign.status}">${campaign.status}</span>
                            </div>
                            <div class="campaign-stats">
                                <span class="stat">Alvo: ${campaign.stats.targeted}</span>
                                <span class="stat">Enviadas: ${campaign.stats.sent}</span>
                                <span class="stat">Cliques: ${campaign.stats.clicked}</span>
                            </div>
                            <div class="campaign-date">
                                ${new Date(campaign.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAnalytics() {
        const analytics = this.generateAnalyticsReport();
        
        return `
            <div class="analytics-panel">
                <h4>Analytics</h4>
                
                <div class="analytics-section">
                    <h5>Performance por Template</h5>
                    <div class="template-analytics">
                        ${Object.entries(analytics.templates).map(([templateId, stats]) => {
                            const template = this.templates.get(templateId);
                            const clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : '0';
                            
                            return `
                                <div class="template-stat">
                                    <span class="template-name">${template?.name || templateId}</span>
                                    <span class="template-sent">${stats.sent} enviadas</span>
                                    <span class="template-rate">${clickRate}% cliques</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h5>Segmentos de Usuários</h5>
                    <div class="segment-analytics">
                        ${Object.entries(analytics.segments).map(([segmentId, stats]) => `
                            <div class="segment-stat">
                                <span class="segment-name">${stats.name}</span>
                                <span class="segment-count">${stats.userCount} usuários</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Métodos utilitários
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }

    saveSubscribers() {
        const subscribers = Array.from(this.subscribers.values()).map(subscriber => ({
            ...subscriber,
            pushSubscription: subscriber.pushSubscription // Mantém como está
        }));
        localStorage.setItem('notificationSubscribers', JSON.stringify(subscribers));
    }

    // Métodos de evento
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Error in event handler:', error);
                }
            });
        }
    }

    // Getters para status do sistema
    getSystemStatus() {
        return {
            enabled: this.settings.enabled,
            totalSubscribers: this.subscribers.size,
            totalNotifications: this.notifications.size,
            activeCampaigns: Array.from(this.campaigns.values())
                .filter(c => c.status === 'running').length,
            serviceWorkerReady: !!this.serviceWorkerRegistration,
            permissionStatus: Notification.permission
        };
    }

    getSubscriberStatus(userId) {
        const subscriber = this.subscribers.get(userId);
        if (!subscriber) return null;
        
        return {
            subscribed: true,
            preferences: subscriber.preferences,
            settings: subscriber.settings,
            segments: subscriber.segments,
            analytics: subscriber.analytics,
            lastActive: subscriber.lastActive
        };
    }

    // Cleanup
    cleanup() {
        this.saveSubscribers();
        this.notifications.clear();
        this.subscribers.clear();
        this.campaigns.clear();
    }
}

// Instância global
window.notificationSystem = new NotificationSystem();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (window.notificationSystem) {
        console.log('NotificationSystem loaded and ready');
    }
});

export default NotificationSystem;