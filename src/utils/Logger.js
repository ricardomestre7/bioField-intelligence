/**
 * Sistema de Logging da Plataforma Regenerativa
 * @author RegenTech Solutions
 * @version 2.0.0
 */

export class Logger {
    constructor(module = 'System', config = {}) {
        this.module = module;
        this.config = {
            level: config.level || 'info',
            enableConsole: config.enableConsole !== false,
            enableRemote: config.enableRemote || false,
            remoteEndpoint: config.remoteEndpoint || '/api/logs',
            maxLogSize: config.maxLogSize || 1000,
            enableTimestamp: config.enableTimestamp !== false,
            enableColors: config.enableColors !== false,
            ...config
        };
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            success: 1
        };
        
        this.colors = {
            debug: '#6B7280',
            info: '#3B82F6',
            warn: '#F59E0B',
            error: '#EF4444',
            success: '#10B981'
        };
        
        this.logs = [];
        this.setupRemoteLogging();
    }

    shouldLog(level) {
        const currentLevel = this.levels[this.config.level] || 1;
        const messageLevel = this.levels[level] || 1;
        return messageLevel >= currentLevel;
    }

    formatMessage(level, message, data = null) {
        const timestamp = this.config.enableTimestamp ? 
            new Date().toISOString() : null;
        
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            module: this.module,
            message,
            data,
            id: this.generateLogId()
        };
        
        // Adicionar ao histórico
        this.addToHistory(logEntry);
        
        return logEntry;
    }

    generateLogId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    addToHistory(logEntry) {
        this.logs.push(logEntry);
        
        // Limitar tamanho do histórico
        if (this.logs.length > this.config.maxLogSize) {
            this.logs = this.logs.slice(-this.config.maxLogSize);
        }
    }

    debug(message, data = null) {
        if (!this.shouldLog('debug')) return;
        
        const logEntry = this.formatMessage('debug', message, data);
        
        if (this.config.enableConsole) {
            this.consoleLog('debug', logEntry);
        }
        
        this.sendToRemote(logEntry);
    }

    info(message, data = null) {
        if (!this.shouldLog('info')) return;
        
        const logEntry = this.formatMessage('info', message, data);
        
        if (this.config.enableConsole) {
            this.consoleLog('info', logEntry);
        }
        
        this.sendToRemote(logEntry);
    }

    warn(message, data = null) {
        if (!this.shouldLog('warn')) return;
        
        const logEntry = this.formatMessage('warn', message, data);
        
        if (this.config.enableConsole) {
            this.consoleLog('warn', logEntry);
        }
        
        this.sendToRemote(logEntry);
    }

    error(message, data = null) {
        if (!this.shouldLog('error')) return;
        
        const logEntry = this.formatMessage('error', message, data);
        
        if (this.config.enableConsole) {
            this.consoleLog('error', logEntry);
        }
        
        this.sendToRemote(logEntry);
        
        // Capturar stack trace se disponível
        if (data instanceof Error) {
            logEntry.stack = data.stack;
        }
    }

    success(message, data = null) {
        if (!this.shouldLog('success')) return;
        
        const logEntry = this.formatMessage('success', message, data);
        
        if (this.config.enableConsole) {
            this.consoleLog('success', logEntry);
        }
        
        this.sendToRemote(logEntry);
    }

    consoleLog(level, logEntry) {
        const color = this.colors[level] || '#000000';
        const emoji = this.getEmoji(level);
        
        const style = this.config.enableColors ? 
            `color: ${color}; font-weight: bold;` : '';
        
        const prefix = `${emoji} [${logEntry.level}] [${this.module}]`;
        const timestamp = logEntry.timestamp ? 
            `[${new Date(logEntry.timestamp).toLocaleTimeString()}]` : '';
        
        if (logEntry.data) {
            console.groupCollapsed(`%c${prefix} ${timestamp} ${logEntry.message}`, style);
            console.log('Data:', logEntry.data);
            if (logEntry.stack) {
                console.log('Stack:', logEntry.stack);
            }
            console.groupEnd();
        } else {
            console.log(`%c${prefix} ${timestamp} ${logEntry.message}`, style);
        }
    }

    getEmoji(level) {
        const emojis = {
            debug: '🔍',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            success: '✅'
        };
        return emojis[level] || 'ℹ️';
    }

    setupRemoteLogging() {
        if (!this.config.enableRemote) return;
        
        // Buffer para logs remotos
        this.remoteBuffer = [];
        this.remoteFlushInterval = setInterval(() => {
            this.flushRemoteLogs();
        }, 5000); // Enviar logs a cada 5 segundos
    }

    sendToRemote(logEntry) {
        if (!this.config.enableRemote) return;
        
        this.remoteBuffer.push(logEntry);
        
        // Enviar imediatamente se for erro crítico
        if (logEntry.level === 'ERROR') {
            this.flushRemoteLogs();
        }
    }

    async flushRemoteLogs() {
        if (this.remoteBuffer.length === 0) return;
        
        const logsToSend = [...this.remoteBuffer];
        this.remoteBuffer = [];
        
        try {
            await fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logs: logsToSend,
                    source: 'regenplatform-frontend',
                    version: '2.0.0'
                })
            });
        } catch (error) {
            // Falha silenciosa para evitar loops de log
            console.warn('Falha ao enviar logs remotos:', error.message);
            
            // Recolocar logs no buffer para tentar novamente
            this.remoteBuffer.unshift(...logsToSend);
        }
    }

    // Métodos de consulta e análise
    getLogs(filter = {}) {
        let filteredLogs = [...this.logs];
        
        if (filter.level) {
            filteredLogs = filteredLogs.filter(log => 
                log.level.toLowerCase() === filter.level.toLowerCase()
            );
        }
        
        if (filter.module) {
            filteredLogs = filteredLogs.filter(log => 
                log.module.toLowerCase().includes(filter.module.toLowerCase())
            );
        }
        
        if (filter.since) {
            const since = new Date(filter.since);
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) >= since
            );
        }
        
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredLogs = filteredLogs.filter(log => 
                log.message.toLowerCase().includes(searchTerm)
            );
        }
        
        return filteredLogs;
    }

    getLogStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byModule: {},
            recent: this.logs.slice(-10)
        };
        
        this.logs.forEach(log => {
            // Contar por nível
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            
            // Contar por módulo
            stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
        });
        
        return stats;
    }

    exportLogs(format = 'json') {
        const exportData = {
            timestamp: new Date().toISOString(),
            platform: 'Plataforma Regenerativa v2.0.0',
            module: this.module,
            config: this.config,
            stats: this.getLogStats(),
            logs: this.logs
        };
        
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            return this.logsToCSV(this.logs);
        }
        
        return exportData;
    }

    logsToCSV(logs) {
        const headers = ['Timestamp', 'Level', 'Module', 'Message', 'Data'];
        const rows = logs.map(log => [
            log.timestamp,
            log.level,
            log.module,
            log.message,
            log.data ? JSON.stringify(log.data) : ''
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    clearLogs() {
        this.logs = [];
        this.info('Histórico de logs limpo');
    }

    setLevel(level) {
        this.config.level = level;
        this.info(`Nível de log alterado para: ${level}`);
    }

    destroy() {
        if (this.remoteFlushInterval) {
            clearInterval(this.remoteFlushInterval);
        }
        
        // Enviar logs restantes
        if (this.remoteBuffer.length > 0) {
            this.flushRemoteLogs();
        }
    }
}

// Factory function para criar loggers
export function createLogger(module, config = {}) {
    return new Logger(module, config);
}

// Logger global da plataforma
let globalLogger = null;

export function getGlobalLogger() {
    if (!globalLogger) {
        globalLogger = new Logger('Global');
    }
    return globalLogger;
}

export default Logger;