// Sistema de Autenticação - BioField Intelligence
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        // Aguardar o DOM carregar antes de verificar autenticação
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkAuth();
                this.setupLogoutListeners();
            });
        } else {
            // DOM já carregado
            this.checkAuth();
            this.setupLogoutListeners();
        }
    }

    // Verificar se o usuário está autenticado
    isAuthenticated() {
        return localStorage.getItem('biofield_authenticated') === 'true';
    }

    // Obter dados do usuário
    getUser() {
        const userData = localStorage.getItem('biofield_user');
        return userData ? JSON.parse(userData) : null;
    }

    // Verificar autenticação e redirecionar se necessário
    checkAuth() {
        const currentPage = window.location.pathname;
        const isLoginPage = currentPage.includes('login.html') || currentPage === '/' || currentPage === '/index.html';
        const isInPagesFolder = currentPage.includes('/pages/');
        
        console.log('🔐 Verificando autenticação:', {
            currentPage,
            isLoginPage,
            isInPagesFolder,
            isAuthenticated: this.isAuthenticated()
        });
        
        // Não redirecionar automaticamente para páginas de teste
        if (currentPage.includes('teste') || currentPage.includes('debug')) {
            console.log('🧪 Página de teste detectada - pulando verificação de autenticação');
            return true;
        }
        
        if (!this.isAuthenticated() && !isLoginPage) {
            // Se não autenticado e não está na página de login, redirecionar
            console.log('❌ Não autenticado, redirecionando para login');
            if (isInPagesFolder) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
            return false;
        }
        
        if (this.isAuthenticated() && isLoginPage) {
            // Se autenticado e está na página de login, redirecionar para dashboard
            console.log('✅ Autenticado, redirecionando para dashboard');
            window.location.href = 'pages/dashboard.html';
            return false;
        }
        
        console.log('✅ Autenticação OK');
        return true;
    }

    // Fazer login
    login(email, password) {
        return new Promise((resolve, reject) => {
            // Credenciais válidas (em produção, isso seria validado no servidor)
            const validCredentials = {
                'admin@biofield.com': 'admin123',
                'demo@biofield.com': 'demo123',
                'test@biofield.com': 'test123'
            };

            // Simular delay de autenticação
            setTimeout(() => {
                if (validCredentials[email] && validCredentials[email] === password) {
                    // Login bem-sucedido
                    localStorage.setItem('biofield_authenticated', 'true');
                    localStorage.setItem('biofield_user', JSON.stringify({
                        email: email,
                        loginTime: new Date().toISOString(),
                        role: email.includes('admin') ? 'admin' : 'user'
                    }));
                    
                    resolve({ success: true, user: this.getUser() });
                } else {
                    reject({ success: false, message: 'Credenciais inválidas' });
                }
            }, 1000);
        });
    }

    // Fazer logout
    logout() {
        localStorage.removeItem('biofield_authenticated');
        localStorage.removeItem('biofield_user');
        window.location.href = '../index.html';
    }

    // Configurar listeners para botões de logout
    setupLogoutListeners() {
        // Adicionar botão de logout se não existir
        this.addLogoutButton();
        
        // Listener para botões de logout
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn') || e.target.closest('.logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    // Adicionar botão de logout ao header
    addLogoutButton() {
        const nav = document.querySelector('.nav');
        if (nav && !document.querySelector('.logout-btn')) {
            const user = this.getUser();
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'nav-link logout-btn';
            logoutBtn.innerHTML = `
                <i class="fas fa-sign-out-alt"></i> 
                Sair ${user ? `(${user.email.split('@')[0]})` : ''}
            `;
            logoutBtn.style.marginLeft = 'auto';
            logoutBtn.style.color = '#ff6b6b';
            nav.appendChild(logoutBtn);
        }
    }

    // Verificar se a sessão expirou (opcional)
    checkSessionExpiry() {
        const user = this.getUser();
        if (user && user.loginTime) {
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // Sessão expira em 24 horas
            if (hoursDiff > 24) {
                this.logout();
                return false;
            }
        }
        return true;
    }
}

// Inicializar o sistema de autenticação
const authManager = new AuthManager();

// Exportar para uso global
window.AuthManager = AuthManager;
window.authManager = authManager;