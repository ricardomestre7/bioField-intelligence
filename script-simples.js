// Script simplificado para teste de navegação
console.log('🔧 Script simplificado carregado');

// Função para testar navegação
function testNavigation() {
    console.log('🧪 Testando navegação...');
    
    // Verificar se há links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`📊 Links encontrados: ${navLinks.length}`);
    
    navLinks.forEach((link, index) => {
        console.log(`🔗 Link ${index + 1}: ${link.href} - ${link.textContent}`);
        
        // Adicionar listener de clique
        link.addEventListener('click', function(e) {
            console.log(`🖱️ Clique no link: ${this.href}`);
            console.log(`📍 Texto: ${this.textContent}`);
            
            // Verificar se é um link interno
            if (this.href.includes('pages/') || this.href.includes('index.html')) {
                console.log('✅ Link interno detectado - permitindo navegação');
                // Não fazer preventDefault para links internos
                return true;
            }
        });
    });
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado - inicializando teste de navegação');
    testNavigation();
});

// Função global para teste
window.testNavigation = testNavigation;
