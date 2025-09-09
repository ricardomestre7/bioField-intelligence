/**
 * Sistema de Chat Inteligente com Assistente IA
 * Implementa chat conversacional com processamento de linguagem natural,
 * integração com sistemas de IA, análise de sentimentos e respostas contextuais
 */

class ChatSystem {
    constructor() {
        this.conversations = new Map();
        this.currentConversation = null;
        this.aiModels = {
            nlp: null,
            sentiment: null,
            intent: null,
            context: null
        };
        this.chatHistory = [];
        this.userProfiles = new Map();
        this.knowledgeBase = new Map();
        this.activeConnections = new Set();
        this.messageQueue = [];
        this.isProcessing = false;
        this.settings = {
            maxHistoryLength: 1000,
            responseTimeout: 30000,
            enableSentimentAnalysis: true,
            enableContextAwareness: true,
            enableMultiLanguage: true,
            autoSave: true
        };
        this.supportedLanguages = ['pt', 'en', 'es', 'fr', 'de'];
        this.emoticons = {
            happy: '😊', sad: '😢', excited: '🎉', thinking: '🤔',
            success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️'
        };
        this.init();
    }

    async init() {
        try {
            await this.loadAIModels();
            await this.loadKnowledgeBase();
            await this.loadUserProfiles();
            await this.loadChatHistory();
            this.setupEventListeners();
            this.startMessageProcessor();
            console.log('ChatSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing ChatSystem:', error);
        }
    }

    async loadAIModels() {
        // Carrega modelos de IA para processamento de linguagem natural
        this.aiModels.nlp = {
            tokenize: (text) => text.toLowerCase().split(/\s+/),
            extractEntities: (text) => {
                const entities = [];
                const patterns = {
                    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                    phone: /\b\d{3}-\d{3}-\d{4}\b/g,
                    date: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
                    number: /\b\d+(?:\.\d+)?\b/g
                };
                
                for (const [type, pattern] of Object.entries(patterns)) {
                    const matches = text.match(pattern);
                    if (matches) {
                        matches.forEach(match => entities.push({ type, value: match }));
                    }
                }
                return entities;
            },
            detectLanguage: (text) => {
                const langPatterns = {
                    pt: /\b(o|a|de|para|com|em|por|que|não|sim|muito|bem)\b/gi,
                    en: /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi,
                    es: /\b(el|la|de|para|con|en|por|que|no|sí|muy|bien)\b/gi
                };
                
                let maxMatches = 0;
                let detectedLang = 'en';
                
                for (const [lang, pattern] of Object.entries(langPatterns)) {
                    const matches = (text.match(pattern) || []).length;
                    if (matches > maxMatches) {
                        maxMatches = matches;
                        detectedLang = lang;
                    }
                }
                return detectedLang;
            }
        };

        this.aiModels.sentiment = {
            analyze: (text) => {
                const positiveWords = ['bom', 'ótimo', 'excelente', 'maravilhoso', 'perfeito', 'amor', 'feliz', 'alegre'];
                const negativeWords = ['ruim', 'péssimo', 'terrível', 'horrível', 'ódio', 'triste', 'raiva', 'problema'];
                
                const words = text.toLowerCase().split(/\s+/);
                let positiveScore = 0;
                let negativeScore = 0;
                
                words.forEach(word => {
                    if (positiveWords.includes(word)) positiveScore++;
                    if (negativeWords.includes(word)) negativeScore++;
                });
                
                const totalScore = positiveScore - negativeScore;
                let sentiment = 'neutral';
                let confidence = 0.5;
                
                if (totalScore > 0) {
                    sentiment = 'positive';
                    confidence = Math.min(0.9, 0.5 + (totalScore * 0.1));
                } else if (totalScore < 0) {
                    sentiment = 'negative';
                    confidence = Math.min(0.9, 0.5 + (Math.abs(totalScore) * 0.1));
                }
                
                return { sentiment, confidence, score: totalScore };
            }
        };

        this.aiModels.intent = {
            classify: (text) => {
                const intents = {
                    greeting: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi'],
                    question: ['como', 'quando', 'onde', 'por que', 'o que', 'qual', 'quem'],
                    request: ['preciso', 'quero', 'gostaria', 'pode', 'consegue', 'ajuda'],
                    complaint: ['problema', 'erro', 'bug', 'não funciona', 'reclamação'],
                    compliment: ['obrigado', 'parabéns', 'excelente', 'muito bom', 'adorei'],
                    goodbye: ['tchau', 'até logo', 'adeus', 'bye', 'goodbye']
                };
                
                const lowerText = text.toLowerCase();
                let maxScore = 0;
                let detectedIntent = 'unknown';
                
                for (const [intent, keywords] of Object.entries(intents)) {
                    let score = 0;
                    keywords.forEach(keyword => {
                        if (lowerText.includes(keyword)) {
                            score += keyword.length;
                        }
                    });
                    
                    if (score > maxScore) {
                        maxScore = score;
                        detectedIntent = intent;
                    }
                }
                
                return {
                    intent: detectedIntent,
                    confidence: Math.min(0.95, maxScore / text.length)
                };
            }
        };

        this.aiModels.context = {
            analyze: (message, history) => {
                const recentMessages = history.slice(-5);
                const topics = new Set();
                const entities = new Set();
                
                recentMessages.forEach(msg => {
                    const msgEntities = this.aiModels.nlp.extractEntities(msg.content);
                    msgEntities.forEach(entity => entities.add(entity.value));
                    
                    // Extrai tópicos simples
                    const words = msg.content.toLowerCase().split(/\s+/);
                    words.forEach(word => {
                        if (word.length > 4 && !['para', 'com', 'por', 'que', 'não', 'sim'].includes(word)) {
                            topics.add(word);
                        }
                    });
                });
                
                return {
                    topics: Array.from(topics),
                    entities: Array.from(entities),
                    conversationLength: history.length,
                    lastActivity: history.length > 0 ? history[history.length - 1].timestamp : null
                };
            }
        };
    }

