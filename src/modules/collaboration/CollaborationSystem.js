/**
 * Sistema de Colaboração em Tempo Real
 * Implementa colaboração multi-usuário com WebRTC, WebSockets,
 * sincronização de dados, edição colaborativa e comunicação em tempo real
 */

class CollaborationSystem {
    constructor() {
        this.connections = new Map();
        this.rooms = new Map();
        this.currentRoom = null;
        this.currentUser = null;
        this.webSocket = null;
        this.peerConnections = new Map();
        this.dataChannels = new Map();
        this.sharedDocuments = new Map();
        this.cursors = new Map();
        this.selections = new Map();
        this.operationQueue = [];
        this.isConnected = false;
        this.settings = {
            maxUsers: 50,
            autoSave: true,
            conflictResolution: 'operational-transform',
            enableVoiceChat: true,
            enableVideoChat: true,
            enableScreenShare: true,
            syncInterval: 100
        };
        this.eventHandlers = new Map();
        this.collaborationHistory = [];
        this.presenceData = new Map();
        this.init();
    }

    async init() {
        try {
            await this.setupWebSocket();
            await this.initializeWebRTC();
            this.setupEventListeners();
            this.startSyncLoop();
            console.log('CollaborationSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing CollaborationSystem:', error);
        }
    }

    async setupWebSocket() {
        // Simula conexão WebSocket (em produção seria um servidor real)
        this.webSocket = {
            readyState: 1, // OPEN
            send: (data) => {
                // Simula envio de dados
                console.log('WebSocket send:', data);
                this.handleWebSocketMessage({ data });
            },
            close: () => {
                this.isConnected = false;
                console.log('WebSocket connection closed');
            }
        };
        
        this.isConnected = true;
        this.emit('connected');
    }

