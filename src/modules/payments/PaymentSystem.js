/**
 * Sistema de Pagamentos Digitais e DeFi
 * Implementa carteiras digitais, blockchain, tokens sustentáveis,
 * staking, yield farming e funcionalidades financeiras descentralizadas
 */

class PaymentSystem {
    constructor() {
        this.wallets = new Map();
        this.transactions = new Map();
        this.tokens = new Map();
        this.stakingPools = new Map();
        this.liquidityPools = new Map();
        this.currentWallet = null;
        this.blockchain = null;
        this.defiProtocols = new Map();
        this.paymentMethods = new Map();
        this.exchangeRates = new Map();
        this.settings = {
            defaultCurrency: 'REGEN',
            enableStaking: true,
            enableYieldFarming: true,
            enableNFTs: true,
            enableCrossChain: true,
            transactionFee: 0.001,
            stakingReward: 0.05,
            maxSlippage: 0.05
        };
        this.supportedNetworks = [
            'ethereum', 'polygon', 'binance-smart-chain', 
            'avalanche', 'solana', 'cardano'
        ];
        this.eventHandlers = new Map();
        this.init();
    }

    async init() {
        try {
            await this.initializeBlockchain();
            await this.loadTokens();
            await this.loadWallets();
            await this.loadStakingPools();
            await this.setupPaymentMethods();
            await this.initializeDeFiProtocols();
            this.setupEventListeners();
            this.startPriceUpdates();
            console.log('PaymentSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing PaymentSystem:', error);
        }
    }

    async initializeBlockchain() {
        // Simula conexão com blockchain (em produção seria Web3/ethers.js)
        this.blockchain = {
            network: 'polygon',
            chainId: 137,
            rpcUrl: 'https://polygon-rpc.com',
            connected: true,
            blockNumber: 50000000,
            gasPrice: 30, // gwei
            
            // Métodos simulados
            getBalance: async (address, token = 'MATIC') => {
                return Math.random() * 1000;
            },
            
            sendTransaction: async (tx) => {
                return {
                    hash: this.generateTxHash(),
                    status: 'pending',
                    timestamp: Date.now()
                };
            },
            
            getTransaction: async (hash) => {
                return {
                    hash,
                    status: 'confirmed',
                    blockNumber: this.blockchain.blockNumber + 1,
                    gasUsed: 21000,
                    timestamp: Date.now()
                };
            }
        };
    }

    async loadTokens() {
        // Tokens sustentáveis e ecológicos
        const sustainableTokens = [
            {
                symbol: 'REGEN',
                name: 'RegenTech Token',
                decimals: 18,
                totalSupply: 1000000000,
                price: 0.25,
                type: 'utility',
                description: 'Token principal da plataforma RegenTech',
                carbonNeutral: true,
                stakingEnabled: true
            },
            {
                symbol: 'CARBON',
                name: 'Carbon Credit Token',
                decimals: 18,
                totalSupply: 500000000,
                price: 15.50,
                type: 'carbon-credit',
                description: 'Créditos de carbono tokenizados',
                carbonNeutral: true,
                stakingEnabled: false
            },
            {
                symbol: 'GREEN',
                name: 'Green Energy Token',
                decimals: 18,
                totalSupply: 750000000,
                price: 0.85,
                type: 'energy',
                description: 'Token para energia renovável',
                carbonNeutral: true,
                stakingEnabled: true
            },
            {
                symbol: 'ECO',
                name: 'Ecosystem Restoration Token',
                decimals: 18,
                totalSupply: 300000000,
                price: 2.10,
                type: 'restoration',
                description: 'Token para projetos de restauração',
                carbonNeutral: true,
                stakingEnabled: true
            }
        ];
        
        sustainableTokens.forEach(token => {
            this.tokens.set(token.symbol, {
                ...token,
                address: this.generateTokenAddress(),
                holders: Math.floor(Math.random() * 10000),
                volume24h: Math.random() * 1000000,
                marketCap: token.totalSupply * token.price,
                priceChange24h: (Math.random() - 0.5) * 0.2
            });
        });
    }

    async loadWallets() {
        const savedWallets = localStorage.getItem('paymentWallets');
        if (savedWallets) {
            const wallets = JSON.parse(savedWallets);
            wallets.forEach(wallet => {
                this.wallets.set(wallet.address, wallet);
            });
        }
    }