    async loadKnowledgeBase() {
        // Base de conhecimento para respostas contextuais
        this.knowledgeBase.set('sustainability', {
            keywords: ['sustentabilidade', 'meio ambiente', 'ecologia', 'verde', 'renovável'],
            responses: [
                'A sustentabilidade é fundamental para o futuro do nosso planeta! 🌱',
                'Que ótimo ver seu interesse em práticas sustentáveis! Como posso ajudar?',
                'Temos várias soluções eco-friendly disponíveis. Gostaria de saber mais?'
            ]
        });
        
        this.knowledgeBase.set('technology', {
            keywords: ['tecnologia', 'IA', 'inteligência artificial', 'inovação', 'digital'],
            responses: [
                'A tecnologia pode ser uma grande aliada da sustentabilidade! 🚀',
                'Estamos sempre inovando para criar soluções mais inteligentes.',
                'A IA pode nos ajudar a otimizar recursos e reduzir desperdícios.'
            ]
        });
        
        this.knowledgeBase.set('help', {
            keywords: ['ajuda', 'suporte', 'dúvida', 'problema', 'como'],
            responses: [
                'Estou aqui para ajudar! Em que posso ser útil? 😊',
                'Claro! Vou fazer o meu melhor para resolver sua dúvida.',
                'Sem problemas! Pode contar comigo para qualquer esclarecimento.'
            ]
        });
    }

    async loadUserProfiles() {
        const savedProfiles = localStorage.getItem('chatUserProfiles');
        if (savedProfiles) {
            const profiles = JSON.parse(savedProfiles);
            profiles.forEach(profile => {
                this.userProfiles.set(profile.id, profile);
            });
        }
    }

