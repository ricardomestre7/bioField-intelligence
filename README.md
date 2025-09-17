# 🧬 BioField Intelligence

Plataforma de análise e regeneração bioenergética de ambientes físicos.

## 🎯 Objetivo

Desenvolver um aplicativo web moderno para:
- Registrar avaliações bioenergéticas de ambientes físicos
- Exibir dashboard de métricas regenerativas
- Gerar relatórios por local analisado
- Salvar dados em tempo real no Firebase
- Preparar estrutura para futuras certificações

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|------------|
| Framework principal | HTML5 + CSS3 + JavaScript ES6+ |
| Estilo | CSS Custom Properties + Grid/Flexbox |
| Interatividade | Vanilla JavaScript |
| Gráficos | Chart.js |
| Backend / DB / Auth | Firebase Firestore |
| Deploy | Vercel |
| Dados mock (fase 1) | JSON local |

## 📁 Estrutura do Projeto

```
bioField-Intelligence/
├── index.html              # Página principal
├── script.js              # Lógica JavaScript
├── styles.css             # Estilos CSS
├── manifest.json          # PWA Manifest
├── sw.js                  # Service Worker
├── vercel.json            # Configuração Vercel
├── firebase-config.js     # Configuração Firebase
├── public/
│   └── mock/
│       └── sampleData.json # Dados de exemplo
└── README.md              # Este arquivo
```

## 🚀 Funcionalidades Implementadas

### ✅ Dashboard
- Métricas bioenergéticas em tempo real
- Índice Bioenergético Médio
- Coerência Vibracional
- Qualidade Informacional
- Ruído Eletromagnético

### ✅ Avaliações
- Formulário completo de avaliação bioenergética
- Indicadores visuais de range
- Histórico de avaliações
- Salvamento local e Firebase

### ✅ Relatórios
- Gráficos interativos com Chart.js
- Evolução temporal dos índices
- Comparação entre locais
- Exportação de dados

### ✅ Organização
- Gestão de locais
- Status dos ambientes
- Certificações disponíveis
- Informações da organização

### ✅ Configurações
- Perfil do usuário
- Configurações do sistema
- Preferências de notificação

## 🔥 Firebase Integration

### Estrutura do Banco de Dados

```javascript
// Coleções Firebase
users: {
  id: string,
  email: string,
  role: 'consultor' | 'admin',
  created_at: timestamp
}

organizations: {
  id: string,
  name: string,
  location: string,
  industry: string,
  created_by: string,
  created_at: timestamp
}

locations: {
  id: string,
  organization_id: string,
  name: string,
  category: string,
  status: 'ativo' | 'inativo',
  created_at: timestamp
}

biofield_logs: {
  id: string,
  location_id: string,
  date: string,
  bio_index: number,
  vibrational_coherence: number,
  info_quality: 'Alta' | 'Média' | 'Baixa',
  em_noise: 'Baixa' | 'Moderada' | 'Alta',
  notes: string,
  created_by: string,
  created_at: timestamp
}
```

## 🚀 Como Executar

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Acessar no navegador
http://localhost:8000
```

### Deploy no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel --prod
```

## 🔧 Configuração Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Firestore Database
3. Configure as regras de segurança
4. Substitua as credenciais em `firebase-config.js`

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

## 📊 Dados Mock

O projeto inclui dados de exemplo em `public/mock/sampleData.json`:

```json
{
  "organization": {
    "name": "Espaço Vida Leve",
    "location": "São Paulo, SP",
    "industry": "Bem-estar e Saúde"
  },
  "locations": [
    {
      "name": "Recepção",
      "bio_index": 74,
      "vibrational_coherence": 68,
      "info_quality": "Alta",
      "em_noise": "Moderada"
    }
  ]
}
```

## 🎨 Design System

### Cores Principais
- **Primária**: #22c55e (Verde)
- **Secundária**: #16a34a (Verde escuro)
- **Background**: #0f172a (Azul escuro)
- **Surface**: #1e293b (Cinza escuro)
- **Text**: #f8fafc (Branco)

### Tipografia
- **Fonte**: Inter, Segoe UI, system fonts
- **Tamanhos**: 0.8rem - 2.5rem
- **Pesos**: 400, 600, 800

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔮 Próximas Funcionalidades

- [ ] Autenticação com Firebase Auth
- [ ] Geração de relatórios PDF
- [ ] Certificados digitais
- [ ] IA para recomendação de intervenções
- [ ] Notificações push
- [ ] Modo offline com Service Worker

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@biofield.com
- GitHub Issues: [Abrir issue](https://github.com/seu-usuario/biofield-intelligence/issues)

---

Desenvolvido com ❤️ para regeneração energética de ambientes.