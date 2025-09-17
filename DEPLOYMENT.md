# 🚀 Guia de Deploy - BioField Intelligence

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Vercel
- Git instalado (✅ já instalado)

## 🔗 Conectar ao GitHub

### 1. Criar Repositório no GitHub

1. Acesse [GitHub.com](https://github.com)
2. Clique em "New repository"
3. Nome: `biofield-intelligence`
4. Descrição: `Plataforma de análise e regeneração bioenergética de ambientes físicos`
5. Marque como "Public"
6. **NÃO** inicialize com README (já temos um)
7. Clique em "Create repository"

### 2. Conectar Repositório Local

Execute os comandos abaixo no terminal:

```bash
# Adicionar remote do GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/biofield-intelligence.git

# Renomear branch para main
git branch -M main

# Fazer push inicial
git push -u origin main
```

## 🚀 Deploy no Vercel

### 1. Conectar Vercel ao GitHub

1. Acesse [Vercel.com](https://vercel.com)
2. Clique em "Sign up" ou "Login"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel a acessar seus repositórios

### 2. Importar Projeto

1. No dashboard do Vercel, clique em "Add New Project"
2. Selecione o repositório `biofield-intelligence`
3. Clique em "Import"

### 3. Configurações do Deploy

O Vercel detectará automaticamente as configurações do `vercel.json`:

```json
{
  "name": "biofield-intelligence",
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 4. Deploy Automático

- ✅ Deploy automático a cada push para `main`
- ✅ Preview deployments para pull requests
- ✅ Domínio personalizado disponível

## 🔧 Configurações Adicionais

### Variáveis de Ambiente (Opcional)

No Vercel Dashboard > Settings > Environment Variables:

```
NODE_ENV=production
FIREBASE_API_KEY=sua-api-key
FIREBASE_PROJECT_ID=seu-projeto-id
```

### Domínio Personalizado

1. Vercel Dashboard > Settings > Domains
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

## 📱 Testando o Deploy

Após o deploy, teste:

1. **Página Principal**: `https://seu-projeto.vercel.app`
2. **Dashboard**: `https://seu-projeto.vercel.app/pages/dashboard.html`
3. **Avaliações**: `https://seu-projeto.vercel.app/pages/evaluation.html`
4. **Relatórios**: `https://seu-projeto.vercel.app/pages/reports.html`

## 🔄 Atualizações Futuras

Para atualizar o site:

```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição da atualização"
git push origin main
```

O Vercel fará deploy automático em ~2 minutos.

## 🐛 Troubleshooting

### Erro de Build
- Verifique se todos os arquivos estão commitados
- Confirme se o `vercel.json` está correto

### Erro 404
- Verifique se as rotas estão configuradas no `vercel.json`
- Confirme se os arquivos estão na pasta correta

### Firebase não funciona
- Verifique se as credenciais estão corretas
- Confirme se o Firestore está ativado

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com
- **Projeto**: https://github.com/SEU_USUARIO/biofield-intelligence

---

🎉 **Parabéns!** Seu BioField Intelligence estará online em poucos minutos!