    async initializeWebRTC() {
        // Configuração WebRTC para comunicação peer-to-peer
        this.rtcConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        // Inicializa capacidades de mídia
        this.mediaCapabilities = {
            audio: false,
            video: false,
            screen: false
        };
        
        try {
            // Verifica suporte a getUserMedia
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.mediaCapabilities.audio = true;
                this.mediaCapabilities.video = true;
            }
            
            // Verifica suporte a getDisplayMedia
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                this.mediaCapabilities.screen = true;
            }
        } catch (error) {
            console.warn('Media capabilities limited:', error);
        }
    }

    setupEventListeners() {
        // Event listeners para integração com outros sistemas
        document.addEventListener('userAction', (event) => {
            this.handleUserAction(event.detail);
        });
        
        document.addEventListener('documentChange', (event) => {
            this.handleDocumentChange(event.detail);
        });
        
        // Listeners para eventos de colaboração
        this.on('userJoined', (user) => {
            this.updatePresence(user.id, { status: 'online', joinedAt: Date.now() });
        });
        
        this.on('userLeft', (user) => {
            this.updatePresence(user.id, { status: 'offline', leftAt: Date.now() });
        });
    }

    startSyncLoop() {
        setInterval(() => {
            if (this.isConnected && this.operationQueue.length > 0) {
                this.processOperationQueue();
            }
            this.syncPresenceData();
        }, this.settings.syncInterval);
    }

    // Métodos de gerenciamento de salas
    async createRoom(roomName, options = {}) {
        const roomId = this.generateId();
        const room = {
            id: roomId,
            name: roomName,
            creator: this.currentUser?.id,
            users: new Map(),
            documents: new Map(),
            settings: { ...this.settings, ...options },
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        this.rooms.set(roomId, room);
        
        if (this.currentUser) {
            await this.joinRoom(roomId);
        }
        
        this.emit('roomCreated', room);
        return roomId;
    }

    async joinRoom(roomId, user = null) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        
        const userToJoin = user || this.currentUser;
        if (!userToJoin) {
            throw new Error('No user specified');
        }
        
        // Adiciona usuário à sala
        room.users.set(userToJoin.id, {
            ...userToJoin,
            joinedAt: Date.now(),
            cursor: { x: 0, y: 0 },
            selection: null,
            status: 'active'
        });
        
        this.currentRoom = roomId;
        room.lastActivity = Date.now();
        
        // Notifica outros usuários
        this.broadcastToRoom(roomId, {
            type: 'userJoined',
            user: userToJoin,
            timestamp: Date.now()
        });
        
        this.emit('joinedRoom', { room, user: userToJoin });
        return room;
    }

    async leaveRoom(roomId = null) {
        const targetRoomId = roomId || this.currentRoom;
        if (!targetRoomId) return;
        
        const room = this.rooms.get(targetRoomId);
        if (!room || !this.currentUser) return;
        
        // Remove usuário da sala
        room.users.delete(this.currentUser.id);
        
        // Notifica outros usuários
        this.broadcastToRoom(targetRoomId, {
            type: 'userLeft',
            user: this.currentUser,
            timestamp: Date.now()
        });
        
        if (targetRoomId === this.currentRoom) {
            this.currentRoom = null;
        }
        
        // Remove sala se vazia
        if (room.users.size === 0) {
            this.rooms.delete(targetRoomId);
        }
        
        this.emit('leftRoom', { room, user: this.currentUser });
    }

    // Métodos de comunicação
    broadcastToRoom(roomId, message) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        room.users.forEach((user, userId) => {
            if (userId !== this.currentUser?.id) {
                this.sendToUser(userId, message);
            }
        });
    }

    sendToUser(userId, message) {
        const connection = this.connections.get(userId);
        if (connection && connection.readyState === 'open') {
            connection.send(JSON.stringify(message));
        } else {
            // Fallback para WebSocket
            if (this.webSocket && this.webSocket.readyState === 1) {
                this.webSocket.send(JSON.stringify({
                    type: 'directMessage',
                    targetUser: userId,
                    message
                }));
            }
        }
    }

    // Métodos de edição colaborativa
    async createSharedDocument(name, content = '', type = 'text') {
        const docId = this.generateId();
        const document = {
            id: docId,
            name,
            content,
            type,
            version: 1,
            operations: [],
            cursors: new Map(),
            selections: new Map(),
            createdAt: Date.now(),
            lastModified: Date.now(),
            collaborators: new Set()
        };
        
        this.sharedDocuments.set(docId, document);
        
        if (this.currentRoom) {
            const room = this.rooms.get(this.currentRoom);
            if (room) {
                room.documents.set(docId, document);
            }
        }
        
        this.emit('documentCreated', document);
        return docId;
    }

    async editDocument(docId, operation) {
        const document = this.sharedDocuments.get(docId);
        if (!document) {
            throw new Error('Document not found');
        }
        
        // Aplica transformação operacional para resolver conflitos
        const transformedOperation = this.transformOperation(operation, document.operations);
        
        // Aplica operação ao documento
        this.applyOperation(document, transformedOperation);
        
        // Adiciona à fila de operações
        this.operationQueue.push({
            docId,
            operation: transformedOperation,
            timestamp: Date.now(),
            userId: this.currentUser?.id
        });
        
        // Notifica colaboradores
        this.broadcastDocumentChange(docId, transformedOperation);
        
        this.emit('documentEdited', { document, operation: transformedOperation });
    }

    transformOperation(operation, existingOperations) {
        // Implementação simplificada de Operational Transform
        let transformedOp = { ...operation };
        
        existingOperations.forEach(existingOp => {
            if (existingOp.timestamp > operation.timestamp) {
                transformedOp = this.transformAgainstOperation(transformedOp, existingOp);
            }
        });
        
        return transformedOp;
    }

    transformAgainstOperation(op1, op2) {
        // Transformação básica para operações de inserção/deleção
        if (op1.type === 'insert' && op2.type === 'insert') {
            if (op1.position <= op2.position) {
                return op1;
            } else {
                return {
                    ...op1,
                    position: op1.position + op2.content.length
                };
            }
        }
        
        if (op1.type === 'delete' && op2.type === 'insert') {
            if (op1.position <= op2.position) {
                return op1;
            } else {
                return {
                    ...op1,
                    position: op1.position + op2.content.length
                };
            }
        }
        
        return op1;
    }

    applyOperation(document, operation) {
        switch (operation.type) {
            case 'insert':
                document.content = 
                    document.content.slice(0, operation.position) +
                    operation.content +
                    document.content.slice(operation.position);
                break;
                
            case 'delete':
                document.content = 
                    document.content.slice(0, operation.position) +
                    document.content.slice(operation.position + operation.length);
                break;
                
            case 'replace':
                document.content = 
                    document.content.slice(0, operation.position) +
                    operation.content +
                    document.content.slice(operation.position + operation.length);
                break;
        }
        
        document.operations.push(operation);
        document.version++;
        document.lastModified = Date.now();
    }

    broadcastDocumentChange(docId, operation) {
        if (!this.currentRoom) return;
        
        this.broadcastToRoom(this.currentRoom, {
            type: 'documentChange',
            docId,
            operation,
            timestamp: Date.now(),
            userId: this.currentUser?.id
        });
    }

    // Métodos de cursor e seleção
    updateCursor(docId, position) {
        if (!this.currentUser || !this.currentRoom) return;
        
        const cursorData = {
            userId: this.currentUser.id,
            position,
            timestamp: Date.now()
        };
        
        this.cursors.set(`${docId}-${this.currentUser.id}`, cursorData);
        
        this.broadcastToRoom(this.currentRoom, {
            type: 'cursorUpdate',
            docId,
            cursor: cursorData
        });
    }

    updateSelection(docId, selection) {
        if (!this.currentUser || !this.currentRoom) return;
        
        const selectionData = {
            userId: this.currentUser.id,
            selection,
            timestamp: Date.now()
        };
        
        this.selections.set(`${docId}-${this.currentUser.id}`, selectionData);
        
        this.broadcastToRoom(this.currentRoom, {
            type: 'selectionUpdate',
            docId,
            selection: selectionData
        });
    }

    // Métodos de comunicação por voz/vídeo
    async startVoiceChat(roomId = null) {
        const targetRoomId = roomId || this.currentRoom;
        if (!targetRoomId || !this.mediaCapabilities.audio) {
            throw new Error('Voice chat not available');
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const room = this.rooms.get(targetRoomId);
            if (room) {
                room.users.forEach(async (user, userId) => {
                    if (userId !== this.currentUser?.id) {
                        await this.createPeerConnection(userId, stream);
                    }
                });
            }
            
            this.emit('voiceChatStarted', { roomId: targetRoomId, stream });
            return stream;
        } catch (error) {
            console.error('Error starting voice chat:', error);
            throw error;
        }
    }

    async startVideoChat(roomId = null) {
        const targetRoomId = roomId || this.currentRoom;
        if (!targetRoomId || !this.mediaCapabilities.video) {
            throw new Error('Video chat not available');
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: true 
            });
            
            const room = this.rooms.get(targetRoomId);
            if (room) {
                room.users.forEach(async (user, userId) => {
                    if (userId !== this.currentUser?.id) {
                        await this.createPeerConnection(userId, stream);
                    }
                });
            }
            
            this.emit('videoChatStarted', { roomId: targetRoomId, stream });
            return stream;
        } catch (error) {
            console.error('Error starting video chat:', error);
            throw error;
        }
    }

    async startScreenShare(roomId = null) {
        const targetRoomId = roomId || this.currentRoom;
        if (!targetRoomId || !this.mediaCapabilities.screen) {
            throw new Error('Screen share not available');
        }
        
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ 
                video: true, 
                audio: true 
            });
            
            const room = this.rooms.get(targetRoomId);
            if (room) {
                room.users.forEach(async (user, userId) => {
                    if (userId !== this.currentUser?.id) {
                        await this.createPeerConnection(userId, stream);
                    }
                });
            }
            
            this.emit('screenShareStarted', { roomId: targetRoomId, stream });
            return stream;
        } catch (error) {
            console.error('Error starting screen share:', error);
            throw error;
        }
    }

    async createPeerConnection(userId, stream = null) {
        const peerConnection = new RTCPeerConnection(this.rtcConfiguration);
        
        // Adiciona stream se fornecido
        if (stream) {
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
        }
        
        // Cria canal de dados
        const dataChannel = peerConnection.createDataChannel('collaboration', {
            ordered: true
        });
        
        dataChannel.onopen = () => {
            console.log('Data channel opened with user:', userId);
        };
        
        dataChannel.onmessage = (event) => {
            this.handleDataChannelMessage(userId, JSON.parse(event.data));
        };
        
        // Handlers para ICE
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendToUser(userId, {
                    type: 'iceCandidate',
                    candidate: event.candidate
                });
            }
        };
        
        peerConnection.ontrack = (event) => {
            this.emit('remoteStream', { userId, stream: event.streams[0] });
        };
        
        this.peerConnections.set(userId, peerConnection);
        this.dataChannels.set(userId, dataChannel);
        
        return peerConnection;
    }

    // Métodos de processamento de mensagens
    handleWebSocketMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    handleDataChannelMessage(userId, message) {
        this.handleMessage({ ...message, fromUser: userId });
    }

    handleMessage(message) {
        switch (message.type) {
            case 'userJoined':
                this.emit('userJoined', message.user);
                break;
                
            case 'userLeft':
                this.emit('userLeft', message.user);
                break;
                
            case 'documentChange':
                this.handleRemoteDocumentChange(message);
                break;
                
            case 'cursorUpdate':
                this.handleRemoteCursorUpdate(message);
                break;
                
            case 'selectionUpdate':
                this.handleRemoteSelectionUpdate(message);
                break;
                
            case 'iceCandidate':
                this.handleIceCandidate(message);
                break;
                
            case 'offer':
                this.handleOffer(message);
                break;
                
            case 'answer':
                this.handleAnswer(message);
                break;
        }
    }

    handleRemoteDocumentChange(message) {
        const document = this.sharedDocuments.get(message.docId);
        if (document) {
            this.applyOperation(document, message.operation);
            this.emit('remoteDocumentChange', { document, operation: message.operation });
        }
    }

    handleRemoteCursorUpdate(message) {
        const key = `${message.docId}-${message.cursor.userId}`;
        this.cursors.set(key, message.cursor);
        this.emit('remoteCursorUpdate', message);
    }

    handleRemoteSelectionUpdate(message) {
        const key = `${message.docId}-${message.selection.userId}`;
        this.selections.set(key, message.selection);
        this.emit('remoteSelectionUpdate', message);
    }

    handleIceCandidate(message) {
        const peerConnection = this.peerConnections.get(message.fromUser);
        if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    }

    handleOffer(message) {
        // Implementação para handling de offers WebRTC
        console.log('Received offer from:', message.fromUser);
    }

    handleAnswer(message) {
        // Implementação para handling de answers WebRTC
        console.log('Received answer from:', message.fromUser);
    }

    // Métodos de presença
    updatePresence(userId, data) {
        const existing = this.presenceData.get(userId) || {};
        this.presenceData.set(userId, { ...existing, ...data, lastUpdate: Date.now() });
        
        this.emit('presenceUpdate', { userId, data: this.presenceData.get(userId) });
    }

    syncPresenceData() {
        if (!this.currentRoom) return;
        
        const presenceUpdate = {
            type: 'presenceSync',
            userId: this.currentUser?.id,
            data: {
                status: 'active',
                lastActivity: Date.now(),
                currentDocument: this.getCurrentDocument()?.id
            }
        };
        
        this.broadcastToRoom(this.currentRoom, presenceUpdate);
    }

    // Métodos de processamento de operações
    processOperationQueue() {
        const operations = [...this.operationQueue];
        this.operationQueue = [];
        
        operations.forEach(op => {
            this.sendToUser('server', {
                type: 'operation',
                ...op
            });
        });
    }

    // Métodos de usuário
    setCurrentUser(user) {
        this.currentUser = user;
        this.emit('userSet', user);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRoom() {
        return this.currentRoom ? this.rooms.get(this.currentRoom) : null;
    }

    getCurrentDocument() {
        // Retorna o documento atualmente sendo editado
        const room = this.getCurrentRoom();
        if (room && room.documents.size > 0) {
            return Array.from(room.documents.values())[0];
        }
        return null;
    }

    // Métodos de evento
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
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

    // Métodos de integração com outros sistemas
    handleUserAction(action) {
        if (action.type === 'documentEdit' && this.currentRoom) {
            this.editDocument(action.docId, action.operation);
        }
    }

    handleDocumentChange(change) {
        if (change.source !== 'collaboration' && this.currentRoom) {
            this.broadcastDocumentChange(change.docId, change.operation);
        }
    }

    // Métodos de relatório
    generateCollaborationReport() {
        const rooms = Array.from(this.rooms.values());
        const documents = Array.from(this.sharedDocuments.values());
        
        return {
            totalRooms: rooms.length,
            activeRooms: rooms.filter(r => r.users.size > 0).length,
            totalUsers: new Set(rooms.flatMap(r => Array.from(r.users.keys()))).size,
            totalDocuments: documents.length,
            totalOperations: documents.reduce((sum, doc) => sum + doc.operations.length, 0),
            averageUsersPerRoom: rooms.length > 0 ? 
                rooms.reduce((sum, r) => sum + r.users.size, 0) / rooms.length : 0,
            collaborationHistory: this.collaborationHistory.slice(-100),
            presenceData: Object.fromEntries(this.presenceData),
            connectionStatus: {
                webSocket: this.isConnected,
                peerConnections: this.peerConnections.size,
                dataChannels: this.dataChannels.size
            }
        };
    }

    // Métodos de renderização
    renderCollaborationInterface() {
        return `
            <div class="collaboration-system">
                <div class="collaboration-header">
                    <h3>Colaboração em Tempo Real</h3>
                    <div class="connection-status">
                        <span class="status-indicator ${this.isConnected ? 'connected' : 'disconnected'}"></span>
                        <span>${this.isConnected ? 'Conectado' : 'Desconectado'}</span>
                    </div>
                </div>
                
                <div class="collaboration-content">
                    <div class="rooms-panel">
                        <h4>Salas Ativas</h4>
                        <div class="rooms-list" id="rooms-list">
                            ${this.renderRoomsList()}
                        </div>
                        <button id="create-room-btn" class="create-room-btn">
                            + Nova Sala
                        </button>
                    </div>
                    
                    <div class="collaboration-workspace">
                        ${this.renderWorkspace()}
                    </div>
                    
                    <div class="users-panel">
                        <h4>Usuários Online</h4>
                        <div class="users-list" id="users-list">
                            ${this.renderUsersList()}
                        </div>
                    </div>
                </div>
                
                <div class="collaboration-controls">
                    <button id="voice-chat-btn" class="control-btn">
                        🎤 Voz
                    </button>
                    <button id="video-chat-btn" class="control-btn">
                        📹 Vídeo
                    </button>
                    <button id="screen-share-btn" class="control-btn">
                        🖥️ Compartilhar Tela
                    </button>
                    <button id="collaboration-settings-btn" class="control-btn">
                        ⚙️ Configurações
                    </button>
                </div>
            </div>
        `;
    }

    renderRoomsList() {
        const rooms = Array.from(this.rooms.values());
        
        return rooms.map(room => `
            <div class="room-item ${room.id === this.currentRoom ? 'active' : ''}" 
                 data-room-id="${room.id}">
                <div class="room-info">
                    <span class="room-name">${room.name}</span>
                    <span class="room-users">${room.users.size} usuários</span>
                </div>
                <div class="room-actions">
                    <button class="join-room-btn" data-room-id="${room.id}">
                        ${room.id === this.currentRoom ? 'Sair' : 'Entrar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderUsersList() {
        const currentRoom = this.getCurrentRoom();
        if (!currentRoom) {
            return '<p class="no-users">Nenhuma sala ativa</p>';
        }
        
        const users = Array.from(currentRoom.users.values());
        
        return users.map(user => {
            const presence = this.presenceData.get(user.id);
            return `
                <div class="user-item" data-user-id="${user.id}">
                    <div class="user-avatar">
                        <span class="user-initial">${user.name?.charAt(0) || 'U'}</span>
                        <span class="user-status ${presence?.status || 'offline'}"></span>
                    </div>
                    <div class="user-info">
                        <span class="user-name">${user.name || 'Usuário'}</span>
                        <span class="user-activity">${this.getUserActivity(user.id)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderWorkspace() {
        const currentRoom = this.getCurrentRoom();
        if (!currentRoom) {
            return '<div class="no-workspace">Selecione uma sala para colaborar</div>';
        }
        
        return `
            <div class="workspace-content">
                <div class="documents-tabs">
                    ${this.renderDocumentTabs(currentRoom)}
                </div>
                <div class="document-editor" id="document-editor">
                    ${this.renderDocumentEditor()}
                </div>
                <div class="cursors-overlay" id="cursors-overlay">
                    ${this.renderCursors()}
                </div>
            </div>
        `;
    }

    renderDocumentTabs(room) {
        const documents = Array.from(room.documents.values());
        
        return documents.map(doc => `
            <div class="document-tab ${this.isCurrentDocument(doc.id) ? 'active' : ''}" 
                 data-doc-id="${doc.id}">
                <span class="doc-name">${doc.name}</span>
                <span class="doc-collaborators">${doc.collaborators.size}</span>
            </div>
        `).join('');
    }

    renderDocumentEditor() {
        const currentDoc = this.getCurrentDocument();
        if (!currentDoc) {
            return '<div class="no-document">Nenhum documento selecionado</div>';
        }
        
        return `
            <textarea id="document-content" 
                      class="document-textarea"
                      placeholder="Comece a digitar...">${currentDoc.content}</textarea>
        `;
    }

    renderCursors() {
        const cursors = Array.from(this.cursors.values());
        
        return cursors.map(cursor => {
            if (cursor.userId === this.currentUser?.id) return '';
            
            return `
                <div class="remote-cursor" 
                     style="left: ${cursor.position.x}px; top: ${cursor.position.y}px;"
                     data-user-id="${cursor.userId}">
                    <div class="cursor-line"></div>
                    <div class="cursor-label">${this.getUserName(cursor.userId)}</div>
                </div>
            `;
        }).join('');
    }

    // Métodos utilitários
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getUserName(userId) {
        const room = this.getCurrentRoom();
        if (room) {
            const user = room.users.get(userId);
            return user?.name || 'Usuário';
        }
        return 'Usuário';
    }

    getUserActivity(userId) {
        const presence = this.presenceData.get(userId);
        if (!presence) return 'Inativo';
        
        const timeDiff = Date.now() - presence.lastActivity;
        if (timeDiff < 60000) return 'Ativo agora';
        if (timeDiff < 300000) return 'Ativo recentemente';
        return 'Inativo';
    }

    isCurrentDocument(docId) {
        const currentDoc = this.getCurrentDocument();
        return currentDoc && currentDoc.id === docId;
    }

    // Métodos de status do sistema
    getSystemStatus() {
        return {
            isConnected: this.isConnected,
            currentRoom: this.currentRoom,
            currentUser: this.currentUser?.id,
            totalRooms: this.rooms.size,
            totalConnections: this.connections.size,
            peerConnections: this.peerConnections.size,
            sharedDocuments: this.sharedDocuments.size,
            operationQueueLength: this.operationQueue.length
        };
    }

    getRoomStatus(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;
        
        return {
            id: room.id,
            name: room.name,
            userCount: room.users.size,
            documentCount: room.documents.size,
            lastActivity: room.lastActivity,
            isActive: room.users.size > 0
        };
    }

    // Cleanup
    cleanup() {
        // Fecha todas as conexões
        this.peerConnections.forEach(pc => pc.close());
        this.dataChannels.forEach(dc => dc.close());
        
        if (this.webSocket) {
            this.webSocket.close();
        }
        
        // Limpa dados
        this.connections.clear();
        this.peerConnections.clear();
        this.dataChannels.clear();
        this.operationQueue = [];
        
        this.isConnected = false;
        this.emit('cleanup');
    }
}

// Instância global
window.collaborationSystem = new CollaborationSystem();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (window.collaborationSystem) {
        console.log('CollaborationSystem loaded and ready');
    }
});

export default CollaborationSystem;