    async loadStakingPools() {
        // Pools de staking para tokens sustentáveis
        const stakingPools = [
            {
                id: 'regen-pool',
                token: 'REGEN',
                name: 'REGEN Staking Pool',
                apy: 12.5,
                totalStaked: 50000000,
                minStake: 100,
                lockPeriod: 30, // dias
                rewards: ['REGEN', 'CARBON'],
                active: true
            },
            {
                id: 'green-pool',
                token: 'GREEN',
                name: 'Green Energy Pool',
                apy: 8.7,
                totalStaked: 25000000,
                minStake: 50,
                lockPeriod: 60,
                rewards: ['GREEN', 'ECO'],
                active: true
            },
            {
                id: 'eco-pool',
                token: 'ECO',
                name: 'Ecosystem Pool',
                apy: 15.2,
                totalStaked: 15000000,
                minStake: 25,
                lockPeriod: 90,
                rewards: ['ECO', 'CARBON'],
                active: true
            }
        ];
        
        stakingPools.forEach(pool => {
            this.stakingPools.set(pool.id, {
                ...pool,
                participants: Math.floor(Math.random() * 1000),
                createdAt: Date.now() - Math.random() * 86400000 * 30
            });
        });
    }

    async setupPaymentMethods() {
        // Métodos de pagamento tradicionais e crypto
        const paymentMethods = [
            {
                id: 'crypto-wallet',
                name: 'Carteira Crypto',
                type: 'cryptocurrency',
                enabled: true,
                fees: 0.001,
                processingTime: '1-5 min'
            },
            {
                id: 'credit-card',
                name: 'Cartão de Crédito',
                type: 'traditional',
                enabled: true,
                fees: 0.029,
                processingTime: 'Instantâneo'
            },
            {
                id: 'bank-transfer',
                name: 'Transferência Bancária',
                type: 'traditional',
                enabled: true,
                fees: 0.005,
                processingTime: '1-3 dias'
            },
            {
                id: 'pix',
                name: 'PIX',
                type: 'instant',
                enabled: true,
                fees: 0,
                processingTime: 'Instantâneo'
            }
        ];
        
        paymentMethods.forEach(method => {
            this.paymentMethods.set(method.id, method);
        });
    }

    async initializeDeFiProtocols() {
        // Protocolos DeFi integrados
        const defiProtocols = [
            {
                id: 'uniswap',
                name: 'Uniswap V3',
                type: 'dex',
                tvl: 5000000000,
                fees: 0.003,
                supportedTokens: ['REGEN', 'GREEN', 'ECO']
            },
            {
                id: 'compound',
                name: 'Compound',
                type: 'lending',
                tvl: 8000000000,
                fees: 0.001,
                supportedTokens: ['REGEN', 'GREEN']
            },
            {
                id: 'aave',
                name: 'Aave',
                type: 'lending',
                tvl: 12000000000,
                fees: 0.0009,
                supportedTokens: ['REGEN', 'GREEN', 'ECO']
            }
        ];
        
        defiProtocols.forEach(protocol => {
            this.defiProtocols.set(protocol.id, protocol);
        });
    }

    setupEventListeners() {
        // Event listeners para integração com outros sistemas
        document.addEventListener('gamificationUpdate', (event) => {
            this.handleGamificationReward(event.detail);
        });
        
        document.addEventListener('sustainabilityAction', (event) => {
            this.handleSustainabilityReward(event.detail);
        });
    }

    startPriceUpdates() {
        // Atualiza preços dos tokens periodicamente
        setInterval(() => {
            this.updateTokenPrices();
        }, 30000); // 30 segundos
    }

