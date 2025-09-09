/**
 * Sistema de Marketplace de Soluções Regenerativas
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { Logger } from '../../utils/Logger.js';
import { ConfigManager } from '../../config/ConfigManager.js';

export class MarketplaceSystem {
    constructor(config = {}) {
        this.config = {
            enableTransactions: config.enableTransactions !== false,
            enableRatings: config.enableRatings !== false,
            enableRecommendations: config.enableRecommendations !== false,
            enableAnalytics: config.enableAnalytics !== false,
            maxProductsPerPage: config.maxProductsPerPage || 20,
            currency: config.currency || 'BRL',
            ...config
        };
        
        this.logger = new Logger('MarketplaceSystem');
        this.configManager = new ConfigManager();
        this.isInitialized = false;
        
        // Estado do marketplace
        this.products = new Map();
        this.categories = new Map();
        this.vendors = new Map();
        this.transactions = new Map();
        this.reviews = new Map();
        this.cart = new Map();
        this.wishlist = new Set();
        
        // Filtros e busca
        this.currentFilters = {
            category: null,
            priceRange: { min: 0, max: 10000 },
            rating: 0,
            availability: 'all',
            sustainability: 'all',
            location: null
        };
        
        this.searchQuery = '';
        this.sortBy = 'relevance';
        this.currentPage = 1;
        
        // Analytics
        this.analytics = {
            totalProducts: 0,
            totalVendors: 0,
            totalTransactions: 0,
            totalRevenue: 0,
            avgRating: 0,
            topCategories: [],
            recentActivity: []
        };
        
        this.initializeSystem();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Sistema de Marketplace...');
            
            // Carregar configurações
            await this.loadConfiguration();
            
            // Inicializar categorias
            await this.initializeCategories();
            
            // Carregar fornecedores
            await this.loadVendors();
            
            // Carregar produtos
            await this.loadProducts();
            
            // Configurar sistema de avaliações
            if (this.config.enableRatings) {
                await this.setupRatingSystem();
            }
            
            // Configurar recomendações
            if (this.config.enableRecommendations) {
                await this.setupRecommendationEngine();
            }
            
            // Configurar analytics
            if (this.config.enableAnalytics) {
                await this.setupAnalytics();
            }
            
            this.isInitialized = true;
            this.logger.success('Sistema de Marketplace inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Sistema de Marketplace:', error);
            throw error;
        }
    }

    initializeSystem() {
        // Categorias de produtos regenerativos
        this.categoryTypes = {
            agriculture: {
                name: 'Agricultura Regenerativa',
                icon: '🌱',
                description: 'Sementes, fertilizantes orgânicos, equipamentos sustentáveis',
                color: '#4CAF50'
            },
            energy: {
                name: 'Energia Renovável',
                icon: '⚡',
                description: 'Painéis solares, turbinas eólicas, baterias',
                color: '#FF9800'
            },
            water: {
                name: 'Gestão de Água',
                icon: '💧',
                description: 'Sistemas de captação, purificação, irrigação',
                color: '#2196F3'
            },
            waste: {
                name: 'Gestão de Resíduos',
                icon: '♻️',
                description: 'Compostagem, reciclagem, biodigestores',
                color: '#8BC34A'
            },
            construction: {
                name: 'Construção Sustentável',
                icon: '🏗️',
                description: 'Materiais ecológicos, técnicas bioconstrução',
                color: '#795548
            },
            technology: {
                name: 'Tecnologia Verde',
                icon: '💻',
                description: 'IoT, sensores, software de monitoramento',
                color: '#607D8B'
            },
            education: {
                name: 'Educação e Consultoria',
                icon: '📚',
                description: 'Cursos, workshops, consultoria especializada',
                color: '#9C27B0'
            },
            certification: {
                name: 'Certificação',
                icon: '🏆',
                description: 'Auditorias, certificações, validações',
                color: '#FF5722'
            }
        };
        
        // Status de produtos
        this.productStatus = {
            available: { name: 'Disponível', color: '#4CAF50', icon: '✅' },
            limited: { name: 'Estoque Limitado', color: '#FF9800', icon: '⚠️' },
            preorder: { name: 'Pré-venda', color: '#2196F3', icon: '📅' },
            outofstock: { name: 'Esgotado', color: '#F44336', icon: '❌' },
            discontinued: { name: 'Descontinuado', color: '#9E9E9E', icon: '🚫' }
        };
        
        // Níveis de sustentabilidade
        this.sustainabilityLevels = {
            bronze: { name: 'Bronze', color: '#CD7F32', icon: '🥉', score: 1 },
            silver: { name: 'Prata', color: '#C0C0C0', icon: '🥈', score: 2 },
            gold: { name: 'Ouro', color: '#FFD700', icon: '🥇', score: 3 },
            platinum: { name: 'Platina', color: '#E5E4E2', icon: '💎', score: 4 },
            regenerative: { name: 'Regenerativo+', color: '#4CAF50', icon: '🌟', score: 5 }
        };
    }

    async loadConfiguration() {
        try {
            const marketplaceConfig = await this.configManager.get('marketplace', {
                categories: [],
                vendors: [],
                products: [],
                settings: {}
            });
            
            this.config = { ...this.config, ...marketplaceConfig };
            this.logger.debug('Configurações do marketplace carregadas');
            
        } catch (error) {
            this.logger.error('Erro ao carregar configurações do marketplace:', error);
        }
    }

    async initializeCategories() {
        try {
            this.logger.info('Inicializando categorias...');
            
            // Criar categorias baseadas nos tipos definidos
            Object.entries(this.categoryTypes).forEach(([key, categoryData]) => {
                const category = {
                    id: key,
                    ...categoryData,
                    productCount: 0,
                    featured: false,
                    createdAt: Date.now()
                };
                
                this.categories.set(key, category);
            });
            
            this.logger.success(`${this.categories.size} categorias inicializadas`);
            
        } catch (error) {
            this.logger.error('Erro ao inicializar categorias:', error);
        }
    }

    async loadVendors() {
        try {
            this.logger.info('Carregando fornecedores...');
            
            // Fornecedores de demonstração
            const demoVendors = [
                {
                    id: 'vendor_001',
                    name: 'EcoSeeds Brasil',
                    description: 'Especialista em sementes orgânicas e crioulas',
                    category: 'agriculture',
                    location: { city: 'São Paulo', state: 'SP', country: 'Brasil' },
                    contact: {
                        email: 'contato@ecoseeds.com.br',
                        phone: '+55 11 9999-0001',
                        website: 'https://ecoseeds.com.br'
                    },
                    rating: 4.8,
                    totalReviews: 156,
                    totalProducts: 45,
                    totalSales: 1250,
                    joinedAt: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 ano atrás
                    verified: true,
                    sustainabilityLevel: 'gold',
                    certifications: ['Orgânico', 'Fair Trade', 'Rainforest Alliance']
                },
                {
                    id: 'vendor_002',
                    name: 'Solar Tech Solutions',
                    description: 'Soluções completas em energia solar',
                    category: 'energy',
                    location: { city: 'Curitiba', state: 'PR', country: 'Brasil' },
                    contact: {
                        email: 'vendas@solartech.com.br',
                        phone: '+55 41 9999-0002',
                        website: 'https://solartech.com.br'
                    },
                    rating: 4.9,
                    totalReviews: 89,
                    totalProducts: 28,
                    totalSales: 567,
                    joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000, // 6 meses atrás
                    verified: true,
                    sustainabilityLevel: 'platinum',
                    certifications: ['ISO 14001', 'INMETRO', 'ANEEL']
                },
                {
                    id: 'vendor_003',
                    name: 'AquaPura Sistemas',
                    description: 'Tecnologias para tratamento e reuso de água',
                    category: 'water',
                    location: { city: 'Belo Horizonte', state: 'MG', country: 'Brasil' },
                    contact: {
                        email: 'info@aquapura.com.br',
                        phone: '+55 31 9999-0003',
                        website: 'https://aquapura.com.br'
                    },
                    rating: 4.7,
                    totalReviews: 134,
                    totalProducts: 32,
                    totalSales: 892,
                    joinedAt: Date.now() - 270 * 24 * 60 * 60 * 1000, // 9 meses atrás
                    verified: true,
                    sustainabilityLevel: 'silver',
                    certifications: ['ISO 9001', 'ABNT', 'CETESB']
                },
                {
                    id: 'vendor_004',
                    name: 'RegenConsult',
                    description: 'Consultoria em agricultura regenerativa',
                    category: 'education',
                    location: { city: 'Brasília', state: 'DF', country: 'Brasil' },
                    contact: {
                        email: 'contato@regenconsult.com.br',
                        phone: '+55 61 9999-0004',
                        website: 'https://regenconsult.com.br'
                    },
                    rating: 4.9,
                    totalReviews: 67,
                    totalProducts: 15,
                    totalSales: 234,
                    joinedAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 3 meses atrás
                    verified: true,
                    sustainabilityLevel: 'regenerative',
                    certifications: ['CRA', 'CREA', 'Permacultura']
                }
            ];
            
            // Registrar fornecedores
            demoVendors.forEach(vendor => {
                this.vendors.set(vendor.id, vendor);
            });
            
            this.logger.success(`${demoVendors.length} fornecedores carregados`);
            
        } catch (error) {
            this.logger.error('Erro ao carregar fornecedores:', error);
        }
    }

    async loadProducts() {
        try {
            this.logger.info('Carregando produtos...');
            
            // Produtos de demonstração
            const demoProducts = [
                // Agricultura
                {
                    id: 'prod_001',
                    name: 'Sementes de Tomate Orgânico',
                    description: 'Variedade crioula de tomate, adaptada ao clima brasileiro. Produção orgânica certificada.',
                    category: 'agriculture',
                    vendorId: 'vendor_001',
                    price: 25.90,
                    originalPrice: 32.90,
                    currency: 'BRL',
                    images: ['🍅'],
                    status: 'available',
                    stock: 150,
                    minOrder: 1,
                    maxOrder: 50,
                    unit: 'pacote (20g)',
                    sustainabilityLevel: 'gold',
                    rating: 4.8,
                    totalReviews: 45,
                    totalSales: 234,
                    featured: true,
                    tags: ['orgânico', 'crioulo', 'não-transgênico'],
                    specifications: {
                        'Tipo': 'Tomate Cereja',
                        'Ciclo': '90-120 dias',
                        'Germinação': '85%',
                        'Validade': '2 anos'
                    },
                    shipping: {
                        weight: 0.02, // kg
                        dimensions: { length: 10, width: 8, height: 1 }, // cm
                        freeShipping: false,
                        estimatedDays: 5
                    }
                },
                {
                    id: 'prod_002',
                    name: 'Fertilizante Orgânico Compostado',
                    description: 'Fertilizante 100% orgânico produzido através de compostagem controlada.',
                    category: 'agriculture',
                    vendorId: 'vendor_001',
                    price: 45.00,
                    currency: 'BRL',
                    images: ['🌱'],
                    status: 'available',
                    stock: 80,
                    minOrder: 1,
                    maxOrder: 20,
                    unit: 'saco (5kg)',
                    sustainabilityLevel: 'regenerative',
                    rating: 4.9,
                    totalReviews: 67,
                    totalSales: 156,
                    featured: false,
                    tags: ['orgânico', 'compostado', 'NPK natural'],
                    specifications: {
                        'Composição': 'Matéria orgânica compostada',
                        'NPK': '4-2-3',
                        'pH': '6.5-7.0',
                        'Umidade': 'Máx. 40%'
                    }
                },
                
                // Energia
                {
                    id: 'prod_003',
                    name: 'Painel Solar Fotovoltaico 400W',
                    description: 'Painel solar monocristalino de alta eficiência, ideal para sistemas residenciais.',
                    category: 'energy',
                    vendorId: 'vendor_002',
                    price: 890.00,
                    originalPrice: 1200.00,
                    currency: 'BRL',
                    images: ['☀️'],
                    status: 'available',
                    stock: 25,
                    minOrder: 1,
                    maxOrder: 10,
                    unit: 'unidade',
                    sustainabilityLevel: 'platinum',
                    rating: 4.9,
                    totalReviews: 23,
                    totalSales: 89,
                    featured: true,
                    tags: ['monocristalino', 'alta eficiência', '25 anos garantia'],
                    specifications: {
                        'Potência': '400W',
                        'Eficiência': '21.2%',
                        'Tensão': '24V',
                        'Garantia': '25 anos'
                    }
                },
                {
                    id: 'prod_004',
                    name: 'Inversor Solar 3000W',
                    description: 'Inversor solar senoidal puro com MPPT, ideal para sistemas off-grid.',
                    category: 'energy',
                    vendorId: 'vendor_002',
                    price: 1250.00,
                    currency: 'BRL',
                    images: ['⚡'],
                    status: 'limited',
                    stock: 8,
                    minOrder: 1,
                    maxOrder: 3,
                    unit: 'unidade',
                    sustainabilityLevel: 'gold',
                    rating: 4.7,
                    totalReviews: 15,
                    totalSales: 34,
                    featured: false,
                    tags: ['MPPT', 'senoidal puro', 'off-grid']
                },
                
                // Água
                {
                    id: 'prod_005',
                    name: 'Sistema de Captação de Água da Chuva',
                    description: 'Kit completo para captação e armazenamento de água pluvial.',
                    category: 'water',
                    vendorId: 'vendor_003',
                    price: 2890.00,
                    currency: 'BRL',
                    images: ['🌧️'],
                    status: 'available',
                    stock: 12,
                    minOrder: 1,
                    maxOrder: 2,
                    unit: 'kit completo',
                    sustainabilityLevel: 'silver',
                    rating: 4.6,
                    totalReviews: 28,
                    totalSales: 67,
                    featured: true,
                    tags: ['captação', 'armazenamento', 'filtração'],
                    specifications: {
                        'Capacidade': '5000L',
                        'Material': 'Polietileno',
                        'Filtros': 'Inclusos',
                        'Instalação': 'Manual incluído'
                    }
                },
                
                // Educação
                {
                    id: 'prod_006',
                    name: 'Curso Online: Agricultura Regenerativa',
                    description: 'Curso completo sobre princípios e práticas da agricultura regenerativa.',
                    category: 'education',
                    vendorId: 'vendor_004',
                    price: 297.00,
                    currency: 'BRL',
                    images: ['📚'],
                    status: 'available',
                    stock: 999,
                    minOrder: 1,
                    maxOrder: 1,
                    unit: 'acesso vitalício',
                    sustainabilityLevel: 'regenerative',
                    rating: 4.9,
                    totalReviews: 89,
                    totalSales: 234,
                    featured: true,
                    tags: ['online', 'certificado', 'vitalício'],
                    specifications: {
                        'Duração': '40 horas',
                        'Módulos': '8 módulos',
                        'Certificado': 'Incluído',
                        'Suporte': '6 meses'
                    }
                },
                {
                    id: 'prod_007',
                    name: 'Consultoria em Transição Regenerativa',
                    description: 'Consultoria personalizada para transição de propriedades convencionais.',
                    category: 'education',
                    vendorId: 'vendor_004',
                    price: 1500.00,
                    currency: 'BRL',
                    images: ['👨‍🌾'],
                    status: 'available',
                    stock: 5,
                    minOrder: 1,
                    maxOrder: 1,
                    unit: 'pacote (20h)',
                    sustainabilityLevel: 'regenerative',
                    rating: 5.0,
                    totalReviews: 12,
                    totalSales: 23,
                    featured: false,
                    tags: ['personalizada', 'presencial', 'plano de ação']
                }
            ];
            
            // Registrar produtos
            demoProducts.forEach(product => {
                product.createdAt = Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000; // últimos 3 meses
                product.updatedAt = Date.now();
                this.products.set(product.id, product);
                
                // Atualizar contador da categoria
                const category = this.categories.get(product.category);
                if (category) {
                    category.productCount++;
                }
            });
            
            this.logger.success(`${demoProducts.length} produtos carregados`);
            
        } catch (error) {
            this.logger.error('Erro ao carregar produtos:', error);
        }
    }

    async setupRatingSystem() {
        try {
            this.logger.info('Configurando sistema de avaliações...');
            
            // Gerar algumas avaliações de demonstração
            const demoReviews = [
                {
                    id: 'review_001',
                    productId: 'prod_001',
                    userId: 'user_001',
                    userName: 'Maria Silva',
                    rating: 5,
                    title: 'Excelente qualidade!',
                    comment: 'Sementes de ótima qualidade, germinação perfeita. Recomendo!',
                    verified: true,
                    helpful: 12,
                    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000
                },
                {
                    id: 'review_002',
                    productId: 'prod_003',
                    userId: 'user_002',
                    userName: 'João Santos',
                    rating: 5,
                    title: 'Painel solar excelente',
                    comment: 'Instalei há 3 meses, funcionamento perfeito. Economia na conta de luz já é visível.',
                    verified: true,
                    helpful: 8,
                    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000
                }
            ];
            
            demoReviews.forEach(review => {
                this.reviews.set(review.id, review);
            });
            
            this.logger.success('Sistema de avaliações configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar sistema de avaliações:', error);
        }
    }

    async setupRecommendationEngine() {
        try {
            this.logger.info('Configurando engine de recomendações...');
            
            this.recommendationEngine = {
                algorithms: {
                    collaborative: { name: 'Filtragem Colaborativa', weight: 0.4 },
                    contentBased: { name: 'Baseado em Conteúdo', weight: 0.3 },
                    popularity: { name: 'Popularidade', weight: 0.2 },
                    sustainability: { name: 'Sustentabilidade', weight: 0.1 }
                },
                enabled: true,
                maxRecommendations: 10
            };
            
            this.logger.success('Engine de recomendações configurada');
            
        } catch (error) {
            this.logger.error('Erro ao configurar engine de recomendações:', error);
        }
    }

    async setupAnalytics() {
        try {
            this.logger.info('Configurando analytics...');
            
            // Calcular analytics iniciais
            this.updateAnalytics();
            
            this.logger.success('Analytics configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar analytics:', error);
        }
    }

    // Métodos de busca e filtros
    searchProducts(query = '', filters = {}) {
        try {
            this.searchQuery = query;
            this.currentFilters = { ...this.currentFilters, ...filters };
            
            let products = Array.from(this.products.values());
            
            // Aplicar busca por texto
            if (query) {
                const searchTerms = query.toLowerCase().split(' ');
                products = products.filter(product => {
                    const searchText = `${product.name} ${product.description} ${product.tags?.join(' ')}`.toLowerCase();
                    return searchTerms.every(term => searchText.includes(term));
                });
            }
            
            // Aplicar filtros
            products = this.applyFilters(products, this.currentFilters);
            
            // Aplicar ordenação
            products = this.sortProducts(products, this.sortBy);
            
            return {
                products,
                total: products.length,
                page: this.currentPage,
                totalPages: Math.ceil(products.length / this.config.maxProductsPerPage),
                filters: this.currentFilters,
                query: this.searchQuery
            };
            
        } catch (error) {
            this.logger.error('Erro na busca de produtos:', error);
            return { products: [], total: 0, page: 1, totalPages: 0 };
        }
    }

    applyFilters(products, filters) {
        return products.filter(product => {
            // Filtro por categoria
            if (filters.category && product.category !== filters.category) {
                return false;
            }
            
            // Filtro por faixa de preço
            if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
                return false;
            }
            
            // Filtro por avaliação
            if (product.rating < filters.rating) {
                return false;
            }
            
            // Filtro por disponibilidade
            if (filters.availability !== 'all') {
                if (filters.availability === 'instock' && product.stock <= 0) {
                    return false;
                }
                if (filters.availability === 'outofstock' && product.stock > 0) {
                    return false;
                }
            }
            
            // Filtro por sustentabilidade
            if (filters.sustainability !== 'all') {
                const sustainabilityScore = this.sustainabilityLevels[product.sustainabilityLevel]?.score || 0;
                const minScore = this.sustainabilityLevels[filters.sustainability]?.score || 0;
                if (sustainabilityScore < minScore) {
                    return false;
                }
            }
            
            return true;
        });
    }

    sortProducts(products, sortBy) {
        switch (sortBy) {
            case 'price_asc':
                return products.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return products.sort((a, b) => b.price - a.price);
            case 'rating':
                return products.sort((a, b) => b.rating - a.rating);
            case 'newest':
                return products.sort((a, b) => b.createdAt - a.createdAt);
            case 'bestseller':
                return products.sort((a, b) => b.totalSales - a.totalSales);
            case 'sustainability':
                return products.sort((a, b) => {
                    const scoreA = this.sustainabilityLevels[a.sustainabilityLevel]?.score || 0;
                    const scoreB = this.sustainabilityLevels[b.sustainabilityLevel]?.score || 0;
                    return scoreB - scoreA;
                });
            case 'relevance':
            default:
                return products.sort((a, b) => {
                    // Algoritmo simples de relevância
                    const scoreA = (a.rating * 0.3) + (a.totalSales * 0.0001) + (a.featured ? 10 : 0);
                    const scoreB = (b.rating * 0.3) + (b.totalSales * 0.0001) + (b.featured ? 10 : 0);
                    return scoreB - scoreA;
                });
        }
    }

    // Métodos de carrinho
    addToCart(productId, quantity = 1) {
        try {
            const product = this.products.get(productId);
            if (!product) {
                throw new Error('Produto não encontrado');
            }
            
            if (product.stock < quantity) {
                throw new Error('Estoque insuficiente');
            }
            
            const currentQuantity = this.cart.get(productId) || 0;
            const newQuantity = currentQuantity + quantity;
            
            if (newQuantity > product.maxOrder) {
                throw new Error(`Quantidade máxima permitida: ${product.maxOrder}`);
            }
            
            this.cart.set(productId, newQuantity);
            
            this.logger.info(`Produto adicionado ao carrinho: ${product.name} (${quantity}x)`);
            
            return {
                success: true,
                message: 'Produto adicionado ao carrinho',
                cartTotal: this.getCartTotal()
            };
            
        } catch (error) {
            this.logger.error('Erro ao adicionar produto ao carrinho:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    removeFromCart(productId) {
        if (this.cart.has(productId)) {
            this.cart.delete(productId);
            this.logger.info(`Produto removido do carrinho: ${productId}`);
        }
    }

    updateCartQuantity(productId, quantity) {
        try {
            const product = this.products.get(productId);
            if (!product) {
                throw new Error('Produto não encontrado');
            }
            
            if (quantity <= 0) {
                this.removeFromCart(productId);
                return { success: true };
            }
            
            if (quantity > product.stock) {
                throw new Error('Estoque insuficiente');
            }
            
            if (quantity > product.maxOrder) {
                throw new Error(`Quantidade máxima permitida: ${product.maxOrder}`);
            }
            
            this.cart.set(productId, quantity);
            
            return {
                success: true,
                cartTotal: this.getCartTotal()
            };
            
        } catch (error) {
            this.logger.error('Erro ao atualizar carrinho:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    getCartItems() {
        const items = [];
        
        this.cart.forEach((quantity, productId) => {
            const product = this.products.get(productId);
            if (product) {
                items.push({
                    product,
                    quantity,
                    subtotal: product.price * quantity
                });
            }
        });
        
        return items;
    }

    getCartTotal() {
        const items = this.getCartItems();
        return {
            items: items.length,
            quantity: items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
            shipping: this.calculateShipping(items),
            total: items.reduce((sum, item) => sum + item.subtotal, 0) + this.calculateShipping(items)
        };
    }

    calculateShipping(items) {
        // Lógica simples de frete
        const totalWeight = items.reduce((sum, item) => {
            return sum + (item.product.shipping?.weight || 0) * item.quantity;
        }, 0);
        
        if (totalWeight === 0) return 0; // Produtos digitais
        if (totalWeight < 1) return 15.00;
        if (totalWeight < 5) return 25.00;
        return 35.00;
    }

    // Métodos de wishlist
    addToWishlist(productId) {
        this.wishlist.add(productId);
        this.logger.info(`Produto adicionado à wishlist: ${productId}`);
    }

    removeFromWishlist(productId) {
        this.wishlist.delete(productId);
        this.logger.info(`Produto removido da wishlist: ${productId}`);
    }

    getWishlistItems() {
        return Array.from(this.wishlist)
            .map(productId => this.products.get(productId))
            .filter(product => product);
    }

    // Métodos de recomendação
    getRecommendations(productId, limit = 5) {
        try {
            const product = this.products.get(productId);
            if (!product) return [];
            
            let recommendations = Array.from(this.products.values())
                .filter(p => p.id !== productId)
                .map(p => ({
                    product: p,
                    score: this.calculateRecommendationScore(product, p)
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => item.product);
            
            return recommendations;
            
        } catch (error) {
            this.logger.error('Erro ao gerar recomendações:', error);
            return [];
        }
    }

    calculateRecommendationScore(baseProduct, candidateProduct) {
        let score = 0;
        
        // Mesma categoria (+30 pontos)
        if (baseProduct.category === candidateProduct.category) {
            score += 30;
        }
        
        // Tags similares (+5 pontos por tag)
        const baseTags = baseProduct.tags || [];
        const candidateTags = candidateProduct.tags || [];
        const commonTags = baseTags.filter(tag => candidateTags.includes(tag));
        score += commonTags.length * 5;
        
        // Faixa de preço similar (+10 pontos)
        const priceDiff = Math.abs(baseProduct.price - candidateProduct.price);
        const priceRatio = priceDiff / baseProduct.price;
        if (priceRatio < 0.5) {
            score += 10;
        }
        
        // Avaliação alta (+rating pontos)
        score += candidateProduct.rating;
        
        // Popularidade (+0.01 por venda)
        score += candidateProduct.totalSales * 0.01;
        
        return score;
    }

    // Métodos de analytics
    updateAnalytics() {
        try {
            const products = Array.from(this.products.values());
            const vendors = Array.from(this.vendors.values());
            
            this.analytics = {
                totalProducts: products.length,
                totalVendors: vendors.length,
                totalTransactions: vendors.reduce((sum, v) => sum + v.totalSales, 0),
                totalRevenue: products.reduce((sum, p) => sum + (p.price * p.totalSales), 0),
                avgRating: products.reduce((sum, p) => sum + p.rating, 0) / products.length,
                topCategories: this.getTopCategories(),
                recentActivity: this.getRecentActivity()
            };
            
        } catch (error) {
            this.logger.error('Erro ao atualizar analytics:', error);
        }
    }

    getTopCategories() {
        return Array.from(this.categories.values())
            .sort((a, b) => b.productCount - a.productCount)
            .slice(0, 5)
            .map(category => ({
                id: category.id,
                name: category.name,
                productCount: category.productCount,
                icon: category.icon
            }));
    }

    getRecentActivity() {
        const products = Array.from(this.products.values())
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 10)
            .map(product => ({
                type: 'product_updated',
                productId: product.id,
                productName: product.name,
                timestamp: product.updatedAt
            }));
        
        return products;
    }

    // Métodos de renderização
    render() {
        if (!this.isInitialized) {
            return '<div class="loading">Inicializando Marketplace...</div>';
        }
        
        return this.renderMarketplace();
    }

    renderMarketplace() {
        const searchResults = this.searchProducts(this.searchQuery, this.currentFilters);
        const cartTotal = this.getCartTotal();
        
        return `
            <div class="marketplace-container">
                <!-- Header do Marketplace -->
                <div class="marketplace-header">
                    <div class="header-content">
                        <h2>🛒 Marketplace Regenerativo</h2>
                        <div class="header-stats">
                            <span class="stat">${this.analytics.totalProducts} produtos</span>
                            <span class="stat">${this.analytics.totalVendors} fornecedores</span>
                            <span class="stat">⭐ ${this.analytics.avgRating.toFixed(1)}</span>
                        </div>
                    </div>
                    
                    <div class="header-actions">
                        <div class="cart-summary" onclick="marketplaceSystem.showCart()">
                            🛒 ${cartTotal.items} itens - R$ ${cartTotal.total.toFixed(2)}
                        </div>
                    </div>
                </div>
                
                <!-- Barra de Busca e Filtros -->
                <div class="search-section">
                    <div class="search-bar">
                        <input type="text" 
                               id="marketplace-search" 
                               placeholder="Buscar produtos sustentáveis..." 
                               value="${this.searchQuery}"
                               onkeyup="marketplaceSystem.handleSearch(event)">
                        <button class="search-btn" onclick="marketplaceSystem.performSearch()">
                            🔍
                        </button>
                    </div>
                    
                    <div class="filters-bar">
                        ${this.renderFilters()}
                    </div>
                </div>
                
                <!-- Categorias em Destaque -->
                <div class="categories-section">
                    <h3>📂 Categorias</h3>
                    <div class="categories-grid">
                        ${this.renderCategoriesGrid()}
                    </div>
                </div>
                
                <!-- Produtos -->
                <div class="products-section">
                    <div class="section-header">
                        <h3>🌟 Produtos (${searchResults.total})</h3>
                        <div class="sort-controls">
                            <select id="sort-select" onchange="marketplaceSystem.handleSort(event)">
                                <option value="relevance">Relevância</option>
                                <option value="price_asc">Menor Preço</option>
                                <option value="price_desc">Maior Preço</option>
                                <option value="rating">Melhor Avaliado</option>
                                <option value="newest">Mais Recente</option>
                                <option value="bestseller">Mais Vendido</option>
                                <option value="sustainability">Mais Sustentável</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="products-grid">
                        ${this.renderProductsGrid(searchResults.products)}
                    </div>
                    
                    ${searchResults.totalPages > 1 ? this.renderPagination(searchResults) : ''}
                </div>
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="filter-group">
                <label>Categoria:</label>
                <select id="category-filter" onchange="marketplaceSystem.handleFilterChange()">
                    <option value="">Todas</option>
                    ${Array.from(this.categories.values()).map(category => `
                        <option value="${category.id}" ${this.currentFilters.category === category.id ? 'selected' : ''}>
                            ${category.icon} ${category.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="filter-group">
                <label>Preço:</label>
                <input type="range" id="price-min" min="0" max="5000" value="${this.currentFilters.priceRange.min}" 
                       onchange="marketplaceSystem.handleFilterChange()">
                <input type="range" id="price-max" min="0" max="5000" value="${this.currentFilters.priceRange.max}" 
                       onchange="marketplaceSystem.handleFilterChange()">
                <span class="price-range">R$ ${this.currentFilters.priceRange.min} - R$ ${this.currentFilters.priceRange.max}</span>
            </div>
            
            <div class="filter-group">
                <label>Avaliação:</label>
                <select id="rating-filter" onchange="marketplaceSystem.handleFilterChange()">
                    <option value="0">Todas</option>
                    <option value="4" ${this.currentFilters.rating === 4 ? 'selected' : ''}>⭐ 4+ estrelas</option>
                    <option value="4.5" ${this.currentFilters.rating === 4.5 ? 'selected' : ''}>⭐ 4.5+ estrelas</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label>Sustentabilidade:</label>
                <select id="sustainability-filter" onchange="marketplaceSystem.handleFilterChange()">
                    <option value="all">Todos</option>
                    ${Object.entries(this.sustainabilityLevels).map(([key, level]) => `
                        <option value="${key}" ${this.currentFilters.sustainability === key ? 'selected' : ''}>
                            ${level.icon} ${level.name}+
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    renderCategoriesGrid() {
        return Array.from(this.categories.values())
            .filter(category => category.productCount > 0)
            .map(category => `
                <div class="category-card" onclick="marketplaceSystem.filterByCategory('${category.id}')">
                    <div class="category-icon" style="color: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-count">${category.productCount} produtos</div>
                    </div>
                </div>
            `).join('');
    }

    renderProductsGrid(products) {
        if (products.length === 0) {
            return '<div class="no-products">🔍 Nenhum produto encontrado</div>';
        }
        
        return products.map(product => {
            const vendor = this.vendors.get(product.vendorId);
            const status = this.productStatus[product.status];
            const sustainability = this.sustainabilityLevels[product.sustainabilityLevel];
            const inCart = this.cart.has(product.id);
            const inWishlist = this.wishlist.has(product.id);
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    ${product.featured ? '<div class="featured-badge">⭐ Destaque</div>' : ''}
                    
                    <div class="product-image">
                        <div class="product-icon">${product.images[0]}</div>
                        <div class="product-status" style="color: ${status.color}">
                            ${status.icon}
                        </div>
                        <button class="wishlist-btn ${inWishlist ? 'active' : ''}" 
                                onclick="marketplaceSystem.toggleWishlist('${product.id}')">
                            ${inWishlist ? '❤️' : '🤍'}
                        </button>
                    </div>
                    
                    <div class="product-content">
                        <div class="product-header">
                            <h4 class="product-name">${product.name}</h4>
                            <div class="sustainability-badge" style="color: ${sustainability.color}" 
                                 title="${sustainability.name}">
                                ${sustainability.icon}
                            </div>
                        </div>
                        
                        <div class="product-vendor">
                            ${vendor?.name || 'Fornecedor'}
                        </div>
                        
                        <div class="product-description">
                            ${product.description.substring(0, 100)}...
                        </div>
                        
                        <div class="product-rating">
                            <span class="rating-stars">⭐ ${product.rating}</span>
                            <span class="rating-count">(${product.totalReviews})</span>
                        </div>
                        
                        <div class="product-price">
                            ${product.originalPrice ? `
                                <span class="original-price">R$ ${product.originalPrice.toFixed(2)}</span>
                            ` : ''}
                            <span class="current-price">R$ ${product.price.toFixed(2)}</span>
                            <span class="price-unit">/${product.unit}</span>
                        </div>
                        
                        <div class="product-tags">
                            ${(product.tags || []).slice(0, 3).map(tag => `
                                <span class="tag">${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn-secondary" onclick="marketplaceSystem.showProductDetails('${product.id}')">
                            📋 Detalhes
                        </button>
                        <button class="btn-primary ${inCart ? 'in-cart' : ''}" 
                                onclick="marketplaceSystem.addToCart('${product.id}')" 
                                ${product.stock <= 0 ? 'disabled' : ''}>
                            ${inCart ? '✓ No Carrinho' : '🛒 Adicionar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPagination(searchResults) {
        const { page, totalPages } = searchResults;
        
        return `
            <div class="pagination">
                <button class="page-btn" 
                        onclick="marketplaceSystem.goToPage(${page - 1})" 
                        ${page <= 1 ? 'disabled' : ''}>
                    ← Anterior
                </button>
                
                <span class="page-info">
                    Página ${page} de ${totalPages}
                </span>
                
                <button class="page-btn" 
                        onclick="marketplaceSystem.goToPage(${page + 1})" 
                        ${page >= totalPages ? 'disabled' : ''}>
                    Próxima →
                </button>
            </div>
        `;
    }

    // Métodos de interação
    handleSearch(event) {
        if (event.key === 'Enter') {
            this.performSearch();
        }
    }

    performSearch() {
        const searchInput = document.getElementById('marketplace-search');
        if (searchInput) {
            this.searchQuery = searchInput.value;
            this.currentPage = 1;
            this.refreshDisplay();
        }
    }

    handleFilterChange() {
        const categoryFilter = document.getElementById('category-filter');
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const ratingFilter = document.getElementById('rating-filter');
        const sustainabilityFilter = document.getElementById('sustainability-filter');
        
        this.currentFilters = {
            category: categoryFilter?.value || null,
            priceRange: {
                min: parseInt(priceMin?.value || 0),
                max: parseInt(priceMax?.value || 10000)
            },
            rating: parseFloat(ratingFilter?.value || 0),
            sustainability: sustainabilityFilter?.value || 'all'
        };
        
        this.currentPage = 1;
        this.refreshDisplay();
    }

    handleSort(event) {
        this.sortBy = event.target.value;
        this.refreshDisplay();
    }

    filterByCategory(categoryId) {
        this.currentFilters.category = categoryId;
        this.currentPage = 1;
        this.refreshDisplay();
    }

    toggleWishlist(productId) {
        if (this.wishlist.has(productId)) {
            this.removeFromWishlist(productId);
        } else {
            this.addToWishlist(productId);
        }
        this.refreshDisplay();
    }

    goToPage(page) {
        this.currentPage = Math.max(1, page);
        this.refreshDisplay();
    }

    refreshDisplay() {
        // Emitir evento para atualizar a UI
        const event = new CustomEvent('marketplace-updated', {
            detail: {
                searchResults: this.searchProducts(this.searchQuery, this.currentFilters),
                cartTotal: this.getCartTotal()
            }
        });
        document.dispatchEvent(event);
    }

    // Métodos de exportação
    exportData() {
        return {
            products: Object.fromEntries(this.products),
            categories: Object.fromEntries(this.categories),
            vendors: Object.fromEntries(this.vendors),
            cart: Object.fromEntries(this.cart),
            wishlist: Array.from(this.wishlist),
            analytics: this.analytics,
            config: this.config
        };
    }

    destroy() {
        // Limpar dados
        this.products.clear();
        this.categories.clear();
        this.vendors.clear();
        this.cart.clear();
        this.wishlist.clear();
        
        this.logger.info('Sistema de Marketplace destruído');
    }
}

// Tornar disponível globalmente
window.MarketplaceSystem = MarketplaceSystem;

export default MarketplaceSystem;