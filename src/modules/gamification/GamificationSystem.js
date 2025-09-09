/**
 * Sistema de Gamificação e Recompensas
 * Implementa mecânicas de jogos para engajar usuários em práticas sustentáveis
 * @author RegenTech Solutions
 * @version 3.0.0
 */

import { Logger } from '../../utils/Logger.js';
import { ConfigManager } from '../../config/ConfigManager.js';

export class GamificationSystem {
    constructor(config = {}) {
        this.config = {
            enableAchievements: config.enableAchievements !== false,
            enableLeaderboards: config.enableLeaderboards !== false,
            enableChallenges: config.enableChallenges !== false,
            enableRewards: config.enableRewards !== false,
            enableBadges: config.enableBadges !== false,
            enableLevels: config.enableLevels !== false,
            pointsMultiplier: config.pointsMultiplier || 1,
            maxLevel: config.maxLevel || 100,
            challengeRefreshInterval: config.challengeRefreshInterval || 86400000, // 24 horas
            ...config
        };
        
        this.logger = new Logger('GamificationSystem');
        this.configManager = new ConfigManager();
        this.isInitialized = false;
        
        // Sistema de pontos e níveis
        this.userProfiles = new Map();
        this.globalLeaderboard = [];
        this.seasonalLeaderboard = [];
        
        // Conquistas e badges
        this.achievements = new Map();
        this.badges = new Map();
        this.userAchievements = new Map();
        
        // Desafios e missões
        this.challenges = new Map();
        this.activeChallenges = new Map();
        this.completedChallenges = new Map();
        
        // Sistema de recompensas
        this.rewards = new Map();
        this.rewardHistory = new Map();
        
        // Eventos e notificações
        this.eventListeners = new Map();
        this.notifications = [];
        
        this.initializeSystem();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Sistema de Gamificação...');
            
            // Carregar configurações
            await this.loadConfiguration();
            
            // Inicializar conquistas
            if (this.config.enableAchievements) {
                await this.setupAchievements();
            }
            
            // Configurar badges
            if (this.config.enableBadges) {
                await this.setupBadges();
            }
            
            // Inicializar desafios
            if (this.config.enableChallenges) {
                await this.setupChallenges();
            }
            
            // Configurar sistema de recompensas
            if (this.config.enableRewards) {
                await this.setupRewards();
            }
            
            // Inicializar leaderboards
            if (this.config.enableLeaderboards) {
                await this.setupLeaderboards();
            }
            
            // Carregar dados dos usuários
            await this.loadUserData();
            
            // Iniciar eventos automáticos
            this.startAutomaticEvents();
            
            this.isInitialized = true;
            this.logger.success('Sistema de Gamificação inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Sistema de Gamificação:', error);
            throw error;
        }
    }

    initializeSystem() {
        // Tipos de pontos
        this.pointTypes = {
            sustainability: {
                name: 'Pontos de Sustentabilidade',
                icon: '🌱',
                color: '#4CAF50',
                multiplier: 1
            },
            energy: {
                name: 'Pontos de Energia',
                icon: '⚡',
                color: '#FFC107',
                multiplier: 1.2
            },
            water: {
                name: 'Pontos de Água',
                icon: '💧',
                color: '#2196F3',
                multiplier: 1.1
            },
            carbon: {
                name: 'Pontos de Carbono',
                icon: '🌍',
                color: '#8BC34A',
                multiplier: 1.5
            },
            community: {
                name: 'Pontos de Comunidade',
                icon: '👥',
                color: '#9C27B0',
                multiplier: 1.3
            },
            innovation: {
                name: 'Pontos de Inovação',
                icon: '💡',
                color: '#FF9800',
                multiplier: 1.4
            }
        };
        
        // Níveis do sistema
        this.levelSystem = {
            thresholds: [0, 100, 250, 500, 1000, 2000, 4000, 7500, 12000, 20000, 35000, 60000, 100000],
            titles: [
                'Iniciante Verde', 'Eco Aprendiz', 'Guardião da Natureza', 'Defensor Ambiental',
                'Especialista Sustentável', 'Mestre Regenerativo', 'Líder Ecológico', 'Visionário Verde',
                'Pioneiro Sustentável', 'Embaixador Planetário', 'Guardião Global', 'Mestre Supremo',
                'Lenda Regenerativa'
            ],
            rewards: [
                { type: 'badge', id: 'newcomer' },
                { type: 'points', amount: 50 },
                { type: 'badge', id: 'nature_guardian' },
                { type: 'unlock', feature: 'advanced_metrics' },
                { type: 'badge', id: 'sustainability_expert' },
                { type: 'unlock', feature: 'custom_challenges' },
                { type: 'badge', id: 'eco_leader' },
                { type: 'unlock', feature: 'community_features' },
                { type: 'badge', id: 'pioneer' },
                { type: 'unlock', feature: 'premium_analytics' },
                { type: 'badge', id: 'global_guardian' },
                { type: 'unlock', feature: 'mentor_program' },
                { type: 'badge', id: 'regenerative_legend' }
            ]
        };
        
        // Categorias de conquistas
        this.achievementCategories = {
            energy: {
                name: 'Energia Sustentável',
                icon: '⚡',
                description: 'Conquistas relacionadas ao uso eficiente de energia'
            },
            water: {
                name: 'Conservação de Água',
                icon: '💧',
                description: 'Conquistas por economia e uso consciente da água'
            },
            carbon: {
                name: 'Neutralidade de Carbono',
                icon: '🌍',
                description: 'Conquistas por redução da pegada de carbono'
            },
            waste: {
                name: 'Gestão de Resíduos',
                icon: '♻️',
                description: 'Conquistas por redução e reciclagem de resíduos'
            },
            community: {
                name: 'Engajamento Comunitário',
                icon: '👥',
                description: 'Conquistas por participação e liderança comunitária'
            },
            innovation: {
                name: 'Inovação Verde',
                icon: '💡',
                description: 'Conquistas por implementação de soluções inovadoras'
            },
            consistency: {
                name: 'Consistência',
                icon: '📅',
                description: 'Conquistas por uso consistente da plataforma'
            },
            milestones: {
                name: 'Marcos Importantes',
                icon: '🏆',
                description: 'Conquistas por alcançar marcos significativos'
            }
        };
    }

    async loadConfiguration() {
        try {
            const gamificationConfig = await this.configManager.get('gamification', {
                points: {},
                achievements: {},
                challenges: {},
                rewards: {}
            });
            
            this.config = { ...this.config, ...gamificationConfig };
            this.logger.debug('Configurações de gamificação carregadas');
            
        } catch (error) {
            this.logger.error('Erro ao carregar configurações de gamificação:', error);
        }
    }

    async setupAchievements() {
        try {
            this.logger.info('Configurando sistema de conquistas...');
            
            // Conquistas de energia
            this.createAchievement('energy_saver_bronze', {
                name: 'Economizador de Energia - Bronze',
                description: 'Economize 100 kWh de energia',
                category: 'energy',
                icon: '🥉',
                points: 100,
                rarity: 'common',
                requirements: {
                    type: 'cumulative',
                    metric: 'energy_saved',
                    target: 100,
                    unit: 'kWh'
                }
            });
            
            this.createAchievement('energy_saver_silver', {
                name: 'Economizador de Energia - Prata',
                description: 'Economize 500 kWh de energia',
                category: 'energy',
                icon: '🥈',
                points: 300,
                rarity: 'uncommon',
                requirements: {
                    type: 'cumulative',
                    metric: 'energy_saved',
                    target: 500,
                    unit: 'kWh'
                }
            });
            
            this.createAchievement('energy_saver_gold', {
                name: 'Economizador de Energia - Ouro',
                description: 'Economize 1000 kWh de energia',
                category: 'energy',
                icon: '🥇',
                points: 500,
                rarity: 'rare',
                requirements: {
                    type: 'cumulative',
                    metric: 'energy_saved',
                    target: 1000,
                    unit: 'kWh'
                }
            });
            
            // Conquistas de água
            this.createAchievement('water_guardian', {
                name: 'Guardião das Águas',
                description: 'Economize 1000 litros de água',
                category: 'water',
                icon: '🌊',
                points: 200,
                rarity: 'uncommon',
                requirements: {
                    type: 'cumulative',
                    metric: 'water_saved',
                    target: 1000,
                    unit: 'L'
                }
            });
            
            // Conquistas de carbono
            this.createAchievement('carbon_neutral', {
                name: 'Neutro em Carbono',
                description: 'Compense 1 tonelada de CO2',
                category: 'carbon',
                icon: '🌱',
                points: 400,
                rarity: 'rare',
                requirements: {
                    type: 'cumulative',
                    metric: 'carbon_offset',
                    target: 1000,
                    unit: 'kg CO2'
                }
            });
            
            // Conquistas de consistência
            this.createAchievement('daily_streak_7', {
                name: 'Sequência de 7 Dias',
                description: 'Use a plataforma por 7 dias consecutivos',
                category: 'consistency',
                icon: '🔥',
                points: 150,
                rarity: 'common',
                requirements: {
                    type: 'streak',
                    metric: 'daily_login',
                    target: 7
                }
            });
            
            this.createAchievement('daily_streak_30', {
                name: 'Sequência de 30 Dias',
                description: 'Use a plataforma por 30 dias consecutivos',
                category: 'consistency',
                icon: '🔥',
                points: 500,
                rarity: 'epic',
                requirements: {
                    type: 'streak',
                    metric: 'daily_login',
                    target: 30
                }
            });
            
            // Conquistas de comunidade
            this.createAchievement('community_helper', {
                name: 'Ajudante da Comunidade',
                description: 'Ajude 10 outros usuários',
                category: 'community',
                icon: '🤝',
                points: 250,
                rarity: 'uncommon',
                requirements: {
                    type: 'cumulative',
                    metric: 'users_helped',
                    target: 10
                }
            });
            
            // Conquistas de inovação
            this.createAchievement('innovator', {
                name: 'Inovador Verde',
                description: 'Implemente 5 soluções inovadoras',
                category: 'innovation',
                icon: '💡',
                points: 300,
                rarity: 'rare',
                requirements: {
                    type: 'cumulative',
                    metric: 'innovations_implemented',
                    target: 5
                }
            });
            
            // Conquistas de marcos
            this.createAchievement('first_steps', {
                name: 'Primeiros Passos',
                description: 'Complete seu primeiro desafio',
                category: 'milestones',
                icon: '👶',
                points: 50,
                rarity: 'common',
                requirements: {
                    type: 'count',
                    metric: 'challenges_completed',
                    target: 1
                }
            });
            
            this.createAchievement('challenge_master', {
                name: 'Mestre dos Desafios',
                description: 'Complete 50 desafios',
                category: 'milestones',
                icon: '🏆',
                points: 1000,
                rarity: 'legendary',
                requirements: {
                    type: 'count',
                    metric: 'challenges_completed',
                    target: 50
                }
            });
            
            this.logger.success(`${this.achievements.size} conquistas configuradas`);
            
        } catch (error) {
            this.logger.error('Erro ao configurar conquistas:', error);
        }
    }

    createAchievement(id, config) {
        const achievement = {
            id,
            ...config,
            unlockedBy: [],
            createdAt: Date.now(),
            isActive: true
        };
        
        this.achievements.set(id, achievement);
        return achievement;
    }

    async setupBadges() {
        try {
            this.logger.info('Configurando sistema de badges...');
            
            // Badges de nível
            this.createBadge('newcomer', {
                name: 'Recém-chegado',
                description: 'Bem-vindo à comunidade RegenTech!',
                icon: '🌱',
                color: '#4CAF50',
                rarity: 'common',
                category: 'level'
            });
            
            this.createBadge('nature_guardian', {
                name: 'Guardião da Natureza',
                description: 'Protetor dedicado do meio ambiente',
                icon: '🛡️',
                color: '#2E7D32',
                rarity: 'uncommon',
                category: 'level'
            });
            
            this.createBadge('sustainability_expert', {
                name: 'Especialista em Sustentabilidade',
                description: 'Conhecimento avançado em práticas sustentáveis',
                icon: '🎓',
                color: '#1976D2',
                rarity: 'rare',
                category: 'level'
            });
            
            this.createBadge('eco_leader', {
                name: 'Líder Ecológico',
                description: 'Liderança inspiradora na sustentabilidade',
                icon: '👑',
                color: '#F57C00',
                rarity: 'epic',
                category: 'level'
            });
            
            this.createBadge('pioneer', {
                name: 'Pioneiro Sustentável',
                description: 'Inovador em soluções regenerativas',
                icon: '🚀',
                color: '#7B1FA2',
                rarity: 'epic',
                category: 'level'
            });
            
            this.createBadge('global_guardian', {
                name: 'Guardião Global',
                description: 'Impacto mundial em sustentabilidade',
                icon: '🌍',
                color: '#C62828',
                rarity: 'legendary',
                category: 'level'
            });
            
            this.createBadge('regenerative_legend', {
                name: 'Lenda Regenerativa',
                description: 'Máximo nível de excelência sustentável',
                icon: '⭐',
                color: '#FFD700',
                rarity: 'mythic',
                category: 'level'
            });
            
            // Badges especiais
            this.createBadge('early_adopter', {
                name: 'Adotante Inicial',
                description: 'Um dos primeiros usuários da plataforma',
                icon: '🏃',
                color: '#FF5722',
                rarity: 'rare',
                category: 'special'
            });
            
            this.createBadge('beta_tester', {
                name: 'Testador Beta',
                description: 'Ajudou a testar recursos em desenvolvimento',
                icon: '🧪',
                color: '#9C27B0',
                rarity: 'epic',
                category: 'special'
            });
            
            this.createBadge('community_champion', {
                name: 'Campeão da Comunidade',
                description: 'Contribuição excepcional para a comunidade',
                icon: '🏆',
                color: '#FFD700',
                rarity: 'legendary',
                category: 'special'
            });
            
            this.logger.success(`${this.badges.size} badges configurados`);
            
        } catch (error) {
            this.logger.error('Erro ao configurar badges:', error);
        }
    }

    createBadge(id, config) {
        const badge = {
            id,
            ...config,
            earnedBy: [],
            createdAt: Date.now(),
            isActive: true
        };
        
        this.badges.set(id, badge);
        return badge;
    }

    async setupChallenges() {
        try {
            this.logger.info('Configurando sistema de desafios...');
            
            // Desafios diários
            this.createChallenge('daily_energy_check', {
                name: 'Verificação Diária de Energia',
                description: 'Verifique seu consumo de energia hoje',
                type: 'daily',
                category: 'energy',
                difficulty: 'easy',
                points: 25,
                duration: 86400000, // 24 horas
                requirements: {
                    type: 'action',
                    action: 'check_energy_metrics',
                    target: 1
                },
                rewards: {
                    points: { energy: 25 },
                    badges: [],
                    unlocks: []
                }
            });
            
            this.createChallenge('daily_water_log', {
                name: 'Registro Diário de Água',
                description: 'Registre seu uso de água hoje',
                type: 'daily',
                category: 'water',
                difficulty: 'easy',
                points: 20,
                duration: 86400000,
                requirements: {
                    type: 'action',
                    action: 'log_water_usage',
                    target: 1
                },
                rewards: {
                    points: { water: 20 },
                    badges: [],
                    unlocks: []
                }
            });
            
            // Desafios semanais
            this.createChallenge('weekly_carbon_reduction', {
                name: 'Redução Semanal de Carbono',
                description: 'Reduza sua pegada de carbono em 10% esta semana',
                type: 'weekly',
                category: 'carbon',
                difficulty: 'medium',
                points: 150,
                duration: 604800000, // 7 dias
                requirements: {
                    type: 'percentage_reduction',
                    metric: 'carbon_footprint',
                    target: 10
                },
                rewards: {
                    points: { carbon: 150, sustainability: 50 },
                    badges: [],
                    unlocks: []
                }
            });
            
            this.createChallenge('weekly_waste_reduction', {
                name: 'Redução Semanal de Resíduos',
                description: 'Reduza seus resíduos em 20% esta semana',
                type: 'weekly',
                category: 'waste',
                difficulty: 'medium',
                points: 120,
                duration: 604800000,
                requirements: {
                    type: 'percentage_reduction',
                    metric: 'waste_generated',
                    target: 20
                },
                rewards: {
                    points: { sustainability: 120 },
                    badges: [],
                    unlocks: []
                }
            });
            
            // Desafios mensais
            this.createChallenge('monthly_innovation', {
                name: 'Inovação Mensal',
                description: 'Implemente uma nova solução sustentável este mês',
                type: 'monthly',
                category: 'innovation',
                difficulty: 'hard',
                points: 500,
                duration: 2592000000, // 30 dias
                requirements: {
                    type: 'implementation',
                    action: 'implement_solution',
                    target: 1
                },
                rewards: {
                    points: { innovation: 500, sustainability: 200 },
                    badges: ['innovator'],
                    unlocks: ['advanced_analytics']
                }
            });
            
            // Desafios especiais
            this.createChallenge('earth_day_special', {
                name: 'Especial Dia da Terra',
                description: 'Complete 5 ações sustentáveis no Dia da Terra',
                type: 'special',
                category: 'community',
                difficulty: 'medium',
                points: 300,
                duration: 86400000,
                isLimited: true,
                startDate: new Date('2024-04-22').getTime(),
                endDate: new Date('2024-04-22').getTime() + 86400000,
                requirements: {
                    type: 'multiple_actions',
                    actions: ['plant_tree', 'reduce_energy', 'recycle', 'use_public_transport', 'educate_others'],
                    target: 5
                },
                rewards: {
                    points: { sustainability: 300, community: 100 },
                    badges: ['earth_day_champion'],
                    unlocks: ['special_earth_day_content']
                }
            });
            
            this.logger.success(`${this.challenges.size} desafios configurados`);
            
        } catch (error) {
            this.logger.error('Erro ao configurar desafios:', error);
        }
    }

    createChallenge(id, config) {
        const challenge = {
            id,
            ...config,
            participants: [],
            completions: [],
            createdAt: Date.now(),
            isActive: true
        };
        
        this.challenges.set(id, challenge);
        return challenge;
    }

    async setupRewards() {
        try {
            this.logger.info('Configurando sistema de recompensas...');
            
            // Recompensas de pontos
            this.createReward('points_100', {
                name: '100 Pontos Bônus',
                description: 'Receba 100 pontos de sustentabilidade',
                type: 'points',
                category: 'bonus',
                cost: 0,
                value: { sustainability: 100 },
                rarity: 'common',
                isRedeemable: false
            });
            
            // Recompensas de desbloqueios
            this.createReward('advanced_analytics', {
                name: 'Análises Avançadas',
                description: 'Desbloqueie relatórios e análises avançadas',
                type: 'unlock',
                category: 'feature',
                cost: 1000,
                value: 'advanced_analytics',
                rarity: 'rare',
                isRedeemable: true
            });
            
            this.createReward('custom_dashboard', {
                name: 'Dashboard Personalizado',
                description: 'Personalize completamente seu dashboard',
                type: 'unlock',
                category: 'feature',
                cost: 1500,
                value: 'custom_dashboard',
                rarity: 'epic',
                isRedeemable: true
            });
            
            // Recompensas físicas (simuladas)
            this.createReward('eco_tshirt', {
                name: 'Camiseta Ecológica RegenTech',
                description: 'Camiseta feita com materiais 100% sustentáveis',
                type: 'physical',
                category: 'merchandise',
                cost: 2500,
                value: 'eco_tshirt',
                rarity: 'rare',
                isRedeemable: true,
                stock: 100
            });
            
            this.createReward('solar_charger', {
                name: 'Carregador Solar Portátil',
                description: 'Carregador solar para dispositivos móveis',
                type: 'physical',
                category: 'tech',
                cost: 5000,
                value: 'solar_charger',
                rarity: 'epic',
                isRedeemable: true,
                stock: 50
            });
            
            // Recompensas de experiência
            this.createReward('sustainability_course', {
                name: 'Curso de Sustentabilidade',
                description: 'Acesso a curso online de sustentabilidade avançada',
                type: 'experience',
                category: 'education',
                cost: 3000,
                value: 'sustainability_course_access',
                rarity: 'rare',
                isRedeemable: true
            });
            
            this.createReward('expert_consultation', {
                name: 'Consultoria com Especialista',
                description: 'Sessão de 1 hora com especialista em sustentabilidade',
                type: 'experience',
                category: 'consultation',
                cost: 7500,
                value: 'expert_consultation_1h',
                rarity: 'legendary',
                isRedeemable: true,
                stock: 20
            });
            
            // Recompensas de comunidade
            this.createReward('community_badge', {
                name: 'Badge Especial da Comunidade',
                description: 'Badge exclusivo para membros ativos da comunidade',
                type: 'badge',
                category: 'community',
                cost: 1000,
                value: 'community_special_badge',
                rarity: 'uncommon',
                isRedeemable: true
            });
            
            this.logger.success(`${this.rewards.size} recompensas configuradas`);
            
        } catch (error) {
            this.logger.error('Erro ao configurar recompensas:', error);
        }
    }

    createReward(id, config) {
        const reward = {
            id,
            ...config,
            redeemedBy: [],
            createdAt: Date.now(),
            isActive: true
        };
        
        this.rewards.set(id, reward);
        return reward;
    }

    async setupLeaderboards() {
        try {
            this.logger.info('Configurando leaderboards...');
            
            // Inicializar leaderboards vazios
            this.leaderboards = {
                global: {
                    name: 'Ranking Global',
                    description: 'Os usuários com mais pontos de sustentabilidade',
                    type: 'points',
                    metric: 'total_sustainability_points',
                    period: 'all_time',
                    users: []
                },
                monthly: {
                    name: 'Ranking Mensal',
                    description: 'Os usuários com mais pontos este mês',
                    type: 'points',
                    metric: 'monthly_sustainability_points',
                    period: 'current_month',
                    users: []
                },
                weekly: {
                    name: 'Ranking Semanal',
                    description: 'Os usuários com mais pontos esta semana',
                    type: 'points',
                    metric: 'weekly_sustainability_points',
                    period: 'current_week',
                    users: []
                },
                energy: {
                    name: 'Economia de Energia',
                    description: 'Maiores economizadores de energia',
                    type: 'metric',
                    metric: 'energy_saved',
                    period: 'all_time',
                    users: []
                },
                carbon: {
                    name: 'Redução de Carbono',
                    description: 'Maiores redutores de pegada de carbono',
                    type: 'metric',
                    metric: 'carbon_reduced',
                    period: 'all_time',
                    users: []
                },
                challenges: {
                    name: 'Mestre dos Desafios',
                    description: 'Usuários que completaram mais desafios',
                    type: 'count',
                    metric: 'challenges_completed',
                    period: 'all_time',
                    users: []
                }
            };
            
            this.logger.success('Leaderboards configurados');
            
        } catch (error) {
            this.logger.error('Erro ao configurar leaderboards:', error);
        }
    }

    // Métodos de usuário
    async createUserProfile(userId, userData = {}) {
        try {
            const profile = {
                userId,
                displayName: userData.displayName || `Usuário ${userId}`,
                avatar: userData.avatar || '👤',
                joinDate: Date.now(),
                
                // Sistema de pontos
                points: {
                    sustainability: 0,
                    energy: 0,
                    water: 0,
                    carbon: 0,
                    community: 0,
                    innovation: 0,
                    total: 0
                },
                
                // Sistema de níveis
                level: 0,
                experience: 0,
                nextLevelThreshold: this.levelSystem.thresholds[1],
                title: this.levelSystem.titles[0],
                
                // Conquistas e badges
                achievements: [],
                badges: ['newcomer'], // Badge inicial
                
                // Desafios
                activeChallenges: [],
                completedChallenges: [],
                challengeStreak: 0,
                
                // Estatísticas
                stats: {
                    loginStreak: 0,
                    totalLogins: 0,
                    lastLogin: Date.now(),
                    energySaved: 0,
                    waterSaved: 0,
                    carbonReduced: 0,
                    wasteReduced: 0,
                    challengesCompleted: 0,
                    achievementsUnlocked: 0,
                    communityContributions: 0,
                    innovationsImplemented: 0
                },
                
                // Preferências
                preferences: {
                    notifications: true,
                    publicProfile: true,
                    showInLeaderboards: true,
                    challengeReminders: true,
                    weeklyReports: true
                },
                
                // Histórico
                pointsHistory: [],
                activityHistory: [],
                rewardHistory: []
            };
            
            this.userProfiles.set(userId, profile);
            
            // Dar badge de boas-vindas
            await this.awardBadge(userId, 'newcomer');
            
            this.logger.info(`Perfil criado para usuário ${userId}`);
            return profile;
            
        } catch (error) {
            this.logger.error(`Erro ao criar perfil do usuário ${userId}:`, error);
            throw error;
        }
    }

    getUserProfile(userId) {
        return this.userProfiles.get(userId) || null;
    }

    async updateUserProfile(userId, updates) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) {
                throw new Error(`Perfil do usuário ${userId} não encontrado`);
            }
            
            Object.assign(profile, updates);
            profile.lastUpdated = Date.now();
            
            this.userProfiles.set(userId, profile);
            
            this.logger.debug(`Perfil do usuário ${userId} atualizado`);
            return profile;
            
        } catch (error) {
            this.logger.error(`Erro ao atualizar perfil do usuário ${userId}:`, error);
            throw error;
        }
    }

    // Sistema de pontos
    async awardPoints(userId, pointType, amount, reason = '') {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) {
                await this.createUserProfile(userId);
                return this.awardPoints(userId, pointType, amount, reason);
            }
            
            const pointConfig = this.pointTypes[pointType];
            if (!pointConfig) {
                throw new Error(`Tipo de ponto inválido: ${pointType}`);
            }
            
            const finalAmount = Math.round(amount * pointConfig.multiplier * this.config.pointsMultiplier);
            
            // Adicionar pontos
            profile.points[pointType] += finalAmount;
            profile.points.total += finalAmount;
            profile.experience += finalAmount;
            
            // Registrar no histórico
            profile.pointsHistory.push({
                type: pointType,
                amount: finalAmount,
                reason,
                timestamp: Date.now()
            });
            
            // Verificar se subiu de nível
            await this.checkLevelUp(userId);
            
            // Atualizar leaderboards
            await this.updateLeaderboards(userId);
            
            // Emitir evento
            this.emitEvent('pointsAwarded', {
                userId,
                pointType,
                amount: finalAmount,
                reason,
                totalPoints: profile.points.total
            });
            
            this.logger.debug(`${finalAmount} pontos de ${pointType} concedidos ao usuário ${userId}`);
            
            return {
                pointsAwarded: finalAmount,
                totalPoints: profile.points.total,
                leveledUp: false // Será atualizado por checkLevelUp se necessário
            };
            
        } catch (error) {
            this.logger.error(`Erro ao conceder pontos ao usuário ${userId}:`, error);
            throw error;
        }
    }

    async checkLevelUp(userId) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) return false;
            
            const currentLevel = profile.level;
            let newLevel = currentLevel;
            
            // Verificar qual nível o usuário deveria estar
            for (let i = 0; i < this.levelSystem.thresholds.length; i++) {
                if (profile.experience >= this.levelSystem.thresholds[i]) {
                    newLevel = i;
                } else {
                    break;
                }
            }
            
            if (newLevel > currentLevel) {
                // Usuário subiu de nível!
                profile.level = newLevel;
                profile.title = this.levelSystem.titles[newLevel] || 'Mestre Supremo';
                profile.nextLevelThreshold = this.levelSystem.thresholds[newLevel + 1] || null;
                
                // Dar recompensas do nível
                const levelReward = this.levelSystem.rewards[newLevel];
                if (levelReward) {
                    await this.grantLevelReward(userId, levelReward);
                }
                
                // Emitir evento de level up
                this.emitEvent('levelUp', {
                    userId,
                    oldLevel: currentLevel,
                    newLevel,
                    title: profile.title,
                    reward: levelReward
                });
                
                // Criar notificação
                await this.createNotification(userId, {
                    type: 'level_up',
                    title: '🎉 Parabéns! Você subiu de nível!',
                    message: `Você alcançou o nível ${newLevel}: ${profile.title}`,
                    data: { level: newLevel, title: profile.title }
                });
                
                this.logger.info(`Usuário ${userId} subiu para o nível ${newLevel}: ${profile.title}`);
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            this.logger.error(`Erro ao verificar level up do usuário ${userId}:`, error);
            return false;
        }
    }

    async grantLevelReward(userId, reward) {
        try {
            switch (reward.type) {
                case 'badge':
                    await this.awardBadge(userId, reward.id);
                    break;
                    
                case 'points':
                    await this.awardPoints(userId, 'sustainability', reward.amount, 'Recompensa de nível');
                    break;
                    
                case 'unlock':
                    await this.unlockFeature(userId, reward.feature);
                    break;
                    
                default:
                    this.logger.warn(`Tipo de recompensa desconhecido: ${reward.type}`);
            }
            
        } catch (error) {
            this.logger.error(`Erro ao conceder recompensa de nível:`, error);
        }
    }

    async awardBadge(userId, badgeId) {
        try {
            const profile = this.getUserProfile(userId);
            const badge = this.badges.get(badgeId);
            
            if (!profile || !badge) {
                throw new Error('Perfil ou badge não encontrado');
            }
            
            if (profile.badges.includes(badgeId)) {
                return false; // Usuário já possui este badge
            }
            
            profile.badges.push(badgeId);
            badge.earnedBy.push(userId);
            
            // Emitir evento
            this.emitEvent('badgeAwarded', {
                userId,
                badgeId,
                badge
            });
            
            // Criar notificação
            await this.createNotification(userId, {
                type: 'badge_awarded',
                title: '🏆 Novo Badge Conquistado!',
                message: `Você ganhou o badge: ${badge.name}`,
                data: { badgeId, badge }
            });
            
            this.logger.info(`Badge ${badgeId} concedido ao usuário ${userId}`);
            
            return true;
            
        } catch (error) {
            this.logger.error(`Erro ao conceder badge ${badgeId} ao usuário ${userId}:`, error);
            throw error;
        }
    }

    async unlockFeature(userId, featureId) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) {
                throw new Error('Perfil não encontrado');
            }
            
            if (!profile.unlockedFeatures) {
                profile.unlockedFeatures = [];
            }
            
            if (profile.unlockedFeatures.includes(featureId)) {
                return false; // Feature já desbloqueada
            }
            
            profile.unlockedFeatures.push(featureId);
            
            // Emitir evento
            this.emitEvent('featureUnlocked', {
                userId,
                featureId
            });
            
            // Criar notificação
            await this.createNotification(userId, {
                type: 'feature_unlocked',
                title: '🔓 Nova Funcionalidade Desbloqueada!',
                message: `Você desbloqueou: ${this.getFeatureName(featureId)}`,
                data: { featureId }
            });
            
            this.logger.info(`Feature ${featureId} desbloqueada para usuário ${userId}`);
            
            return true;
            
        } catch (error) {
            this.logger.error(`Erro ao desbloquear feature ${featureId} para usuário ${userId}:`, error);
            throw error;
        }
    }

    getFeatureName(featureId) {
        const featureNames = {
            'advanced_metrics': 'Métricas Avançadas',
            'custom_challenges': 'Desafios Personalizados',
            'community_features': 'Recursos da Comunidade',
            'premium_analytics': 'Análises Premium',
            'mentor_program': 'Programa de Mentoria',
            'advanced_analytics': 'Análises Avançadas',
            'custom_dashboard': 'Dashboard Personalizado'
        };
        
        return featureNames[featureId] || featureId;
    }

    // Sistema de conquistas
    async checkAchievements(userId, action, data = {}) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) return [];
            
            const newAchievements = [];
            
            for (const [achievementId, achievement] of this.achievements) {
                // Pular se já conquistado
                if (profile.achievements.includes(achievementId)) continue;
                
                // Verificar se os requisitos foram atendidos
                if (await this.checkAchievementRequirements(userId, achievement, action, data)) {
                    await this.awardAchievement(userId, achievementId);
                    newAchievements.push(achievement);
                }
            }
            
            return newAchievements;
            
        } catch (error) {
            this.logger.error(`Erro ao verificar conquistas do usuário ${userId}:`, error);
            return [];
        }
    }

    async checkAchievementRequirements(userId, achievement, action, data) {
        const profile = this.getUserProfile(userId);
        const requirements = achievement.requirements;
        
        switch (requirements.type) {
            case 'cumulative':
                const currentValue = profile.stats[requirements.metric] || 0;
                return currentValue >= requirements.target;
                
            case 'streak':
                const streakValue = profile.stats[requirements.metric] || 0;
                return streakValue >= requirements.target;
                
            case 'count':
                const countValue = profile.stats[requirements.metric] || 0;
                return countValue >= requirements.target;
                
            case 'action':
                return action === requirements.action;
                
            case 'percentage_reduction':
                // Lógica para verificar redução percentual
                return this.checkPercentageReduction(userId, requirements);
                
            case 'implementation':
                return action === requirements.action && data.implemented;
                
            case 'multiple_actions':
                return requirements.actions.includes(action);
                
            default:
                return false;
        }
    }

    checkPercentageReduction(userId, requirements) {
        // Implementar lógica de verificação de redução percentual
        // Por enquanto, simular com base em dados aleatórios
        return Math.random() > 0.7; // 30% de chance de ter atingido a meta
    }

    async awardAchievement(userId, achievementId) {
        try {
            const profile = this.getUserProfile(userId);
            const achievement = this.achievements.get(achievementId);
            
            if (!profile || !achievement) {
                throw new Error('Perfil ou conquista não encontrado');
            }
            
            profile.achievements.push(achievementId);
            profile.stats.achievementsUnlocked++;
            achievement.unlockedBy.push(userId);
            
            // Conceder pontos da conquista
            await this.awardPoints(userId, 'sustainability', achievement.points, `Conquista: ${achievement.name}`);
            
            // Emitir evento
            this.emitEvent('achievementUnlocked', {
                userId,
                achievementId,
                achievement
            });
            
            // Criar notificação
            await this.createNotification(userId, {
                type: 'achievement_unlocked',
                title: '🏆 Nova Conquista Desbloqueada!',
                message: `${achievement.name}: ${achievement.description}`,
                data: { achievementId, achievement }
            });
            
            this.logger.info(`Conquista ${achievementId} desbloqueada para usuário ${userId}`);
            
            return true;
            
        } catch (error) {
            this.logger.error(`Erro ao conceder conquista ${achievementId} ao usuário ${userId}:`, error);
            throw error;
        }
    }

    // Sistema de desafios
    async joinChallenge(userId, challengeId) {
        try {
            const profile = this.getUserProfile(userId);
            const challenge = this.challenges.get(challengeId);
            
            if (!profile || !challenge) {
                throw new Error('Perfil ou desafio não encontrado');
            }
            
            // Verificar se já está participando
            if (profile.activeChallenges.some(c => c.challengeId === challengeId)) {
                return false;
            }
            
            // Verificar se o desafio está ativo
            if (!challenge.isActive) {
                throw new Error('Desafio não está ativo');
            }
            
            // Verificar limitações de data (para desafios especiais)
            if (challenge.isLimited) {
                const now = Date.now();
                if (now < challenge.startDate || now > challenge.endDate) {
                    throw new Error('Desafio fora do período válido');
                }
            }
            
            // Adicionar usuário ao desafio
            const participation = {
                challengeId,
                startDate: Date.now(),
                endDate: Date.now() + challenge.duration,
                progress: 0,
                completed: false,
                data: {}
            };
            
            profile.activeChallenges.push(participation);
            challenge.participants.push(userId);
            
            // Emitir evento
            this.emitEvent('challengeJoined', {
                userId,
                challengeId,
                challenge
            });
            
            this.logger.info(`Usuário ${userId} entrou no desafio ${challengeId}`);
            
            return true;
            
        } catch (error) {
            this.logger.error(`Erro ao entrar no desafio ${challengeId}:`, error);
            throw error;
        }
    }

    async updateChallengeProgress(userId, challengeId, progress, data = {}) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) {
                throw new Error('Perfil não encontrado');
            }
            
            const participation = profile.activeChallenges.find(c => c.challengeId === challengeId);
            if (!participation) {
                throw new Error('Usuário não está participando deste desafio');
            }
            
            participation.progress = progress;
            participation.data = { ...participation.data, ...data };
            participation.lastUpdate = Date.now();
            
            // Verificar se completou o desafio
            if (progress >= 100 && !participation.completed) {
                await this.completeChallenge(userId, challengeId);
            }
            
            this.logger.debug(`Progresso do desafio ${challengeId} atualizado para ${progress}% (usuário ${userId})`);
            
            return participation;
            
        } catch (error) {
            this.logger.error(`Erro ao atualizar progresso do desafio:`, error);
            throw error;
        }
    }

    async completeChallenge(userId, challengeId) {
        try {
            const profile = this.getUserProfile(userId);
            const challenge = this.challenges.get(challengeId);
            
            if (!profile || !challenge) {
                throw new Error('Perfil ou desafio não encontrado');
            }
            
            // Encontrar participação ativa
            const participationIndex = profile.activeChallenges.findIndex(c => c.challengeId === challengeId);
            if (participationIndex === -1) {
                throw new Error('Participação no desafio não encontrada');
            }
            
            const participation = profile.activeChallenges[participationIndex];
            participation.completed = true;
            participation.completedAt = Date.now();
            
            // Mover para desafios completados
            profile.completedChallenges.push(participation);
            profile.activeChallenges.splice(participationIndex, 1);
            
            // Atualizar estatísticas
            profile.stats.challengesCompleted++;
            profile.challengeStreak++;
            
            // Adicionar à lista de completados do desafio
            challenge.completions.push({
                userId,
                completedAt: Date.now(),
                duration: Date.now() - participation.startDate
            });
            
            // Conceder recompensas
            await this.grantChallengeRewards(userId, challenge);
            
            // Verificar conquistas
            await this.checkAchievements(userId, 'challenge_completed', { challengeId });
            
            // Emitir evento
            this.emitEvent('challengeCompleted', {
                userId,
                challengeId,
                challenge,
                participation
            });
            
            // Criar notificação
            await this.createNotification(userId, {
                type: 'challenge_completed',
                title: '🎯 Desafio Completado!',
                message: `Parabéns! Você completou: ${challenge.name}`,
                data: { challengeId, challenge }
            });
            
            this.logger.info(`Usuário ${userId} completou o desafio ${challengeId}`);
            
            return true;
            
        } catch (error) {
            this.logger.error(`Erro ao completar desafio ${challengeId}:`, error);
            throw error;
        }
    }

    async grantChallengeRewards(userId, challenge) {
        try {
            const rewards = challenge.rewards;
            
            // Conceder pontos
            if (rewards.points) {
                for (const [pointType, amount] of Object.entries(rewards.points)) {
                    await this.awardPoints(userId, pointType, amount, `Desafio: ${challenge.name}`);
                }
            }
            
            // Conceder badges
            if (rewards.badges && rewards.badges.length > 0) {
                for (const badgeId of rewards.badges) {
                    await this.awardBadge(userId, badgeId);
                }
            }
            
            // Desbloquear recursos
            if (rewards.unlocks && rewards.unlocks.length > 0) {
                for (const featureId of rewards.unlocks) {
                    await this.unlockFeature(userId, featureId);
                }
            }
            
        } catch (error) {
            this.logger.error('Erro ao conceder recompensas do desafio:', error);
        }
    }

    // Sistema de leaderboards
    async updateLeaderboards(userId) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) return;
            
            // Atualizar cada leaderboard
            for (const [leaderboardId, leaderboard] of Object.entries(this.leaderboards)) {
                await this.updateLeaderboard(leaderboardId, userId, profile);
            }
            
        } catch (error) {
            this.logger.error('Erro ao atualizar leaderboards:', error);
        }
    }

    async updateLeaderboard(leaderboardId, userId, profile) {
        try {
            const leaderboard = this.leaderboards[leaderboardId];
            if (!leaderboard) return;
            
            // Obter valor da métrica
            let value = 0;
            switch (leaderboard.metric) {
                case 'total_sustainability_points':
                    value = profile.points.sustainability;
                    break;
                case 'monthly_sustainability_points':
                    value = this.getMonthlyPoints(profile, 'sustainability');
                    break;
                case 'weekly_sustainability_points':
                    value = this.getWeeklyPoints(profile, 'sustainability');
                    break;
                case 'energy_saved':
                    value = profile.stats.energySaved;
                    break;
                case 'carbon_reduced':
                    value = profile.stats.carbonReduced;
                    break;
                case 'challenges_completed':
                    value = profile.stats.challengesCompleted;
                    break;
                default:
                    return;
            }
            
            // Verificar se o usuário quer aparecer nos leaderboards
            if (!profile.preferences.showInLeaderboards) {
                return;
            }
            
            // Encontrar ou criar entrada do usuário
            let userEntry = leaderboard.users.find(u => u.userId === userId);
            
            if (userEntry) {
                userEntry.value = value;
                userEntry.lastUpdate = Date.now();
            } else {
                userEntry = {
                    userId,
                    displayName: profile.displayName,
                    avatar: profile.avatar,
                    value,
                    lastUpdate: Date.now()
                };
                leaderboard.users.push(userEntry);
            }
            
            // Ordenar leaderboard
            leaderboard.users.sort((a, b) => b.value - a.value);
            
            // Manter apenas top 100
            if (leaderboard.users.length > 100) {
                leaderboard.users = leaderboard.users.slice(0, 100);
            }
            
            // Atualizar posições
            leaderboard.users.forEach((user, index) => {
                user.position = index + 1;
            });
            
            leaderboard.lastUpdate = Date.now();
            
        } catch (error) {
            this.logger.error(`Erro ao atualizar leaderboard ${leaderboardId}:`, error);
        }
    }

    getMonthlyPoints(profile, pointType) {
        const now = Date.now();
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        
        return profile.pointsHistory
            .filter(p => p.type === pointType && p.timestamp >= monthStart)
            .reduce((sum, p) => sum + p.amount, 0);
    }

    getWeeklyPoints(profile, pointType) {
        const now = Date.now();
        const weekStart = now - (7 * 24 * 60 * 60 * 1000); // 7 dias atrás
        
        return profile.pointsHistory
            .filter(p => p.type === pointType && p.timestamp >= weekStart)
            .reduce((sum, p) => sum + p.amount, 0);
    }

    getUserLeaderboardPosition(userId, leaderboardId) {
        const leaderboard = this.leaderboards[leaderboardId];
        if (!leaderboard) return null;
        
        const userEntry = leaderboard.users.find(u => u.userId === userId);
        return userEntry ? userEntry.position : null;
    }

    getLeaderboard(leaderboardId, limit = 10) {
        const leaderboard = this.leaderboards[leaderboardId];
        if (!leaderboard) return null;
        
        return {
            ...leaderboard,
            users: leaderboard.users.slice(0, limit)
        };
    }

    // Sistema de notificações
    async createNotification(userId, notification) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile || !profile.preferences.notifications) {
                return false;
            }
            
            const notificationData = {
                id: this.generateId(),
                userId,
                ...notification,
                timestamp: Date.now(),
                read: false
            };
            
            if (!profile.notifications) {
                profile.notifications = [];
            }
            
            profile.notifications.unshift(notificationData);
            
            // Manter apenas as últimas 50 notificações
            if (profile.notifications.length > 50) {
                profile.notifications = profile.notifications.slice(0, 50);
            }
            
            // Emitir evento para UI
            this.emitEvent('notificationCreated', {
                userId,
                notification: notificationData
            });
            
            return notificationData;
            
        } catch (error) {
            this.logger.error('Erro ao criar notificação:', error);
            return null;
        }
    }

    // Eventos automáticos
    startAutomaticEvents() {
        // Verificar login diário
        this.dailyLoginInterval = setInterval(() => {
            this.checkDailyLogins();
        }, 60000); // Verificar a cada minuto
        
        // Atualizar desafios
        this.challengeUpdateInterval = setInterval(() => {
            this.updateActiveChallenges();
        }, 300000); // Verificar a cada 5 minutos
        
        // Limpar dados antigos
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldData();
        }, 3600000); // Limpar a cada hora
    }

    async checkDailyLogins() {
        const now = Date.now();
        const today = new Date().toDateString();
        
        for (const [userId, profile] of this.userProfiles) {
            const lastLoginDate = new Date(profile.stats.lastLogin).toDateString();
            
            if (lastLoginDate === today) {
                // Usuário já fez login hoje
                continue;
            }
            
            // Verificar se perdeu a sequência
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastLoginDate !== yesterday) {
                profile.stats.loginStreak = 0;
            }
        }
    }

    async updateActiveChallenges() {
        const now = Date.now();
        
        for (const [userId, profile] of this.userProfiles) {
            // Verificar desafios expirados
            profile.activeChallenges = profile.activeChallenges.filter(challenge => {
                if (now > challenge.endDate) {
                    // Desafio expirou
                    this.emitEvent('challengeExpired', {
                        userId,
                        challengeId: challenge.challengeId
                    });
                    return false;
                }
                return true;
            });
        }
    }

    cleanupOldData() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        for (const [userId, profile] of this.userProfiles) {
            // Limpar histórico de pontos antigo
            profile.pointsHistory = profile.pointsHistory.filter(
                p => p.timestamp > thirtyDaysAgo
            );
            
            // Limpar histórico de atividades antigo
            if (profile.activityHistory) {
                profile.activityHistory = profile.activityHistory.filter(
                    a => a.timestamp > thirtyDaysAgo
                );
            }
        }
    }

    // Métodos de dados
    async loadUserData() {
        try {
            // Simular carregamento de dados do usuário
            // Em uma implementação real, isso viria de um banco de dados
            this.logger.info('Dados dos usuários carregados');
            
        } catch (error) {
            this.logger.error('Erro ao carregar dados dos usuários:', error);
        }
    }

    async saveUserData(userId) {
        try {
            const profile = this.getUserProfile(userId);
            if (!profile) return false;
            
            // Simular salvamento no banco de dados
            this.logger.debug(`Dados do usuário ${userId} salvos`);
            
            return true;
            
        } catch (error) {
            this.logger.error(`Erro ao salvar dados do usuário ${userId}:`, error);
            return false;
        }
    }

    // Métodos de relatórios
    generateUserReport(userId) {
        const profile = this.getUserProfile(userId);
        if (!profile) return null;
        
        return {
            userId,
            displayName: profile.displayName,
            level: profile.level,
            title: profile.title,
            totalPoints: profile.points.total,
            pointsBreakdown: profile.points,
            achievements: profile.achievements.length,
            badges: profile.badges.length,
            challengesCompleted: profile.stats.challengesCompleted,
            loginStreak: profile.stats.loginStreak,
            joinDate: profile.joinDate,
            lastActivity: profile.stats.lastLogin,
            leaderboardPositions: this.getUserLeaderboardPositions(userId)
        };
    }

    getUserLeaderboardPositions(userId) {
        const positions = {};
        
        for (const [leaderboardId] of Object.entries(this.leaderboards)) {
            positions[leaderboardId] = this.getUserLeaderboardPosition(userId, leaderboardId);
        }
        
        return positions;
    }

    getSystemStats() {
        return {
            totalUsers: this.userProfiles.size,
            totalAchievements: this.achievements.size,
            totalBadges: this.badges.size,
            totalChallenges: this.challenges.size,
            totalRewards: this.rewards.size,
            activeUsers: Array.from(this.userProfiles.values())
                .filter(p => Date.now() - p.stats.lastLogin < 86400000).length,
            totalPointsAwarded: Array.from(this.userProfiles.values())
                .reduce((sum, p) => sum + p.points.total, 0)
        };
    }

    // Métodos de utilidade
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    emitEvent(eventName, data) {
        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                this.logger.error(`Erro ao executar listener do evento ${eventName}:`, error);
            }
        });
    }

    addEventListener(eventName, listener) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(listener);
    }

    removeEventListener(eventName, listener) {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Métodos de renderização
    renderGamificationDashboard() {
        return `
            <div class="gamification-dashboard">
                <div class="dashboard-header">
                    <h2>🎮 Sistema de Gamificação</h2>
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <span class="stat-value">${this.userProfiles.size}</span>
                            <span class="stat-label">Usuários Ativos</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">${this.achievements.size}</span>
                            <span class="stat-label">Conquistas</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">${this.challenges.size}</span>
                            <span class="stat-label">Desafios</span>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <div class="dashboard-section">
                        <h3>🏆 Leaderboards</h3>
                        <div class="leaderboards-grid">
                            ${this.renderLeaderboards()}
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>🎯 Desafios Ativos</h3>
                        <div class="challenges-grid">
                            ${this.renderActiveChallenges()}
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>🏅 Conquistas Recentes</h3>
                        <div class="achievements-list">
                            ${this.renderRecentAchievements()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLeaderboards() {
        return Object.entries(this.leaderboards)
            .map(([id, leaderboard]) => `
                <div class="leaderboard-card">
                    <h4>${leaderboard.name}</h4>
                    <div class="leaderboard-list">
                        ${leaderboard.users.slice(0, 5).map((user, index) => `
                            <div class="leaderboard-item">
                                <span class="position">#${index + 1}</span>
                                <span class="user">${user.avatar} ${user.displayName}</span>
                                <span class="value">${user.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
    }

    renderActiveChallenges() {
        const activeChallenges = Array.from(this.challenges.values())
            .filter(c => c.isActive)
            .slice(0, 6);
            
        return activeChallenges.map(challenge => `
            <div class="challenge-card" data-challenge-id="${challenge.id}">
                <div class="challenge-header">
                    <h4>${challenge.name}</h4>
                    <span class="challenge-difficulty ${challenge.difficulty}">${challenge.difficulty}</span>
                </div>
                <p class="challenge-description">${challenge.description}</p>
                <div class="challenge-footer">
                    <span class="challenge-points">💎 ${challenge.points} pontos</span>
                    <span class="challenge-participants">👥 ${challenge.participants.length}</span>
                </div>
            </div>
        `).join('');
    }

    renderRecentAchievements() {
        const recentAchievements = [];
        
        // Coletar conquistas recentes de todos os usuários
        for (const [userId, profile] of this.userProfiles) {
            profile.achievements.forEach(achievementId => {
                const achievement = this.achievements.get(achievementId);
                if (achievement) {
                    recentAchievements.push({
                        userId,
                        displayName: profile.displayName,
                        avatar: profile.avatar,
                        achievement,
                        timestamp: Date.now() // Simplificado
                    });
                }
            });
        }
        
        return recentAchievements
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(item => `
                <div class="achievement-item">
                    <span class="user">${item.avatar} ${item.displayName}</span>
                    <span class="achievement">${item.achievement.icon} ${item.achievement.name}</span>
                    <span class="time">${this.formatTimeAgo(item.timestamp)}</span>
                </div>
            `).join('');
    }

    formatTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d atrás`;
        if (hours > 0) return `${hours}h atrás`;
        if (minutes > 0) return `${minutes}m atrás`;
        return 'Agora';
    }

    // Cleanup
    cleanup() {
        if (this.dailyLoginInterval) {
            clearInterval(this.dailyLoginInterval);
        }
        if (this.challengeUpdateInterval) {
            clearInterval(this.challengeUpdateInterval);
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.eventListeners.clear();
        this.logger.info('Sistema de Gamificação finalizado');
    }
}

// Instância global
window.gamificationSystem = null;

// Inicialização automática
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            window.gamificationSystem = new GamificationSystem();
            await window.gamificationSystem.initialize();
            console.log('✅ Sistema de Gamificação inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema de Gamificação:', error);
        }
    });
}

export default GamificationSystem;