// Sistema de Autenticação - BioField Intelligence
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        // Verificar autenticação ao carregar a página
        this.checkAuth();
        
        // Adicionar listener para logout
        this.setupLogoutListeners();
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
        const isLoginPage = currentPage.includes('login.html');
        
        if (!this.isAuthenticated() && !isLoginPage) {
            // Se não autenticado e não está na página de login, redirecionar
            window.location.href = '../login.html';
            return false;
        }
        
        if (this.isAuthenticated() && isLoginPage) {
            // Se autenticado e está na página de login, redirecionar para dashboard
            window.location.href = 'pages/dashboard.html';
            return false;
        }
        
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
        window.location.href = '../login.html';
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