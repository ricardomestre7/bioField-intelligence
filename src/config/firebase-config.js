/**
 * BioField Intelligence - Configuração Firebase
 * Credenciais do Instituto Doreikiusui
 */

export const firebaseConfig = {
    // Configuração de produção (substitua pelas suas credenciais reais)
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Substitua pela sua API Key
    authDomain: "biofield-intelligence.firebaseapp.com",
    projectId: "biofield-intelligence",
    storageBucket: "biofield-intelligence.appspot.com",
    messagingSenderId: "123456789012", // Substitua pelo seu Sender ID
    appId: "1:123456789012:web:abcdef1234567890abcdef", // Substitua pelo seu App ID
    measurementId: "G-XXXXXXXXXX" // Substitua pelo seu Measurement ID (opcional)
};

// Configuração de desenvolvimento (para testes)
export const firebaseConfigDev = {
    apiKey: "demo-api-key",
    authDomain: "biofield-intelligence.firebaseapp.com",
    projectId: "biofield-intelligence",
    storageBucket: "biofield-intelligence.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Configuração do administrador
export const adminConfig = {
    email: "institutodoreikiusui@gmail.com",
    name: "Instituto Doreikiusui",
    permissions: ["read", "write", "approve", "admin"],
    organization: "Instituto Doreikiusui"
};

// Coleções do Firebase
export const collections = {
    pendingReadings: "leituras_pendentes",
    approvedReadings: "leituras_aprovadas",
    users: "users",
    organizations: "organizations",
    locations: "locations",
    reports: "relatorios",
    consentLogs: "logs_consentimento"
};

// Regras de segurança (para referência)
export const securityRules = {
    // Exemplo de regras para Firestore
    firestore: `
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Leituras pendentes - apenas leitura para usuários autenticados
        match /leituras_pendentes/{document} {
          allow read: if request.auth != null;
          allow write: if false; // Apenas via Cloud Functions
        }
        
        // Leituras aprovadas - apenas admin pode escrever
        match /leituras_aprovadas/{document} {
          allow read: if request.auth != null;
          allow write: if request.auth.token.email == "institutodoreikiusui@gmail.com";
        }
        
        // Usuários - apenas o próprio usuário pode ler/escrever
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        // Organizações - apenas admin pode gerenciar
        match /organizations/{document} {
          allow read: if request.auth != null;
          allow write: if request.auth.token.email == "institutodoreikiusui@gmail.com";
        }
      }
    }
    `,
    
    // Exemplo de regras para Storage
    storage: `
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        match /relatorios/{allPaths=**} {
          allow read: if request.auth != null;
          allow write: if request.auth.token.email == "institutodoreikiusui@gmail.com";
        }
        
        match /espectros/{allPaths=**} {
          allow read: if request.auth != null;
          allow write: if request.auth.token.email == "institutodoreikiusui@gmail.com";
        }
      }
    }
    `
};

// Configurações de notificação
export const notificationConfig = {
    adminEmail: "institutodoreikiusui@gmail.com",
    smtp: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "institutodoreikiusui@gmail.com",
            pass: "teste@123" // Use App Password do Gmail
        }
    }
};

// Configurações de relatórios
export const reportConfig = {
    defaultFormat: "pdf",
    includeSpectrum: true,
    includeRawData: false, // Por segurança
    watermark: "BioField Intelligence - Instituto Doreikiusui",
    footer: "Relatório gerado automaticamente pelo sistema BioField Intelligence"
};

export default {
    firebaseConfig,
    firebaseConfigDev,
    adminConfig,
    collections,
    securityRules,
    notificationConfig,
    reportConfig
};
