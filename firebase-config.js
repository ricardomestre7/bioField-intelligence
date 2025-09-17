// Firebase Configuration for BioField Intelligence
// Replace with your actual Firebase project configuration

export const firebaseConfig = {
    apiKey: "demo-api-key-replace-with-real",
    authDomain: "biofield-intelligence.firebaseapp.com",
    projectId: "biofield-intelligence",
    storageBucket: "biofield-intelligence.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Firebase Collections
export const COLLECTIONS = {
    USERS: 'users',
    ORGANIZATIONS: 'organizations', 
    LOCATIONS: 'locations',
    BIOFIELD_LOGS: 'biofield_logs'
};

// Sample data structure for Firebase
export const SAMPLE_DATA = {
    users: [
        {
            id: 'user-001',
            email: 'consultor@biofield.com',
            role: 'consultor',
            created_at: new Date().toISOString()
        }
    ],
    organizations: [
        {
            id: 'org-001',
            name: 'Espaço Vida Leve',
            location: 'São Paulo, SP',
            industry: 'Bem-estar e Saúde',
            created_by: 'user-001',
            created_at: new Date().toISOString()
        }
    ],
    locations: [
        {
            id: 'loc-001',
            organization_id: 'org-001',
            name: 'Recepção',
            category: 'Área Pública',
            status: 'ativo',
            created_at: new Date().toISOString()
        },
        {
            id: 'loc-002',
            organization_id: 'org-001', 
            name: 'Sala Técnica',
            category: 'Área de Trabalho',
            status: 'ativo',
            created_at: new Date().toISOString()
        },
        {
            id: 'loc-003',
            organization_id: 'org-001',
            name: 'Sala de Meditação',
            category: 'Área Terapêutica',
            status: 'ativo',
            created_at: new Date().toISOString()
        },
        {
            id: 'loc-004',
            organization_id: 'org-001',
            name: 'Cozinha',
            category: 'Área de Serviço',
            status: 'ativo',
            created_at: new Date().toISOString()
        }
    ]
};
