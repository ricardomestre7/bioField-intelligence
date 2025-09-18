# 📋 COMANDOS TERMINAL - BioField Intelligence

## 🚀 **COMANDOS BÁSICOS**

### **1. Verificar Status do Git**
```bash
git status
```

### **2. Adicionar Arquivos ao Git**
```bash
git add .
# ou para arquivo específico:
git add nome-do-arquivo.html
```

### **3. Fazer Commit das Mudanças**
```bash
git commit -m "Descrição da mudança"
```

### **4. Enviar para GitHub**
```bash
git push origin main
```

### **5. Deploy no Vercel**
```bash
vercel --prod
```

## 🔧 **COMANDOS DE DESENVOLVIMENTO**

### **6. Iniciar Servidor Local**
```bash
python -m http.server 8000
```
**Acesse:** http://localhost:8000

### **7. Parar Servidor Local**
```bash
Ctrl + C
```

### **8. Verificar Deployments no Vercel**
```bash
vercel ls
```

### **9. Ver Logs do Vercel**
```bash
vercel logs [URL_DO_DEPLOYMENT]
```

## 📁 **ESTRUTURA ATUAL DO PROJETO**

```
bioField- Intelligence/
├── index.html              # Página principal
├── dashboard.html          # Dashboard (movido para raiz)
├── beta-demo.html          # Painel Admin (movido para raiz)
├── widget-sensor.html      # Widget de sensor
├── test.html               # Página de teste
├── pages/                  # Páginas internas
│   ├── dashboard.html
│   ├── beta-demo.html
│   ├── evaluation.html
│   ├── reports.html
│   ├── organization.html
│   ├── settings.html
│   └── distribution.html
├── src/                    # Código fonte
│   ├── widgets/
│   ├── admin/
│   └── config/
├── styles.css              # Estilos
├── script.js               # JavaScript principal
└── vercel.json             # Configuração Vercel
```

## 🌐 **URLS DE PRODUÇÃO**

### **URL Principal:**
https://bio-field-intelligence-6non9nh14-ricardos-projects-5fb25929.vercel.app

### **Páginas Principais:**
- **Dashboard:** `/dashboard.html`
- **Painel Admin:** `/beta-demo.html`
- **Widget Sensor:** `/widget-sensor.html`
- **Teste:** `/test.html`

### **Páginas Internas:**
- **Dashboard:** `/pages/dashboard.html`
- **Avaliações:** `/pages/evaluation.html`
- **Relatórios:** `/pages/reports.html`
- **Organização:** `/pages/organization.html`
- **Configurações:** `/pages/settings.html`
- **Distribuição:** `/pages/distribution.html`

## 🔐 **CREDENCIAIS ADMIN**

- **Email:** institutodoreikiusui@gmail.com
- **Senha:** teste@123

## 📝 **FLUXO DE TRABALHO RECOMENDADO**

### **Para Fazer Mudanças:**
1. `git status` - Verificar mudanças
2. `git add .` - Adicionar arquivos
3. `git commit -m "Descrição"` - Fazer commit
4. `git push origin main` - Enviar para GitHub
5. `vercel --prod` - Deploy no Vercel

### **Para Testar Localmente:**
1. `python -m http.server 8000` - Iniciar servidor
2. Acessar http://localhost:8000
3. `Ctrl + C` - Parar servidor

## ⚠️ **NOTAS IMPORTANTES**

- Sempre faça commit antes do deploy
- Teste localmente antes de fazer deploy
- Mantenha backup dos arquivos importantes
- Use mensagens de commit descritivas

## 🆘 **COMANDOS DE EMERGÊNCIA**

### **Reverter Último Commit:**
```bash
git reset --soft HEAD~1
```

### **Ver Histórico de Commits:**
```bash
git log --oneline
```

### **Forçar Deploy:**
```bash
vercel --prod --force
```
