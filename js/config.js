// ============================================
// 0xaddress - Configuración
// ============================================

// Redes predefinidas
const NETWORKS = {
    rollux: {
        id: 'rollux',
        name: 'Rollux',
        chainId: 570,
        rpcUrl: 'https://rpc.rollux.com',
        rpcUrlFallback: 'https://rollux.rpc.syscoin.org',
        wsUrl: 'wss://rpc.rollux.com/wss',
        wsUrlFallback: 'wss://rollux.rpc.syscoin.org/wss',
        explorer: 'https://explorer.rollux.com',
        currency: {
            name: 'Syscoin',
            symbol: 'SYS',
            decimals: 18
        },
        isDefault: true
    },
    syscoin: {
        id: 'syscoin',
        name: 'Syscoin NEVM',
        chainId: 57,
        rpcUrl: 'https://rpc.syscoin.org',
        rpcUrlFallback: 'https://syscoin.public-rpc.com',
        wsUrl: 'wss://rpc.syscoin.org/wss',
        explorer: 'https://explorer.syscoin.org',
        currency: {
            name: 'Syscoin',
            symbol: 'SYS',
            decimals: 18
        }
    },
    ethereum: {
        id: 'ethereum',
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: 'https://eth.llamarpc.com',
        rpcUrlFallback: 'https://rpc.ankr.com/eth',
        explorer: 'https://etherscan.io',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    polygon: {
        id: 'polygon',
        name: 'Polygon',
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        rpcUrlFallback: 'https://rpc.ankr.com/polygon',
        explorer: 'https://polygonscan.com',
        currency: {
            name: 'MATIC',
            symbol: 'POL',
            decimals: 18
        }
    },
    bsc: {
        id: 'bsc',
        name: 'BNB Smart Chain',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed.binance.org',
        rpcUrlFallback: 'https://rpc.ankr.com/bsc',
        explorer: 'https://bscscan.com',
        currency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        }
    },
    arbitrum: {
        id: 'arbitrum',
        name: 'Arbitrum One',
        chainId: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        rpcUrlFallback: 'https://rpc.ankr.com/arbitrum',
        explorer: 'https://arbiscan.io',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    optimism: {
        id: 'optimism',
        name: 'Optimism',
        chainId: 10,
        rpcUrl: 'https://mainnet.optimism.io',
        rpcUrlFallback: 'https://rpc.ankr.com/optimism',
        explorer: 'https://optimistic.etherscan.io',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    avalanche: {
        id: 'avalanche',
        name: 'Avalanche C-Chain',
        chainId: 43114,
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        rpcUrlFallback: 'https://rpc.ankr.com/avalanche',
        explorer: 'https://snowtrace.io',
        currency: {
            name: 'AVAX',
            symbol: 'AVAX',
            decimals: 18
        }
    },
    base: {
        id: 'base',
        name: 'Base',
        chainId: 8453,
        rpcUrl: 'https://mainnet.base.org',
        rpcUrlFallback: 'https://base.llamarpc.com',
        explorer: 'https://basescan.org',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    soneium: {
        id: 'soneium',
        name: 'Soneium (Sony)',
        chainId: 1868,
        rpcUrl: 'https://rpc.soneium.org',
        explorer: 'https://soneium.blockscout.com',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    fantom: {
        id: 'fantom',
        name: 'Fantom Opera',
        chainId: 250,
        rpcUrl: 'https://rpc.ftm.tools',
        explorer: 'https://ftmscan.com',
        currency: {
            name: 'Fantom',
            symbol: 'FTM',
            decimals: 18
        }
    },
    cronos: {
        id: 'cronos',
        name: 'Cronos',
        chainId: 25,
        rpcUrl: 'https://evm.cronos.org',
        explorer: 'https://cronoscan.com',
        currency: {
            name: 'Cronos',
            symbol: 'CRO',
            decimals: 18
        }
    },
    linea: {
        id: 'linea',
        name: 'Linea',
        chainId: 59144,
        rpcUrl: 'https://rpc.linea.build',
        explorer: 'https://lineascan.build',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    zksync: {
        id: 'zksync',
        name: 'zkSync Era',
        chainId: 324,
        rpcUrl: 'https://mainnet.era.zksync.io',
        explorer: 'https://explorer.zksync.io',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    mantle: {
        id: 'mantle',
        name: 'Mantle',
        chainId: 5000,
        rpcUrl: 'https://rpc.mantle.xyz',
        explorer: 'https://explorer.mantle.xyz',
        currency: {
            name: 'Mantle',
            symbol: 'MNT',
            decimals: 18
        }
    },
    celo: {
        id: 'celo',
        name: 'Celo',
        chainId: 42220,
        rpcUrl: 'https://forno.celo.org',
        explorer: 'https://celoscan.io',
        currency: {
            name: 'Celo',
            symbol: 'CELO',
            decimals: 18
        }
    },
    gnosis: {
        id: 'gnosis',
        name: 'Gnosis Chain',
        chainId: 100,
        rpcUrl: 'https://rpc.gnosischain.com',
        explorer: 'https://gnosisscan.io',
        currency: {
            name: 'xDAI',
            symbol: 'xDAI',
            decimals: 18
        }
    },
    scroll: {
        id: 'scroll',
        name: 'Scroll',
        chainId: 534352,
        rpcUrl: 'https://rpc.scroll.io',
        explorer: 'https://scrollscan.com',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    blast: {
        id: 'blast',
        name: 'Blast',
        chainId: 81457,
        rpcUrl: 'https://rpc.blast.io',
        explorer: 'https://blastscan.io',
        currency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    sepolia: {
        id: 'sepolia',
        name: 'Sepolia Testnet',
        chainId: 11155111,
        rpcUrl: 'https://rpc.sepolia.org',
        explorer: 'https://sepolia.etherscan.io',
        currency: {
            name: 'Sepolia ETH',
            symbol: 'SEP',
            decimals: 18
        }
    }
};

const CONFIG = {
    // Configuración de almacenamiento
    storage: {
        encryptedKey: '0xaddress_encrypted_key',
        address: '0xaddress_address',
        contracts: '0xaddress_contracts',
        settings: '0xaddress_settings',
        network: '0xaddress_network',
        customNetworks: '0xaddress_custom_networks',
        activity: '0xaddress_activity'
    },
    
    // Tips educativos
    educationalTips: [
        "Las wallets no guardan tokens, solo las claves para acceder a ellos en la blockchain.",
        "Una clave privada es como una contraseña que nunca debes compartir con nadie.",
        "La dirección pública es como tu número de cuenta: puedes compartirla para recibir tokens.",
        "Cada transacción en blockchain es inmutable y verificable públicamente.",
        "El gas es la tarifa que pagas a los validadores por procesar tu transacción.",
        "Los smart contracts son programas que se ejecutan automáticamente en la blockchain.",
        "ERC20 es el estándar para tokens fungibles (intercambiables entre sí).",
        "ERC721 es el estándar para NFTs (tokens únicos y no fungibles).",
        "Siempre verifica la dirección antes de enviar una transacción.",
        "DYOR: Do Your Own Research antes de interactuar con cualquier contrato."
    ],
    
    // Endpoints del backend PHP
    api: {
        getAbi: 'php/get_abi.php',
        saveActivity: 'php/save_activity.php'
    }
};

// ============================================
// Network Manager
// ============================================

const NetworkManager = {
    // Key para guardar modificaciones de redes predefinidas
    MODIFIED_NETWORKS_KEY: '0xaddress_modified_networks',
    
    // Obtener modificaciones guardadas de redes predefinidas
    getModifiedNetworks() {
        const saved = localStorage.getItem(this.MODIFIED_NETWORKS_KEY);
        return saved ? JSON.parse(saved) : {};
    },
    
    // Guardar modificación de una red predefinida
    saveModifiedNetwork(networkId, modifications) {
        const modified = this.getModifiedNetworks();
        modified[networkId] = { ...modified[networkId], ...modifications };
        localStorage.setItem(this.MODIFIED_NETWORKS_KEY, JSON.stringify(modified));
    },
    
    // Obtener todas las redes (predefinidas con modificaciones + personalizadas)
    getAllNetworks() {
        const customNetworks = this.getCustomNetworks();
        const modifiedNetworks = this.getModifiedNetworks();
        
        // Aplicar modificaciones a redes predefinidas
        const networks = {};
        for (const [id, network] of Object.entries(NETWORKS)) {
            networks[id] = { ...network, ...(modifiedNetworks[id] || {}) };
        }
        
        return { ...networks, ...customNetworks };
    },
    
    // Obtener redes personalizadas
    getCustomNetworks() {
        const saved = localStorage.getItem(CONFIG.storage.customNetworks);
        return saved ? JSON.parse(saved) : {};
    },
    
    // Guardar red personalizada
    saveCustomNetwork(network) {
        const customNetworks = this.getCustomNetworks();
        customNetworks[network.id] = network;
        localStorage.setItem(CONFIG.storage.customNetworks, JSON.stringify(customNetworks));
    },
    
    // Eliminar red personalizada
    removeCustomNetwork(networkId) {
        const customNetworks = this.getCustomNetworks();
        delete customNetworks[networkId];
        localStorage.setItem(CONFIG.storage.customNetworks, JSON.stringify(customNetworks));
    },
    
    // Restaurar red predefinida a valores originales
    resetNetworkToDefault(networkId) {
        if (NETWORKS[networkId]) {
            const modified = this.getModifiedNetworks();
            delete modified[networkId];
            localStorage.setItem(this.MODIFIED_NETWORKS_KEY, JSON.stringify(modified));
            return true;
        }
        return false;
    },
    
    // Obtener red actual
    getCurrentNetwork() {
        const savedNetworkId = localStorage.getItem(CONFIG.storage.network);
        const allNetworks = this.getAllNetworks();
        
        if (savedNetworkId && allNetworks[savedNetworkId]) {
            return allNetworks[savedNetworkId];
        }
        
        // Default: Rollux
        return NETWORKS.rollux;
    },
    
    // Establecer red actual
    setCurrentNetwork(networkId) {
        const allNetworks = this.getAllNetworks();
        if (allNetworks[networkId]) {
            localStorage.setItem(CONFIG.storage.network, networkId);
            return allNetworks[networkId];
        }
        return null;
    },
    
    // Validar configuración de red
    validateNetwork(network) {
        const required = ['name', 'chainId', 'rpcUrl', 'explorer'];
        for (const field of required) {
            if (!network[field]) {
                return { valid: false, error: `Falta el campo: ${field}` };
            }
        }
        
        if (isNaN(parseInt(network.chainId))) {
            return { valid: false, error: 'Chain ID debe ser un número' };
        }
        
        if (!network.rpcUrl.startsWith('http')) {
            return { valid: false, error: 'RPC URL inválida' };
        }
        
        return { valid: true };
    },
    
    // Crear ID único para red personalizada
    createNetworkId(name) {
        return 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
};

// Red actual (se actualiza dinámicamente)
let NETWORK = NetworkManager.getCurrentNetwork();