    // Métodos de carteira
    async createWallet(name, type = 'hot') {
        const wallet = {
            address: this.generateWalletAddress(),
            name,
            type, // hot, cold, hardware
            privateKey: this.generatePrivateKey(),
            balances: new Map(),
            transactions: [],
            stakingPositions: new Map(),
            nfts: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        // Inicializa com saldo de tokens
        this.tokens.forEach((token, symbol) => {
            wallet.balances.set(symbol, 0);
        });
        
        this.wallets.set(wallet.address, wallet);
        this.saveWallets();
        
        this.emit('walletCreated', wallet);
        return wallet;
    }

    async importWallet(privateKey, name) {
        const address = this.deriveAddressFromPrivateKey(privateKey);
        
        const wallet = {
            address,
            name,
            type: 'imported',
            privateKey,
            balances: new Map(),
            transactions: [],
            stakingPositions: new Map(),
            nfts: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        // Carrega saldos da blockchain
        await this.loadWalletBalances(wallet);
        
        this.wallets.set(wallet.address, wallet);
        this.saveWallets();
        
        this.emit('walletImported', wallet);
        return wallet;
    }

    async loadWalletBalances(wallet) {
        for (const [symbol, token] of this.tokens.entries()) {
            try {
                const balance = await this.blockchain.getBalance(wallet.address, symbol);
                wallet.balances.set(symbol, balance);
            } catch (error) {
                console.error(`Error loading balance for ${symbol}:`, error);
                wallet.balances.set(symbol, 0);
            }
        }
    }

    setCurrentWallet(address) {
        const wallet = this.wallets.get(address);
        if (wallet) {
            this.currentWallet = wallet;
            this.emit('walletChanged', wallet);
        }
    }

    getCurrentWallet() {
        return this.currentWallet;
    }

    // Métodos de transação
    async sendTransaction(to, amount, token = 'REGEN', options = {}) {
        if (!this.currentWallet) {
            throw new Error('No wallet selected');
        }
        
        const tokenData = this.tokens.get(token);
        if (!tokenData) {
            throw new Error('Token not supported');
        }
        
        const balance = this.currentWallet.balances.get(token) || 0;
        if (balance < amount) {
            throw new Error('Insufficient balance');
        }
        
        const transaction = {
            id: this.generateTxHash(),
            from: this.currentWallet.address,
            to,
            amount,
            token,
            fee: amount * this.settings.transactionFee,
            status: 'pending',
            timestamp: Date.now(),
            blockNumber: null,
            gasUsed: null,
            ...options
        };
        
        // Simula envio para blockchain
        const blockchainTx = await this.blockchain.sendTransaction({
            from: transaction.from,
            to: transaction.to,
            value: amount,
            token: token
        });
        
        transaction.hash = blockchainTx.hash;
        
        // Atualiza saldos
        this.currentWallet.balances.set(token, balance - amount - transaction.fee);
        
        // Adiciona à lista de transações
        this.transactions.set(transaction.id, transaction);
        this.currentWallet.transactions.push(transaction.id);
        
        this.saveWallets();
        this.emit('transactionSent', transaction);
        
        // Simula confirmação após delay
        setTimeout(() => {
            this.confirmTransaction(transaction.id);
        }, 5000);
        
        return transaction;
    }

    async confirmTransaction(txId) {
        const transaction = this.transactions.get(txId);
        if (!transaction) return;
        
        transaction.status = 'confirmed';
        transaction.blockNumber = this.blockchain.blockNumber + 1;
        transaction.gasUsed = 21000;
        
        this.emit('transactionConfirmed', transaction);
    }

    async swapTokens(fromToken, toToken, amount, slippage = null) {
        const maxSlippage = slippage || this.settings.maxSlippage;
        
        const fromTokenData = this.tokens.get(fromToken);
        const toTokenData = this.tokens.get(toToken);
        
        if (!fromTokenData || !toTokenData) {
            throw new Error('Token pair not supported');
        }
        
        // Calcula taxa de câmbio
        const exchangeRate = fromTokenData.price / toTokenData.price;
        const expectedOutput = amount * exchangeRate;
        const minOutput = expectedOutput * (1 - maxSlippage);
        
        const swap = {
            id: this.generateTxHash(),
            fromToken,
            toToken,
            amountIn: amount,
            amountOut: expectedOutput,
            minAmountOut: minOutput,
            exchangeRate,
            slippage: maxSlippage,
            fee: amount * 0.003, // 0.3% fee
            status: 'pending',
            timestamp: Date.now()
        };
        
        // Verifica saldo
        const balance = this.currentWallet.balances.get(fromToken) || 0;
        if (balance < amount) {
            throw new Error('Insufficient balance');
        }
        
        // Executa swap
        this.currentWallet.balances.set(fromToken, balance - amount);
        const toBalance = this.currentWallet.balances.get(toToken) || 0;
        this.currentWallet.balances.set(toToken, toBalance + expectedOutput);
        
        swap.status = 'completed';
        
        this.saveWallets();
        this.emit('tokenSwapped', swap);
        
        return swap;
    }

    // Métodos de staking
    async stakeTokens(poolId, amount) {
        const pool = this.stakingPools.get(poolId);
        if (!pool || !pool.active) {
            throw new Error('Staking pool not available');
        }
        
        if (amount < pool.minStake) {
            throw new Error(`Minimum stake is ${pool.minStake} ${pool.token}`);
        }
        
        const balance = this.currentWallet.balances.get(pool.token) || 0;
        if (balance < amount) {
            throw new Error('Insufficient balance');
        }
        
        const stake = {
            id: this.generateId(),
            poolId,
            amount,
            token: pool.token,
            apy: pool.apy,
            startDate: Date.now(),
            endDate: Date.now() + (pool.lockPeriod * 24 * 60 * 60 * 1000),
            rewards: 0,
            status: 'active'
        };
        
        // Atualiza saldos
        this.currentWallet.balances.set(pool.token, balance - amount);
        this.currentWallet.stakingPositions.set(stake.id, stake);
        
        // Atualiza pool
        pool.totalStaked += amount;
        pool.participants++;
        
        this.saveWallets();
        this.emit('tokensStaked', stake);
        
        return stake;
    }

    async unstakeTokens(stakeId) {
        const stake = this.currentWallet.stakingPositions.get(stakeId);
        if (!stake) {
            throw new Error('Stake not found');
        }
        
        if (Date.now() < stake.endDate) {
            throw new Error('Tokens are still locked');
        }
        
        // Calcula recompensas
        const stakingDays = (Date.now() - stake.startDate) / (24 * 60 * 60 * 1000);
        const rewards = stake.amount * (stake.apy / 100) * (stakingDays / 365);
        
        // Retorna tokens + recompensas
        const currentBalance = this.currentWallet.balances.get(stake.token) || 0;
        this.currentWallet.balances.set(stake.token, currentBalance + stake.amount + rewards);
        
        // Remove stake
        this.currentWallet.stakingPositions.delete(stakeId);
        
        // Atualiza pool
        const pool = this.stakingPools.get(stake.poolId);
        if (pool) {
            pool.totalStaked -= stake.amount;
            pool.participants--;
        }
        
        stake.status = 'completed';
        stake.rewards = rewards;
        
        this.saveWallets();
        this.emit('tokensUnstaked', { stake, rewards });
        
        return { stake, rewards };
    }

    // Métodos de yield farming
    async addLiquidity(tokenA, tokenB, amountA, amountB) {
        const poolId = `${tokenA}-${tokenB}`;
        
        let pool = this.liquidityPools.get(poolId);
        if (!pool) {
            pool = {
                id: poolId,
                tokenA,
                tokenB,
                reserveA: 0,
                reserveB: 0,
                totalSupply: 0,
                providers: new Map(),
                apy: Math.random() * 20 + 5, // 5-25% APY
                createdAt: Date.now()
            };
            this.liquidityPools.set(poolId, pool);
        }
        
        // Verifica saldos
        const balanceA = this.currentWallet.balances.get(tokenA) || 0;
        const balanceB = this.currentWallet.balances.get(tokenB) || 0;
        
        if (balanceA < amountA || balanceB < amountB) {
            throw new Error('Insufficient balance');
        }
        
        // Calcula LP tokens
        let lpTokens;
        if (pool.totalSupply === 0) {
            lpTokens = Math.sqrt(amountA * amountB);
        } else {
            lpTokens = Math.min(
                (amountA * pool.totalSupply) / pool.reserveA,
                (amountB * pool.totalSupply) / pool.reserveB
            );
        }
        
        // Atualiza saldos
        this.currentWallet.balances.set(tokenA, balanceA - amountA);
        this.currentWallet.balances.set(tokenB, balanceB - amountB);
        
        // Atualiza pool
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalSupply += lpTokens;
        
        // Adiciona posição do usuário
        const userPosition = pool.providers.get(this.currentWallet.address) || {
            lpTokens: 0,
            rewards: 0,
            lastUpdate: Date.now()
        };
        
        userPosition.lpTokens += lpTokens;
        userPosition.lastUpdate = Date.now();
        pool.providers.set(this.currentWallet.address, userPosition);
        
        const liquidityPosition = {
            poolId,
            lpTokens,
            amountA,
            amountB,
            timestamp: Date.now()
        };
        
        this.saveWallets();
        this.emit('liquidityAdded', liquidityPosition);
        
        return liquidityPosition;
    }

    async removeLiquidity(poolId, lpTokens) {
        const pool = this.liquidityPools.get(poolId);
        if (!pool) {
            throw new Error('Liquidity pool not found');
        }
        
        const userPosition = pool.providers.get(this.currentWallet.address);
        if (!userPosition || userPosition.lpTokens < lpTokens) {
            throw new Error('Insufficient LP tokens');
        }
        
        // Calcula tokens a receber
        const sharePercentage = lpTokens / pool.totalSupply;
        const amountA = pool.reserveA * sharePercentage;
        const amountB = pool.reserveB * sharePercentage;
        
        // Atualiza saldos
        const balanceA = this.currentWallet.balances.get(pool.tokenA) || 0;
        const balanceB = this.currentWallet.balances.get(pool.tokenB) || 0;
        
        this.currentWallet.balances.set(pool.tokenA, balanceA + amountA);
        this.currentWallet.balances.set(pool.tokenB, balanceB + amountB);
        
        // Atualiza pool
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalSupply -= lpTokens;
        
        // Atualiza posição do usuário
        userPosition.lpTokens -= lpTokens;
        if (userPosition.lpTokens === 0) {
            pool.providers.delete(this.currentWallet.address);
        }
        
        const removal = {
            poolId,
            lpTokens,
            amountA,
            amountB,
            timestamp: Date.now()
        };
        
        this.saveWallets();
        this.emit('liquidityRemoved', removal);
        
        return removal;
    }

    // Métodos de recompensas
    async claimStakingRewards(stakeId) {
        const stake = this.currentWallet.stakingPositions.get(stakeId);
        if (!stake) {
            throw new Error('Stake not found');
        }
        
        const pool = this.stakingPools.get(stake.poolId);
        if (!pool) {
            throw new Error('Pool not found');
        }
        
        // Calcula recompensas acumuladas
        const stakingDays = (Date.now() - stake.startDate) / (24 * 60 * 60 * 1000);
        const rewards = stake.amount * (stake.apy / 100) * (stakingDays / 365) - stake.rewards;
        
        if (rewards <= 0) {
            throw new Error('No rewards to claim');
        }
        
        // Distribui recompensas
        pool.rewards.forEach(rewardToken => {
            const rewardAmount = rewards / pool.rewards.length;
            const currentBalance = this.currentWallet.balances.get(rewardToken) || 0;
            this.currentWallet.balances.set(rewardToken, currentBalance + rewardAmount);
        });
        
        stake.rewards += rewards;
        
        this.saveWallets();
        this.emit('rewardsClaimed', { stakeId, rewards });
        
        return rewards;
    }

    async claimYieldFarmingRewards(poolId) {
        const pool = this.liquidityPools.get(poolId);
        if (!pool) {
            throw new Error('Pool not found');
        }
        
        const userPosition = pool.providers.get(this.currentWallet.address);
        if (!userPosition) {
            throw new Error('No position in this pool');
        }
        
        // Calcula recompensas baseadas no tempo e APY
        const timeDiff = Date.now() - userPosition.lastUpdate;
        const days = timeDiff / (24 * 60 * 60 * 1000);
        const sharePercentage = userPosition.lpTokens / pool.totalSupply;
        const rewards = sharePercentage * pool.apy * days / 365;
        
        if (rewards <= 0) {
            return 0;
        }
        
        // Adiciona recompensas em REGEN
        const currentBalance = this.currentWallet.balances.get('REGEN') || 0;
        this.currentWallet.balances.set('REGEN', currentBalance + rewards);
        
        userPosition.rewards += rewards;
        userPosition.lastUpdate = Date.now();
        
        this.saveWallets();
        this.emit('yieldRewardsClaimed', { poolId, rewards });
        
        return rewards;
    }

    // Métodos de integração com gamificação
    handleGamificationReward(data) {
        if (!this.currentWallet) return;
        
        let rewardAmount = 0;
        let rewardToken = 'REGEN';
        
        switch (data.type) {
            case 'achievement':
                rewardAmount = data.points * 0.1;
                break;
            case 'daily_login':
                rewardAmount = 10;
                break;
            case 'challenge_completed':
                rewardAmount = data.difficulty * 25;
                break;
            case 'sustainability_action':
                rewardAmount = data.impact * 5;
                rewardToken = 'GREEN';
                break;
        }
        
        if (rewardAmount > 0) {
            const currentBalance = this.currentWallet.balances.get(rewardToken) || 0;
            this.currentWallet.balances.set(rewardToken, currentBalance + rewardAmount);
            
            this.saveWallets();
            this.emit('gamificationReward', { amount: rewardAmount, token: rewardToken, type: data.type });
        }
    }

    handleSustainabilityReward(data) {
        if (!this.currentWallet) return;
        
        let rewardAmount = 0;
        let rewardToken = 'ECO';
        
        switch (data.action) {
            case 'carbon_reduction':
                rewardAmount = data.amount * 0.5; // 0.5 ECO per kg CO2 reduced
                break;
            case 'energy_saving':
                rewardAmount = data.amount * 0.1; // 0.1 ECO per kWh saved
                rewardToken = 'GREEN';
                break;
            case 'waste_reduction':
                rewardAmount = data.amount * 0.2; // 0.2 ECO per kg waste reduced
                break;
            case 'tree_planted':
                rewardAmount = data.amount * 10; // 10 ECO per tree
                break;
        }
        
        if (rewardAmount > 0) {
            const currentBalance = this.currentWallet.balances.get(rewardToken) || 0;
            this.currentWallet.balances.set(rewardToken, currentBalance + rewardAmount);
            
            this.saveWallets();
            this.emit('sustainabilityReward', { amount: rewardAmount, token: rewardToken, action: data.action });
        }
    }

    // Métodos de preços
    updateTokenPrices() {
        this.tokens.forEach((token, symbol) => {
            // Simula flutuação de preço
            const change = (Math.random() - 0.5) * 0.02; // ±1% change
            const newPrice = token.price * (1 + change);
            
            token.priceChange24h = change;
            token.price = Math.max(0.01, newPrice); // Preço mínimo
            token.marketCap = token.totalSupply * token.price;
        });
        
        this.emit('pricesUpdated', Object.fromEntries(this.tokens));
    }

    getTokenPrice(symbol) {
        const token = this.tokens.get(symbol);
        return token ? token.price : 0;
    }

    getPortfolioValue() {
        if (!this.currentWallet) return 0;
        
        let totalValue = 0;
        
        this.currentWallet.balances.forEach((balance, symbol) => {
            const price = this.getTokenPrice(symbol);
            totalValue += balance * price;
        });
        
        return totalValue;
    }

    // Métodos de relatório
    generatePaymentReport() {
        const wallets = Array.from(this.wallets.values());
        const transactions = Array.from(this.transactions.values());
        
        return {
            totalWallets: wallets.length,
            totalTransactions: transactions.length,
            totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
            averageTransactionValue: transactions.length > 0 ? 
                transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length : 0,
            stakingPools: this.stakingPools.size,
            totalStaked: Array.from(this.stakingPools.values())
                .reduce((sum, pool) => sum + pool.totalStaked, 0),
            liquidityPools: this.liquidityPools.size,
            totalLiquidity: Array.from(this.liquidityPools.values())
                .reduce((sum, pool) => sum + (pool.reserveA + pool.reserveB), 0),
            supportedTokens: this.tokens.size,
            totalMarketCap: Array.from(this.tokens.values())
                .reduce((sum, token) => sum + token.marketCap, 0)
        };
    }

    // Métodos de renderização
    renderPaymentInterface() {
        return `
            <div class="payment-system">
                <div class="payment-header">
                    <h3>Sistema de Pagamentos DeFi</h3>
                    <div class="wallet-selector">
                        ${this.renderWalletSelector()}
                    </div>
                </div>
                
                <div class="payment-content">
                    <div class="wallet-panel">
                        ${this.renderWalletPanel()}
                    </div>
                    
                    <div class="trading-panel">
                        ${this.renderTradingPanel()}
                    </div>
                    
                    <div class="staking-panel">
                        ${this.renderStakingPanel()}
                    </div>
                </div>
                
                <div class="payment-actions">
                    <button id="send-payment-btn" class="action-btn primary">
                        💸 Enviar
                    </button>
                    <button id="receive-payment-btn" class="action-btn">
                        📥 Receber
                    </button>
                    <button id="swap-tokens-btn" class="action-btn">
                        🔄 Trocar
                    </button>
                    <button id="stake-tokens-btn" class="action-btn">
                        🏦 Stake
                    </button>
                </div>
            </div>
        `;
    }

    renderWalletSelector() {
        const wallets = Array.from(this.wallets.values());
        
        return `
            <select id="wallet-selector" class="wallet-select">
                <option value="">Selecionar Carteira</option>
                ${wallets.map(wallet => `
                    <option value="${wallet.address}" 
                            ${wallet.address === this.currentWallet?.address ? 'selected' : ''}>
                        ${wallet.name} (${this.formatAddress(wallet.address)})
                    </option>
                `).join('')}
            </select>
            <button id="create-wallet-btn" class="create-wallet-btn">
                + Nova Carteira
            </button>
        `;
    }

    renderWalletPanel() {
        if (!this.currentWallet) {
            return '<div class="no-wallet">Selecione uma carteira</div>';
        }
        
        return `
            <div class="wallet-info">
                <h4>${this.currentWallet.name}</h4>
                <p class="wallet-address">${this.formatAddress(this.currentWallet.address)}</p>
                <div class="portfolio-value">
                    <span class="label">Valor Total:</span>
                    <span class="value">$${this.getPortfolioValue().toFixed(2)}</span>
                </div>
            </div>
            
            <div class="token-balances">
                <h5>Saldos</h5>
                ${this.renderTokenBalances()}
            </div>
            
            <div class="recent-transactions">
                <h5>Transações Recentes</h5>
                ${this.renderRecentTransactions()}
            </div>
        `;
    }

    renderTokenBalances() {
        if (!this.currentWallet) return '';
        
        const balances = Array.from(this.currentWallet.balances.entries())
            .filter(([symbol, balance]) => balance > 0)
            .sort(([,a], [,b]) => b - a);
        
        return balances.map(([symbol, balance]) => {
            const token = this.tokens.get(symbol);
            const value = balance * (token?.price || 0);
            
            return `
                <div class="balance-item">
                    <div class="token-info">
                        <span class="token-symbol">${symbol}</span>
                        <span class="token-name">${token?.name || symbol}</span>
                    </div>
                    <div class="balance-amount">
                        <span class="amount">${balance.toFixed(4)}</span>
                        <span class="value">$${value.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderRecentTransactions() {
        if (!this.currentWallet) return '';
        
        const recentTxs = this.currentWallet.transactions
            .slice(-5)
            .map(txId => this.transactions.get(txId))
            .filter(tx => tx)
            .reverse();
        
        return recentTxs.map(tx => {
            const isOutgoing = tx.from === this.currentWallet.address;
            
            return `
                <div class="transaction-item ${isOutgoing ? 'outgoing' : 'incoming'}">
                    <div class="tx-info">
                        <span class="tx-type">${isOutgoing ? 'Enviado' : 'Recebido'}</span>
                        <span class="tx-address">${this.formatAddress(isOutgoing ? tx.to : tx.from)}</span>
                    </div>
                    <div class="tx-amount">
                        <span class="amount">${isOutgoing ? '-' : '+'}${tx.amount} ${tx.token}</span>
                        <span class="status ${tx.status}">${tx.status}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTradingPanel() {
        return `
            <div class="trading-interface">
                <h4>Negociação</h4>
                
                <div class="token-prices">
                    <h5>Preços dos Tokens</h5>
                    ${this.renderTokenPrices()}
                </div>
                
                <div class="swap-interface">
                    <h5>Trocar Tokens</h5>
                    <div class="swap-form">
                        <div class="token-input">
                            <select id="from-token" class="token-select">
                                ${Array.from(this.tokens.keys()).map(symbol => 
                                    `<option value="${symbol}">${symbol}</option>`
                                ).join('')}
                            </select>
                            <input type="number" id="from-amount" placeholder="0.0" class="amount-input">
                        </div>
                        
                        <button class="swap-direction-btn">🔄</button>
                        
                        <div class="token-input">
                            <select id="to-token" class="token-select">
                                ${Array.from(this.tokens.keys()).map(symbol => 
                                    `<option value="${symbol}">${symbol}</option>`
                                ).join('')}
                            </select>
                            <input type="number" id="to-amount" placeholder="0.0" class="amount-input" readonly>
                        </div>
                        
                        <button id="execute-swap-btn" class="swap-btn">Trocar Tokens</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTokenPrices() {
        return Array.from(this.tokens.values()).map(token => {
            const changeClass = token.priceChange24h >= 0 ? 'positive' : 'negative';
            const changePercent = (token.priceChange24h * 100).toFixed(2);
            
            return `
                <div class="price-item">
                    <div class="token-info">
                        <span class="symbol">${token.symbol}</span>
                        <span class="name">${token.name}</span>
                    </div>
                    <div class="price-info">
                        <span class="price">$${token.price.toFixed(4)}</span>
                        <span class="change ${changeClass}">${changePercent}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderStakingPanel() {
        return `
            <div class="staking-interface">
                <h4>Staking & Yield Farming</h4>
                
                <div class="staking-pools">
                    <h5>Pools de Staking</h5>
                    ${this.renderStakingPools()}
                </div>
                
                <div class="user-stakes">
                    <h5>Suas Posições</h5>
                    ${this.renderUserStakes()}
                </div>
                
                <div class="liquidity-pools">
                    <h5>Pools de Liquidez</h5>
                    ${this.renderLiquidityPools()}
                </div>
            </div>
        `;
    }

    renderStakingPools() {
        return Array.from(this.stakingPools.values()).map(pool => `
            <div class="pool-item" data-pool-id="${pool.id}">
                <div class="pool-info">
                    <span class="pool-name">${pool.name}</span>
                    <span class="pool-token">${pool.token}</span>
                </div>
                <div class="pool-stats">
                    <span class="apy">${pool.apy}% APY</span>
                    <span class="tvl">TVL: ${pool.totalStaked.toLocaleString()}</span>
                </div>
                <button class="stake-btn" data-pool-id="${pool.id}">
                    Stake ${pool.token}
                </button>
            </div>
        `).join('');
    }

    renderUserStakes() {
        if (!this.currentWallet || this.currentWallet.stakingPositions.size === 0) {
            return '<p class="no-stakes">Nenhuma posição de staking</p>';
        }
        
        return Array.from(this.currentWallet.stakingPositions.values()).map(stake => {
            const pool = this.stakingPools.get(stake.poolId);
            const timeLeft = Math.max(0, stake.endDate - Date.now());
            const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
            
            return `
                <div class="stake-item" data-stake-id="${stake.id}">
                    <div class="stake-info">
                        <span class="pool-name">${pool?.name || stake.poolId}</span>
                        <span class="stake-amount">${stake.amount} ${stake.token}</span>
                    </div>
                    <div class="stake-status">
                        <span class="apy">${stake.apy}% APY</span>
                        <span class="time-left">${daysLeft > 0 ? `${daysLeft} dias` : 'Desbloqueado'}</span>
                    </div>
                    <div class="stake-actions">
                        <button class="claim-rewards-btn" data-stake-id="${stake.id}">
                            Resgatar Recompensas
                        </button>
                        ${daysLeft === 0 ? `
                            <button class="unstake-btn" data-stake-id="${stake.id}">
                                Unstake
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderLiquidityPools() {
        return Array.from(this.liquidityPools.values()).map(pool => `
            <div class="liquidity-pool-item" data-pool-id="${pool.id}">
                <div class="pool-info">
                    <span class="pool-pair">${pool.tokenA}/${pool.tokenB}</span>
                    <span class="pool-apy">${pool.apy.toFixed(1)}% APY</span>
                </div>
                <div class="pool-stats">
                    <span class="reserves">${pool.reserveA.toFixed(2)} ${pool.tokenA} / ${pool.reserveB.toFixed(2)} ${pool.tokenB}</span>
                </div>
                <button class="add-liquidity-btn" data-pool-id="${pool.id}">
                    Adicionar Liquidez
                </button>
            </div>
        `).join('');
    }

    // Métodos utilitários
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateTxHash() {
        return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    generateWalletAddress() {
        return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    generateTokenAddress() {
        return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    generatePrivateKey() {
        return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    deriveAddressFromPrivateKey(privateKey) {
        // Simulação - em produção usaria cryptografia real
        return '0x' + privateKey.slice(2, 42);
    }

    formatAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    saveWallets() {
        const wallets = Array.from(this.wallets.values()).map(wallet => ({
            ...wallet,
            balances: Object.fromEntries(wallet.balances),
            stakingPositions: Object.fromEntries(wallet.stakingPositions)
        }));
        localStorage.setItem('paymentWallets', JSON.stringify(wallets));
    }

    // Métodos de evento
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
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

    // Getters para status do sistema
    getSystemStatus() {
        return {
            connected: this.blockchain?.connected || false,
            network: this.blockchain?.network,
            totalWallets: this.wallets.size,
            totalTokens: this.tokens.size,
            stakingPools: this.stakingPools.size,
            liquidityPools: this.liquidityPools.size,
            totalTransactions: this.transactions.size
        };
    }

    getWalletStatus() {
        if (!this.currentWallet) return null;
        
        return {
            address: this.currentWallet.address,
            name: this.currentWallet.name,
            portfolioValue: this.getPortfolioValue(),
            tokenCount: Array.from(this.currentWallet.balances.values())
                .filter(balance => balance > 0).length,
            stakingPositions: this.currentWallet.stakingPositions.size,
            transactionCount: this.currentWallet.transactions.length
        };
    }

    // Cleanup
    cleanup() {
        this.saveWallets();
        this.wallets.clear();
        this.transactions.clear();
        this.stakingPools.clear();
        this.liquidityPools.clear();
    }
}

// Instância global
window.paymentSystem = new PaymentSystem();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (window.paymentSystem) {
        console.log('PaymentSystem loaded and ready');
    }
});

export default PaymentSystem;