    async loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            this.chatHistory = JSON.parse(savedHistory);
        }
    }

    setupEventListeners() {
        // Event listeners para integração com outros sistemas
        document.addEventListener('aiSystemUpdate', (event) => {
            this.handleAISystemUpdate(event.detail);
        });
        
        document.addEventListener('userAction', (event) => {
            this.handleUserAction(event.detail);
        });
    }

    startMessageProcessor() {
        setInterval(() => {
            if (this.messageQueue.length > 0 && !this.isProcessing) {
                this.processNextMessage();
            }
        }, 100);
    }

    async processNextMessage() {
        if (this.messageQueue.length === 0) return;
        
        this.isProcessing = true;
        const message = this.messageQueue.shift();
        
        try {
            await this.processMessage(message);
        } catch (error) {
            console.error('Error processing message:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    async sendMessage(content, userId = 'user', conversationId = null) {
        const message = {
            id: this.generateId(),
            content,
            userId,
            conversationId: conversationId || this.currentConversation,
            timestamp: Date.now(),
            type: 'user',
            processed: false
        };
        
        this.messageQueue.push(message);
        this.addToHistory(message);
        this.updateChatDisplay();
        
        return message.id;
    }

    async processMessage(message) {
        // Análise da mensagem
        const language = this.aiModels.nlp.detectLanguage(message.content);
        const sentiment = this.aiModels.sentiment.analyze(message.content);
        const intent = this.aiModels.intent.classify(message.content);
        const entities = this.aiModels.nlp.extractEntities(message.content);
        const context = this.aiModels.context.analyze(message, this.chatHistory);
        
        // Gera resposta baseada na análise
        const response = await this.generateResponse({
            message,
            language,
            sentiment,
            intent,
            entities,
            context
        });
        
        // Cria mensagem de resposta
        const aiMessage = {
            id: this.generateId(),
            content: response.content,
            userId: 'assistant',
            conversationId: message.conversationId,
            timestamp: Date.now(),
            type: 'assistant',
            metadata: {
                language,
                sentiment,
                intent,
                entities,
                confidence: response.confidence
            }
        };
        
        this.addToHistory(aiMessage);
        this.updateChatDisplay();
        
        // Atualiza perfil do usuário
        this.updateUserProfile(message.userId, { language, sentiment, intent });
        
        message.processed = true;
    }

    async generateResponse(analysis) {
        const { message, language, sentiment, intent, entities, context } = analysis;
        
        let response = '';
        let confidence = 0.5;
        
        // Resposta baseada na intenção
        switch (intent.intent) {
            case 'greeting':
                response = this.getGreetingResponse(language);
                confidence = 0.9;
                break;
                
            case 'question':
                response = await this.handleQuestion(message.content, context);
                confidence = 0.7;
                break;
                
            case 'request':
                response = await this.handleRequest(message.content, entities);
                confidence = 0.8;
                break;
                
            case 'complaint':
                response = this.getComplaintResponse(sentiment);
                confidence = 0.8;
                break;
                
            case 'compliment':
                response = this.getComplimentResponse();
                confidence = 0.9;
                break;
                
            case 'goodbye':
                response = this.getGoodbyeResponse(language);
                confidence = 0.9;
                break;
                
            default:
                response = await this.getContextualResponse(message.content, context);
                confidence = 0.6;
        }
        
        // Adiciona emoticon baseado no sentimento
        if (sentiment.sentiment === 'positive') {
            response += ` ${this.emoticons.happy}`;
        } else if (sentiment.sentiment === 'negative') {
            response += ` ${this.emoticons.thinking}`;
        }
        
        return { content: response, confidence };
    }

    getGreetingResponse(language) {
        const greetings = {
            pt: ['Olá! Como posso ajudar você hoje?', 'Oi! Em que posso ser útil?', 'Bom dia! Como está?'],
            en: ['Hello! How can I help you today?', 'Hi! What can I do for you?', 'Good day! How are you?'],
            es: ['¡Hola! ¿Cómo puedo ayudarte hoy?', '¡Hola! ¿En qué puedo ser útil?', '¡Buen día! ¿Cómo estás?']
        };
        
        const options = greetings[language] || greetings.pt;
        return options[Math.floor(Math.random() * options.length)];
    }

    async handleQuestion(content, context) {
        // Integra com o sistema de IA para respostas mais precisas
        if (window.aiSystem) {
            const aiResponse = await window.aiSystem.processQuery(content);
            if (aiResponse && aiResponse.confidence > 0.7) {
                return aiResponse.answer;
            }
        }
        
        // Resposta baseada no contexto
        const contextualAnswer = this.findContextualAnswer(content, context);
        if (contextualAnswer) {
            return contextualAnswer;
        }
        
        return 'Essa é uma ótima pergunta! Deixe-me pesquisar informações mais detalhadas para você.';
    }

    async handleRequest(content, entities) {
        // Analisa o tipo de solicitação
        const requestTypes = {
            data: ['dados', 'informação', 'relatório', 'estatística'],
            action: ['fazer', 'executar', 'processar', 'calcular'],
            help: ['ajuda', 'suporte', 'orientação', 'tutorial']
        };
        
        let requestType = 'general';
        const lowerContent = content.toLowerCase();
        
        for (const [type, keywords] of Object.entries(requestTypes)) {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                requestType = type;
                break;
            }
        }
        
        switch (requestType) {
            case 'data':
                return 'Vou buscar os dados solicitados para você. Um momento, por favor...';
            case 'action':
                return 'Entendi sua solicitação. Vou processar isso agora!';
            case 'help':
                return 'Claro! Estou aqui para ajudar. Pode me explicar melhor o que precisa?';
            default:
                return 'Recebi sua solicitação. Como posso ajudar especificamente?';
        }
    }

    getComplaintResponse(sentiment) {
        const responses = [
            'Entendo sua preocupação. Vamos resolver isso juntos!',
            'Lamento que tenha tido essa experiência. Como posso ajudar a melhorar?',
            'Obrigado por compartilhar isso. Vou fazer o possível para resolver.'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getComplimentResponse() {
        const responses = [
            'Muito obrigado! Fico feliz em poder ajudar!',
            'Que bom saber que foi útil! Estou sempre aqui quando precisar.',
            'Obrigado pelo feedback positivo! Isso me motiva muito!'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getGoodbyeResponse(language) {
        const goodbyes = {
            pt: ['Até logo! Foi um prazer conversar com você!', 'Tchau! Volte sempre que precisar!', 'Até a próxima! Tenha um ótimo dia!'],
            en: ['Goodbye! It was a pleasure talking with you!', 'See you later! Come back anytime!', 'Until next time! Have a great day!'],
            es: ['¡Hasta luego! ¡Fue un placer hablar contigo!', '¡Adiós! ¡Vuelve cuando necesites!', '¡Hasta la próxima! ¡Que tengas un gran día!']
        };
        
        const options = goodbyes[language] || goodbyes.pt;
        return options[Math.floor(Math.random() * options.length)];
    }

    async getContextualResponse(content, context) {
        // Busca resposta baseada na base de conhecimento
        for (const [topic, data] of this.knowledgeBase.entries()) {
            if (data.keywords.some(keyword => content.toLowerCase().includes(keyword))) {
                const responses = data.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        
        // Resposta genérica inteligente
        const genericResponses = [
            'Interessante! Pode me contar mais sobre isso?',
            'Entendo. Como posso ajudar você com essa questão?',
            'Vejo que você está interessado nisso. Que informações específicas precisa?',
            'Ótimo ponto! Vamos explorar isso juntos.'
        ];
        
        return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }

    findContextualAnswer(question, context) {
        // Busca respostas baseadas no contexto da conversa
        const questionLower = question.toLowerCase();
        
        if (context.topics.includes('sustentabilidade') && questionLower.includes('como')) {
            return 'Existem várias maneiras de ser mais sustentável! Posso sugerir algumas práticas específicas.';
        }
        
        if (context.topics.includes('tecnologia') && questionLower.includes('funciona')) {
            return 'Nossa tecnologia utiliza IA avançada para otimizar processos e reduzir impactos ambientais.';
        }
        
        return null;
    }

    updateUserProfile(userId, data) {
        let profile = this.userProfiles.get(userId) || {
            id: userId,
            preferences: {},
            history: [],
            stats: {
                messagesCount: 0,
                averageSentiment: 0,
                commonIntents: {},
                preferredLanguage: 'pt'
            }
        };
        
        profile.stats.messagesCount++;
        profile.stats.preferredLanguage = data.language;
        
        // Atualiza estatísticas de sentimento
        const currentAvg = profile.stats.averageSentiment;
        const newSentimentScore = data.sentiment.score;
        profile.stats.averageSentiment = (currentAvg + newSentimentScore) / 2;
        
        // Atualiza intenções comuns
        const intent = data.intent.intent;
        profile.stats.commonIntents[intent] = (profile.stats.commonIntents[intent] || 0) + 1;
        
        this.userProfiles.set(userId, profile);
        this.saveUserProfiles();
    }

    addToHistory(message) {
        this.chatHistory.push(message);
        
        // Limita o histórico
        if (this.chatHistory.length > this.settings.maxHistoryLength) {
            this.chatHistory = this.chatHistory.slice(-this.settings.maxHistoryLength);
        }
        
        if (this.settings.autoSave) {
            this.saveChatHistory();
        }
    }

    updateChatDisplay() {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        // Mostra apenas as últimas 50 mensagens para performance
        const recentMessages = this.chatHistory.slice(-50);
        
        chatContainer.innerHTML = recentMessages.map(message => {
            const isUser = message.type === 'user';
            const time = new Date(message.timestamp).toLocaleTimeString();
            
            return `
                <div class="message ${isUser ? 'user-message' : 'assistant-message'}">
                    <div class="message-header">
                        <span class="message-sender">${isUser ? 'Você' : 'Assistente IA'}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-content">${this.formatMessageContent(message.content)}</div>
                    ${message.metadata ? this.renderMessageMetadata(message.metadata) : ''}
                </div>
            `;
        }).join('');
        
        // Scroll para a última mensagem
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    formatMessageContent(content) {
        // Formata links, menções, etc.
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    renderMessageMetadata(metadata) {
        if (!metadata) return '';
        
        return `
            <div class="message-metadata">
                <span class="sentiment ${metadata.sentiment.sentiment}">
                    ${this.getSentimentIcon(metadata.sentiment.sentiment)}
                </span>
                <span class="confidence">Confiança: ${Math.round(metadata.confidence * 100)}%</span>
            </div>
        `;
    }

    getSentimentIcon(sentiment) {
        const icons = {
            positive: '😊',
            negative: '😔',
            neutral: '😐'
        };
        return icons[sentiment] || '😐';
    }

    // Métodos de integração com outros sistemas
    handleAISystemUpdate(data) {
        // Integra atualizações do sistema de IA
        if (data.type === 'prediction') {
            this.sendSystemMessage(`Nova previsão disponível: ${data.message}`);
        } else if (data.type === 'alert') {
            this.sendSystemMessage(`⚠️ Alerta: ${data.message}`);
        }
    }

    handleUserAction(data) {
        // Responde a ações do usuário em outros sistemas
        if (data.action === 'achievement_unlocked') {
            this.sendSystemMessage(`🎉 Parabéns! Você desbloqueou: ${data.achievement}`);
        }
    }

    sendSystemMessage(content) {
        const message = {
            id: this.generateId(),
            content,
            userId: 'system',
            conversationId: this.currentConversation,
            timestamp: Date.now(),
            type: 'system'
        };
        
        this.addToHistory(message);
        this.updateChatDisplay();
    }

    // Métodos de persistência
    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    }

    saveUserProfiles() {
        const profiles = Array.from(this.userProfiles.values());
        localStorage.setItem('chatUserProfiles', JSON.stringify(profiles));
    }

    // Métodos de relatório e análise
    generateChatReport() {
        const totalMessages = this.chatHistory.length;
        const userMessages = this.chatHistory.filter(m => m.type === 'user').length;
        const assistantMessages = this.chatHistory.filter(m => m.type === 'assistant').length;
        
        const sentiments = this.chatHistory
            .filter(m => m.metadata && m.metadata.sentiment)
            .map(m => m.metadata.sentiment.sentiment);
        
        const sentimentCounts = sentiments.reduce((acc, sentiment) => {
            acc[sentiment] = (acc[sentiment] || 0) + 1;
            return acc;
        }, {});
        
        const intents = this.chatHistory
            .filter(m => m.metadata && m.metadata.intent)
            .map(m => m.metadata.intent.intent);
        
        const intentCounts = intents.reduce((acc, intent) => {
            acc[intent] = (acc[intent] || 0) + 1;
            return acc;
        }, {});
        
        return {
            totalMessages,
            userMessages,
            assistantMessages,
            sentimentAnalysis: sentimentCounts,
            intentAnalysis: intentCounts,
            averageResponseTime: this.calculateAverageResponseTime(),
            activeUsers: this.userProfiles.size,
            conversationLength: this.chatHistory.length
        };
    }

    calculateAverageResponseTime() {
        const responseTimes = [];
        
        for (let i = 1; i < this.chatHistory.length; i++) {
            const current = this.chatHistory[i];
            const previous = this.chatHistory[i - 1];
            
            if (current.type === 'assistant' && previous.type === 'user') {
                responseTimes.push(current.timestamp - previous.timestamp);
            }
        }
        
        return responseTimes.length > 0 
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
            : 0;
    }

    // Métodos de renderização da interface
    renderChatInterface() {
        return `
            <div class="chat-system">
                <div class="chat-header">
                    <h3>Assistente IA Inteligente</h3>
                    <div class="chat-status">
                        <span class="status-indicator online"></span>
                        <span>Online</span>
                    </div>
                </div>
                
                <div class="chat-messages" id="chat-messages">
                    <!-- Mensagens serão inseridas aqui -->
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-suggestions" id="chat-suggestions">
                        ${this.renderSuggestions()}
                    </div>
                    
                    <div class="chat-input-wrapper">
                        <input type="text" 
                               id="chat-input" 
                               placeholder="Digite sua mensagem..." 
                               maxlength="1000">
                        <button id="chat-send-btn" class="send-button">
                            <span>Enviar</span>
                        </button>
                    </div>
                    
                    <div class="chat-actions">
                        <button id="chat-clear-btn" class="action-button">
                            🗑️ Limpar
                        </button>
                        <button id="chat-export-btn" class="action-button">
                            📄 Exportar
                        </button>
                        <button id="chat-settings-btn" class="action-button">
                            ⚙️ Configurações
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSuggestions() {
        const suggestions = [
            'Como posso ser mais sustentável?',
            'Mostre-me os dados de hoje',
            'Quais são as tendências atuais?',
            'Preciso de ajuda com relatórios'
        ];
        
        return suggestions.map(suggestion => 
            `<button class="suggestion-btn" data-suggestion="${suggestion}">${suggestion}</button>`
        ).join('');
    }

    // Métodos utilitários
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    clearHistory() {
        this.chatHistory = [];
        this.saveChatHistory();
        this.updateChatDisplay();
    }

    exportChat() {
        const chatData = {
            history: this.chatHistory,
            report: this.generateChatReport(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Getters para status do sistema
    getSystemStatus() {
        return {
            isActive: true,
            messagesInQueue: this.messageQueue.length,
            isProcessing: this.isProcessing,
            totalConversations: this.conversations.size,
            totalMessages: this.chatHistory.length,
            activeUsers: this.userProfiles.size,
            uptime: Date.now() - this.startTime
        };
    }

    getConversationStats() {
        return this.generateChatReport();
    }

    getUserProfile(userId) {
        return this.userProfiles.get(userId);
    }

    // Cleanup
    cleanup() {
        this.saveChatHistory();
        this.saveUserProfiles();
        this.messageQueue = [];
        this.activeConnections.clear();
    }
}

// Instância global
window.chatSystem = new ChatSystem();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (window.chatSystem) {
        console.log('ChatSystem loaded and ready');
    }
});

export default ChatSystem;