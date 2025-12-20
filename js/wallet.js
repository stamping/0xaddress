// ============================================
// 0xaddress - Wallet Core Logic
// ============================================

class Wallet {
    constructor() {
        this.provider = null;
        this.wsProvider = null;  // WebSocket provider para eventos
        this.address = null;
        this.contracts = [];
        this.eventListeners = [];
        this.nativeBalance = '0';
        this.isInitialized = false;
        this.listenersActive = false;
        this.nativeBalanceInterval = null;
        this.useWebSocket = false;
    }

    // ========================================
    // Inicialización
    // ========================================
    
    async init() {
        try {
            const rpcUrl = NETWORK.rpcUrl;
            const rpcFallback = NETWORK.rpcUrlFallback;
            const wsUrl = NETWORK.wsUrl || null;
            const wsFallback = NETWORK.wsUrlFallback || null;
            
            // Intentar WebSocket si hay URL configurada
            if (wsUrl) {
                // Intentar WS principal
                try {
                    console.log('🔌 Intentando WebSocket:', wsUrl);
                    this.wsProvider = new ethers.WebSocketProvider(wsUrl);
                    
                    const wsTimeout = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('WS timeout')), 5000)
                    );
                    await Promise.race([this.wsProvider.getNetwork(), wsTimeout]);
                    
                    this.provider = this.wsProvider;
                    this.useWebSocket = true;
                    console.log('✅ WebSocket conectado:', wsUrl);
                } catch (wsError) {
                    console.log('⚠️ WebSocket principal falló:', wsError.message);
                    
                    // Intentar WS fallback
                    if (wsFallback) {
                        try {
                            console.log('🔄 Intentando WebSocket secundario:', wsFallback);
                            this.wsProvider = new ethers.WebSocketProvider(wsFallback);
                            
                            const wsTimeout2 = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('WS timeout')), 5000)
                            );
                            await Promise.race([this.wsProvider.getNetwork(), wsTimeout2]);
                            
                            this.provider = this.wsProvider;
                            this.useWebSocket = true;
                            console.log('✅ WebSocket secundario conectado:', wsFallback);
                        } catch (wsFallbackError) {
                            console.log('⚠️ WebSocket secundario falló:', wsFallbackError.message);
                            this.wsProvider = null;
                            this.useWebSocket = false;
                        }
                    } else {
                        this.wsProvider = null;
                        this.useWebSocket = false;
                    }
                }
            }
            
            // Usar HTTP si WS no está disponible
            if (!this.useWebSocket) {
                let rpcConnected = false;
                
                // Intentar RPC principal
                try {
                    console.log('🌐 Conectando RPC HTTP:', rpcUrl);
                    this.provider = new ethers.JsonRpcProvider(rpcUrl);
                    
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('RPC timeout')), 5000)
                    );
                    await Promise.race([this.provider.getNetwork(), timeoutPromise]);
                    rpcConnected = true;
                    console.log('✅ RPC HTTP conectado:', rpcUrl);
                } catch (rpcError) {
                    console.log('⚠️ RPC principal falló:', rpcError.message);
                    
                    // Intentar RPC fallback
                    if (rpcFallback) {
                        try {
                            console.log('🔄 Intentando RPC secundario:', rpcFallback);
                            this.provider = new ethers.JsonRpcProvider(rpcFallback);
                            
                            const timeoutPromise2 = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('RPC timeout')), 5000)
                            );
                            await Promise.race([this.provider.getNetwork(), timeoutPromise2]);
                            rpcConnected = true;
                            console.log('✅ RPC secundario conectado:', rpcFallback);
                        } catch (fallbackError) {
                            console.log('⚠️ RPC secundario falló:', fallbackError.message);
                        }
                    }
                    
                    if (!rpcConnected) {
                        console.log('⚠️ Sin conexión, modo offline');
                    }
                }
            }
            
            // Cargar dirección si existe
            const savedAddress = localStorage.getItem(CONFIG.storage.address);
            if (savedAddress) {
                this.address = savedAddress;
            }
            
            // Cargar contratos guardados
            this.loadContracts();
            
            this.isInitialized = true;
            console.log('✅ Wallet inicializada en', NETWORK.name, this.useWebSocket ? '(WebSocket)' : '(HTTP)');
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando wallet:', error);
            this.isInitialized = true;
            return true;
        }
    }
    
    // Convertir URL HTTP a WebSocket (ya no se usa automáticamente)
    getWebSocketUrl(httpUrl) {
        if (!httpUrl) return null;
        try {
            return httpUrl
                .replace('https://', 'wss://')
                .replace('http://', 'ws://');
        } catch (e) {
            return null;
        }
    }

    // ========================================
    // Gestión de Claves
    // ========================================
    
    generateWallet(password) {
        try {
            // Generar wallet con mnemonic BIP39
            const wallet = ethers.Wallet.createRandom();
            const mnemonic = wallet.mnemonic.phrase;
            const privateKey = wallet.privateKey;
            
            // Encriptar private key con PBKDF2 300k iteraciones
            const encryptedKey = this.encryptPrivateKey(privateKey, password);
            
            // Encriptar mnemonic también con PBKDF2
            const encryptedMnemonic = this.encryptWithPBKDF2(mnemonic, password, 300000);
            
            localStorage.setItem(CONFIG.storage.encryptedKey, JSON.stringify(encryptedKey));
            localStorage.setItem(CONFIG.storage.address, wallet.address);
            localStorage.setItem('0xaddress_mnemonic', JSON.stringify(encryptedMnemonic));
            
            this.address = wallet.address;
            console.log('✅ Wallet generada con PBKDF2 300k:', this.address);
            
            return { address: wallet.address, mnemonic: mnemonic, success: true };
        } catch (error) {
            console.error('❌ Error generando wallet:', error);
            throw error;
        }
    }
    
    // Obtener mnemonic (requiere password)
    getMnemonic(password) {
        try {
            const encryptedMnemonicRaw = localStorage.getItem('0xaddress_mnemonic');
            if (!encryptedMnemonicRaw) return null;
            
            // Detectar formato: PBKDF2 (objeto JSON) o legacy (string simple)
            let mnemonic;
            try {
                const encryptedMnemonic = JSON.parse(encryptedMnemonicRaw);
                // Formato PBKDF2
                mnemonic = this.decryptWithPBKDF2(encryptedMnemonic, password);
            } catch (parseError) {
                // Formato legacy (CryptoJS.AES simple)
                const bytes = CryptoJS.AES.decrypt(encryptedMnemonicRaw, password);
                mnemonic = bytes.toString(CryptoJS.enc.Utf8);
            }
            
            if (!mnemonic || mnemonic.split(' ').length < 12) {
                throw new Error('Error descifrando mnemonic');
            }
            return mnemonic;
        } catch (error) {
            console.error('❌ Error obteniendo mnemonic:', error);
            return null;
        }
    }
    
    // Verificar si tiene mnemonic
    hasMnemonic() {
        return localStorage.getItem('0xaddress_mnemonic') !== null;
    }
    
    // Importar desde mnemonic
    importFromMnemonic(mnemonic, password) {
        try {
            // Validar mnemonic
            const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
            const privateKey = wallet.privateKey;
            
            // Encriptar con PBKDF2
            const encryptedKey = this.encryptPrivateKey(privateKey, password);
            const encryptedMnemonic = this.encryptWithPBKDF2(mnemonic.trim(), password);
            
            localStorage.setItem(CONFIG.storage.encryptedKey, JSON.stringify(encryptedKey));
            localStorage.setItem(CONFIG.storage.address, wallet.address);
            localStorage.setItem('0xaddress_mnemonic', JSON.stringify(encryptedMnemonic));
            
            this.address = wallet.address;
            console.log('✅ Wallet importada desde mnemonic:', this.address);
            
            return { address: wallet.address, success: true };
        } catch (error) {
            console.error('❌ Error importando mnemonic:', error);
            throw new Error('Frase de recuperación inválida');
        }
    }
    
    // PBKDF2 con 300,000 iteraciones para cifrado local
    encryptWithPBKDF2(data, password, iterations = 300000) {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const iv = CryptoJS.lib.WordArray.random(128 / 8);
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: iterations,
            hasher: CryptoJS.algo.SHA256
        });
        
        const encrypted = CryptoJS.AES.encrypt(data, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        return {
            ct: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
            iv: iv.toString(CryptoJS.enc.Hex),
            salt: salt.toString(CryptoJS.enc.Hex),
            iterations: iterations
        };
    }
    
    decryptWithPBKDF2(encryptedData, password) {
        try {
            const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
            const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
            const iterations = encryptedData.iterations || 300000;
            
            const key = CryptoJS.PBKDF2(password, salt, {
                keySize: 256 / 32,
                iterations: iterations,
                hasher: CryptoJS.algo.SHA256
            });
            
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: CryptoJS.enc.Base64.parse(encryptedData.ct) },
                key,
                { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );
            
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            throw new Error('Error de descifrado');
        }
    }
    
    encryptPrivateKey(privateKey, password) {
        return this.encryptWithPBKDF2(privateKey, password, 300000);
    }
    
    decryptPrivateKey(password) {
        try {
            const encryptedKeyRaw = localStorage.getItem(CONFIG.storage.encryptedKey);
            if (!encryptedKeyRaw) throw new Error('No hay clave cifrada almacenada');
            
            // Detectar formato: PBKDF2 (objeto JSON) o legacy (string simple)
            let privateKey;
            try {
                const encryptedKey = JSON.parse(encryptedKeyRaw);
                // Formato PBKDF2
                privateKey = this.decryptWithPBKDF2(encryptedKey, password);
            } catch (parseError) {
                // Formato legacy (CryptoJS.AES simple)
                const bytes = CryptoJS.AES.decrypt(encryptedKeyRaw, password);
                privateKey = bytes.toString(CryptoJS.enc.Utf8);
            }
            
            if (!privateKey || !privateKey.startsWith('0x')) {
                throw new Error('Contraseña incorrecta');
            }
            return privateKey;
        } catch (error) {
            console.error('❌ Error descifrando:', error);
            throw new Error('Contraseña incorrecta');
        }
    }
    
    verifyPassword(password) {
        try {
            const privateKey = this.decryptPrivateKey(password);
            return privateKey && privateKey.startsWith('0x');
        } catch {
            return false;
        }
    }
    
    getSigner(password) {
        const privateKey = this.decryptPrivateKey(password);
        return new ethers.Wallet(privateKey, this.provider);
    }

    getPrivateKey(password) {
        return this.decryptPrivateKey(password);
    }
    
    hasWallet() {
        return localStorage.getItem(CONFIG.storage.encryptedKey) !== null;
    }
    
    resetWallet() {
        // Borrar wallet
        localStorage.removeItem(CONFIG.storage.encryptedKey);
        localStorage.removeItem(CONFIG.storage.address);
        // Borrar contratos
        localStorage.removeItem(CONFIG.storage.contracts);
        // Borrar actividad
        localStorage.removeItem(CONFIG.storage.activity);
        // Borrar redes personalizadas
        localStorage.removeItem(CONFIG.storage.customNetworks);
        // Resetear red a default
        localStorage.removeItem(CONFIG.storage.network);
        // Borrar sesión
        localStorage.removeItem('0xaddress_session_expiry');
        
        // Notificar al background para limpiar chrome.storage
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            try {
                chrome.runtime.sendMessage({ type: 'POPUP_RESET' });
            } catch (e) {
                console.log('No extension context for reset');
            }
        }
        
        this.address = null;
        this.contracts = [];
        this.stopAllEventListeners();
        
        console.log('🗑️ Wallet reseteada completamente');
    }

    // ========================================
    // Balance y Transacciones
    // ========================================
    
    async getNativeBalance() {
        try {
            if (!this.address) return '0';
            const balance = await this.provider.getBalance(this.address);
            this.nativeBalance = ethers.formatEther(balance);
            return this.nativeBalance;
        } catch (error) {
            // Usar warn en lugar de error para no contaminar la consola de errores
            console.log('⚠️ No se pudo obtener balance:', error.message || error);
            return this.nativeBalance || '0';
        }
    }
    
    async sendNative(to, amount, password) {
        try {
            const signer = this.getSigner(password);
            const network = NetworkManager.getCurrentNetwork();
            const symbol = network.currency?.symbol || 'ETH';
            
            const tx = await signer.sendTransaction({
                to: to,
                value: ethers.parseEther(amount.toString())
            });
            
            console.log('📤 Transacción enviada:', tx.hash);
            const receipt = await tx.wait();
            console.log('✅ Transacción confirmada:', receipt.hash);
            
            // Registrar actividad
            this.logSentTransaction('native', to, amount, symbol, tx.hash);
            
            return { hash: tx.hash, receipt: receipt, success: true };
        } catch (error) {
            console.error('❌ Error enviando:', error);
            throw error;
        }
    }
    
    async estimateNativeGas(to, amount) {
        try {
            const gasEstimate = await this.provider.estimateGas({
                from: this.address,
                to: to,
                value: ethers.parseEther(amount.toString())
            });
            
            const feeData = await this.provider.getFeeData();
            const gasCost = gasEstimate * feeData.gasPrice;
            
            // formatGwei no existe en ethers v6, usar formatUnits
            const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
            
            return {
                gasLimit: gasEstimate.toString(),
                gasPrice: gasPriceGwei,
                totalCost: ethers.formatEther(gasCost)
            };
        } catch (error) {
            console.error('❌ Error estimando gas:', error);
            return null;
        }
    }

    // ========================================
    // Contratos ERC20 y ERC721
    // ========================================
    
    async addContract(address, type) {
        try {
            // Normalizar dirección
            address = address.trim();
            
            // Obtener chainId de la red actual
            const currentNetwork = NetworkManager.getCurrentNetwork();
            const chainId = currentNetwork.chainId;
            
            // Verificar si ya existe en la misma red
            const exists = this.contracts.find(c => 
                c.address.toLowerCase() === address.toLowerCase() &&
                (c.chainId === chainId || !c.chainId)
            );
            if (exists) {
                throw new Error('Contrato ya agregado en esta red');
            }
            
            const abi = type === 'ERC20' ? ERC20_ABI : ERC721_ABI;
            const contract = new ethers.Contract(address, abi, this.provider);
            
            let name = 'Unknown';
            let symbol = 'UNK';
            let decimals = 0;
            
            // Obtener nombre con manejo de errores
            try {
                name = await contract.name();
            } catch (e) {
                console.warn('No se pudo obtener nombre del contrato');
                name = `${type} ${address.slice(0, 6)}...${address.slice(-4)}`;
            }
            
            // Obtener símbolo con manejo de errores
            try {
                symbol = await contract.symbol();
            } catch (e) {
                console.warn('No se pudo obtener símbolo del contrato');
                symbol = type === 'ERC20' ? 'TKN' : 'NFT';
            }
            
            // Obtener decimales para ERC20 (convertir BigInt a Number)
            if (type === 'ERC20') {
                try {
                    const dec = await contract.decimals();
                    decimals = Number(dec);
                } catch (e) {
                    console.warn('No se pudo obtener decimales, usando 18');
                    decimals = 18;
                }
            }
            
            const contractData = {
                address: address,
                type: type,
                name: name,
                symbol: symbol,
                decimals: decimals,
                chainId: chainId,
                addedAt: Date.now()
            };
            
            this.contracts.push(contractData);
            this.saveContracts();
            this.setupContractEvents(contractData);
            
            console.log('✅ Contrato agregado:', contractData);
            return contractData;
        } catch (error) {
            console.error('❌ Error agregando contrato:', error);
            throw error;
        }
    }
    
    async getTokenBalance(contractAddress) {
        try {
            const contract = new ethers.Contract(contractAddress, ERC20_ABI, this.provider);
            const balance = await contract.balanceOf(this.address);
            const savedContract = this.contracts.find(c => c.address.toLowerCase() === contractAddress.toLowerCase());
            // Manejar decimals = 0 correctamente (no usar || porque 0 es falsy)
            const decimals = savedContract && savedContract.decimals !== undefined ? savedContract.decimals : 18;
            return ethers.formatUnits(balance, decimals);
        } catch (error) {
            console.error('❌ Error obteniendo balance token:', error);
            return '0';
        }
    }
    
    async sendToken(contractAddress, to, amount, password) {
        try {
            const signer = this.getSigner(password);
            const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
            const savedContract = this.contracts.find(c => c.address.toLowerCase() === contractAddress.toLowerCase());
            // Manejar decimals = 0 correctamente
            const decimals = savedContract && savedContract.decimals !== undefined ? savedContract.decimals : 18;
            const symbol = savedContract ? savedContract.symbol : 'TOKEN';
            const amountWei = ethers.parseUnits(amount.toString(), decimals);
            
            const tx = await contract.transfer(to, amountWei);
            console.log('📤 Transacción ERC20 enviada:', tx.hash);
            const receipt = await tx.wait();
            console.log('✅ Transacción ERC20 confirmada:', receipt.hash);
            
            // Registrar actividad
            this.logSentTransaction('ERC20', to, amount, symbol, tx.hash);
            
            return { hash: tx.hash, receipt: receipt, success: true };
        } catch (error) {
            console.error('❌ Error enviando token:', error);
            throw error;
        }
    }
    
    async estimateTokenGas(contractAddress, to, amount) {
        try {
            const contract = new ethers.Contract(contractAddress, ERC20_ABI, this.provider);
            const savedContract = this.contracts.find(c => c.address.toLowerCase() === contractAddress.toLowerCase());
            // Manejar decimals = 0 correctamente
            const decimals = savedContract && savedContract.decimals !== undefined ? savedContract.decimals : 18;
            const amountWei = ethers.parseUnits(amount.toString(), decimals);
            
            const gasEstimate = await contract.transfer.estimateGas(to, amountWei, { from: this.address });
            const feeData = await this.provider.getFeeData();
            const gasCost = gasEstimate * feeData.gasPrice;
            
            // formatGwei no existe en ethers v6, usar formatUnits
            const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
            
            return {
                gasLimit: gasEstimate.toString(),
                gasPrice: gasPriceGwei,
                totalCost: ethers.formatEther(gasCost)
            };
        } catch (error) {
            console.error('❌ Error estimando gas token:', error);
            return null;
        }
    }

    // ========================================
    // NFTs (ERC721)
    // ========================================
    
    async getNFTs(contractAddress) {
        try {
            const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.provider);
            let balance = 0;
            
            try {
                balance = Number(await contract.balanceOf(this.address));
            } catch (e) {
                console.warn('No se pudo obtener balance de NFT');
                return [];
            }
            
            console.log(`Balance de NFTs en ${contractAddress}: ${balance}`);
            
            if (balance === 0) return [];
            
            const nfts = [];
            
            // Intentar método 1: tokenOfOwnerByIndex (ERC721Enumerable)
            let useEnumerable = true;
            try {
                await contract.tokenOfOwnerByIndex(this.address, 0);
            } catch (e) {
                useEnumerable = false;
                console.log('Contrato no soporta Enumerable, buscando por eventos Transfer...');
            }
            
            if (useEnumerable) {
                for (let i = 0; i < balance; i++) {
                    try {
                        const tokenId = await contract.tokenOfOwnerByIndex(this.address, i);
                        const nftData = await this.getNFTData(contract, tokenId);
                        nfts.push(nftData);
                    } catch (e) {
                        console.log('Error obteniendo token en índice', i);
                    }
                }
            } else {
                // Método alternativo: buscar eventos Transfer hacia esta dirección
                try {
                    // Buscar todos los eventos Transfer donde el destinatario es nuestra dirección
                    const filterTo = contract.filters.Transfer(null, this.address);
                    
                    // Obtener el bloque actual
                    const currentBlock = await this.provider.getBlockNumber();
                    // Buscar en los últimos 50000 bloques o desde el inicio
                    const fromBlock = Math.max(0, currentBlock - 50000);
                    
                    console.log(`Buscando eventos desde bloque ${fromBlock} hasta ${currentBlock}`);
                    
                    const events = await contract.queryFilter(filterTo, fromBlock, currentBlock);
                    console.log(`Encontrados ${events.length} eventos Transfer`);
                    
                    // Extraer tokenIds únicos
                    const tokenIdsToCheck = new Set();
                    for (const event of events) {
                        if (event.args && event.args[2] !== undefined) {
                            tokenIdsToCheck.add(event.args[2].toString());
                        }
                    }
                    
                    console.log(`TokenIds a verificar: ${Array.from(tokenIdsToCheck).join(', ')}`);
                    
                    // Verificar propiedad actual de cada tokenId
                    for (const tokenIdStr of tokenIdsToCheck) {
                        try {
                            const owner = await contract.ownerOf(tokenIdStr);
                            if (owner.toLowerCase() === this.address.toLowerCase()) {
                                console.log(`Token ${tokenIdStr} es nuestro`);
                                const nftData = await this.getNFTData(contract, tokenIdStr);
                                nfts.push(nftData);
                            }
                        } catch (e) {
                            // Token puede haber sido quemado o transferido
                            console.log(`Token ${tokenIdStr} ya no existe o no es nuestro`);
                        }
                    }
                    
                    // Si no encontramos eventos, intentar tokenIds secuenciales (0, 1, 2...)
                    if (nfts.length === 0 && balance > 0) {
                        console.log('Intentando búsqueda secuencial de tokenIds...');
                        for (let tokenId = 0; tokenId < 100 && nfts.length < balance; tokenId++) {
                            try {
                                const owner = await contract.ownerOf(tokenId);
                                if (owner.toLowerCase() === this.address.toLowerCase()) {
                                    const nftData = await this.getNFTData(contract, tokenId);
                                    nfts.push(nftData);
                                    console.log(`Encontrado NFT #${tokenId}`);
                                }
                            } catch (e) {
                                // Token no existe
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error buscando NFTs:', e);
                }
            }
            
            console.log(`Total NFTs encontrados: ${nfts.length}`);
            return nfts;
        } catch (error) {
            console.error('❌ Error obteniendo NFTs:', error);
            return [];
        }
    }
    
    // Obtener datos de un NFT individual
    async getNFTData(contract, tokenId) {
        let tokenURI = '';
        let metadata = null;
        let image = null;
        
        try {
            tokenURI = await contract.tokenURI(tokenId);
            console.log(`TokenURI para #${tokenId}: ${tokenURI.substring(0, 100)}...`);
            
            // Convertir IPFS a HTTP
            if (tokenURI.startsWith('ipfs://')) {
                tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            
            // Verificar si es data URI (base64 JSON)
            if (tokenURI.startsWith('data:application/json;base64,')) {
                const base64Data = tokenURI.split(',')[1];
                metadata = JSON.parse(atob(base64Data));
                image = metadata?.image || null;
            } 
            // JSON inline
            else if (tokenURI.startsWith('data:application/json,')) {
                const jsonData = decodeURIComponent(tokenURI.split(',')[1]);
                metadata = JSON.parse(jsonData);
                image = metadata?.image || null;
            }
            // Es imagen en base64
            else if (tokenURI.startsWith('data:image')) {
                image = tokenURI;
            } 
            // Es directamente una URL de imagen
            else if (tokenURI.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)(\?.*)?$/i)) {
                image = tokenURI;
            } 
            // Es una URL, intentar obtener
            else if (tokenURI.startsWith('http')) {
                try {
                    const response = await fetch(tokenURI);
                    const contentType = response.headers.get('content-type') || '';
                    
                    if (contentType.includes('application/json') || contentType.includes('text/plain')) {
                        const text = await response.text();
                        try {
                            metadata = JSON.parse(text);
                            image = metadata?.image || null;
                            
                            if (image && image.startsWith('ipfs://')) {
                                image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                            }
                        } catch (e) {
                            // No es JSON válido, puede ser texto con URL de imagen
                            if (text.match(/^https?:\/\//)) {
                                image = text.trim();
                            }
                        }
                    } else if (contentType.includes('image')) {
                        image = tokenURI;
                    } else {
                        // Asumir que es imagen
                        image = tokenURI;
                    }
                } catch (e) {
                    console.log('Error fetching tokenURI, asumiendo imagen:', e.message);
                    image = tokenURI;
                }
            }
            
            // Convertir IPFS en imagen si es necesario
            if (image && image.startsWith('ipfs://')) {
                image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            
        } catch (e) {
            console.log('No se pudo obtener tokenURI para token', tokenId.toString());
        }
        
        return {
            tokenId: tokenId.toString(),
            tokenURI: tokenURI,
            metadata: metadata,
            image: image,
            name: metadata?.name || `#${tokenId.toString()}`
        };
    }
    
    async getNFTBalance(contractAddress) {
        try {
            const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.provider);
            const balance = await contract.balanceOf(this.address);
            return Number(balance);
        } catch (error) {
            console.error('❌ Error obteniendo balance NFT:', error);
            return 0;
        }
    }
    
    async sendNFT(contractAddress, to, tokenId, password) {
        try {
            const signer = this.getSigner(password);
            const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);
            const savedContract = this.contracts.find(c => c.address.toLowerCase() === contractAddress.toLowerCase());
            const symbol = savedContract ? savedContract.symbol : 'NFT';
            
            const tx = await contract.transferFrom(this.address, to, tokenId);
            console.log('📤 Transacción NFT enviada:', tx.hash);
            const receipt = await tx.wait();
            console.log('✅ Transacción NFT confirmada:', receipt.hash);
            
            // Registrar actividad
            this.logSentTransaction('ERC721', to, '1', symbol, tx.hash, tokenId);
            
            return { hash: tx.hash, receipt: receipt, success: true };
        } catch (error) {
            console.error('❌ Error enviando NFT:', error);
            throw error;
        }
    }

    // ========================================
    // Gestión de Eventos
    // ========================================
    
    setupContractEvents(contractData) {
        try {
            const abi = contractData.type === 'ERC20' ? ERC20_ABI : ERC721_ABI;
            const contract = new ethers.Contract(contractData.address, abi, this.provider);
            const filterTo = contract.filters.Transfer(null, this.address);
            
            const listener = (from, to, value, event) => {
                console.log('📥 Transferencia recibida:', {
                    from, to,
                    value: contractData.type === 'ERC20' 
                        ? ethers.formatUnits(value, contractData.decimals || 18)
                        : value.toString(),
                    type: contractData.type
                });
                
                window.dispatchEvent(new CustomEvent('tokenReceived', {
                    detail: {
                        contract: contractData,
                        from,
                        value: contractData.type === 'ERC20' 
                            ? ethers.formatUnits(value, contractData.decimals || 18)
                            : value.toString(),
                        txHash: event.log?.transactionHash || event.transactionHash
                    }
                }));
            };
            
            contract.on(filterTo, listener);
            this.eventListeners.push({ contract, filter: filterTo, listener, type: contractData.type, symbol: contractData.symbol });
            console.log('👂 Listener configurado para', contractData.symbol, `(${contractData.type})`);
            
            return true;
        } catch (error) {
            console.error('❌ Error configurando eventos para', contractData.symbol, ':', error);
            return false;
        }
    }
    
    setupNativeEvents() {
        // No iniciar eventos si es popup de pending (para dApps)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pending') === 'true') {
            return;
        }
        
        // Limpiar interval anterior si existe
        if (this.nativeBalanceInterval) {
            clearInterval(this.nativeBalanceInterval);
            this.nativeBalanceInterval = null;
        }
        
        // Si tenemos WebSocket, suscribirse a nuevos bloques
        if (this.useWebSocket && this.wsProvider) {
            try {
                this.wsProvider.removeAllListeners('block');
                
                this.wsProvider.on('block', async (blockNumber) => {
                    if (document.hidden) return;
                    
                    try {
                        const oldBalance = this.nativeBalance;
                        await this.getNativeBalance();
                        
                        if (oldBalance !== '0' && oldBalance !== this.nativeBalance) {
                            const diff = parseFloat(this.nativeBalance) - parseFloat(oldBalance);
                            if (diff !== 0) {
                                window.dispatchEvent(new CustomEvent('balanceChanged', {
                                    detail: { oldBalance, newBalance: this.nativeBalance, diff }
                                }));
                            }
                        }
                    } catch (e) {}
                });
                
                console.log('👂 Escuchando bloques vía WebSocket');
                return;
            } catch (e) {
                // Fallback a polling
            }
        }
        
        // Polling HTTP cada 60 segundos (solo si ventana visible)
        this.nativeBalanceInterval = setInterval(async () => {
            if (document.hidden) return;
            
            try {
                const oldBalance = this.nativeBalance;
                await this.getNativeBalance();
                
                if (oldBalance !== '0' && oldBalance !== this.nativeBalance) {
                    const diff = parseFloat(this.nativeBalance) - parseFloat(oldBalance);
                    if (diff > 0) {
                        window.dispatchEvent(new CustomEvent('balanceChanged', {
                            detail: { oldBalance, newBalance: this.nativeBalance, diff }
                        }));
                    }
                }
            } catch (e) {}
        }, 60000);
    }
    
    stopAllEventListeners() {
        // Detener listeners de contratos
        for (const item of this.eventListeners) {
            try {
                item.contract.off(item.filter, item.listener);
            } catch (e) {
                console.warn('Error removiendo listener:', e);
            }
        }
        this.eventListeners = [];
        
        // Detener polling HTTP
        if (this.nativeBalanceInterval) {
            clearInterval(this.nativeBalanceInterval);
            this.nativeBalanceInterval = null;
        }
        
        // Detener listeners WebSocket
        if (this.wsProvider) {
            try {
                this.wsProvider.removeAllListeners('block');
            } catch (e) {}
        }
        
        this.listenersActive = false;
        console.log('🛑 Todos los listeners detenidos');
    }
    
    startAllEventListeners() {
        // Primero detener cualquier listener existente
        this.stopAllEventListeners();
        
        let successCount = 0;
        for (const contract of this.contracts) {
            if (this.setupContractEvents(contract)) {
                successCount++;
            }
        }
        
        this.setupNativeEvents();
        this.listenersActive = true;
        
        console.log(`👂 Listeners iniciados: ${successCount}/${this.contracts.length} contratos + SYS`);
        return successCount;
    }
    
    isListening() {
        return this.listenersActive && (this.eventListeners.length > 0 || this.nativeBalanceInterval);
    }
    
    getListenersStatus() {
        return {
            active: this.listenersActive,
            contractListeners: this.eventListeners.length,
            contracts: this.eventListeners.map(l => ({ symbol: l.symbol, type: l.type })),
            nativePolling: !!this.nativeBalanceInterval
        };
    }

    // ========================================
    // Almacenamiento
    // ========================================
    
    saveContracts() {
        localStorage.setItem(CONFIG.storage.contracts, JSON.stringify(this.contracts));
    }
    
    loadContracts() {
        const saved = localStorage.getItem(CONFIG.storage.contracts);
        if (saved) {
            const contracts = JSON.parse(saved);
            // Eliminar duplicados por dirección
            const seen = new Set();
            this.contracts = contracts.filter(c => {
                const key = c.address.toLowerCase();
                if (seen.has(key)) {
                    console.log('Eliminando contrato duplicado:', c.address);
                    return false;
                }
                seen.add(key);
                return true;
            });
            // Si había duplicados, guardar la lista limpia
            if (this.contracts.length !== contracts.length) {
                this.saveContracts();
            }
        }
    }
    
    removeContract(address) {
        this.contracts = this.contracts.filter(c => c.address.toLowerCase() !== address.toLowerCase());
        this.saveContracts();
    }

    // ========================================
    // Actividad / Historial
    // ========================================
    
    saveActivity(activity) {
        const activities = this.getActivities();
        activities.unshift({
            ...activity,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        // Mantener solo las últimas 50 actividades
        const trimmed = activities.slice(0, 50);
        localStorage.setItem(CONFIG.storage.activity, JSON.stringify(trimmed));
    }
    
    getActivities() {
        const saved = localStorage.getItem(CONFIG.storage.activity);
        return saved ? JSON.parse(saved) : [];
    }
    
    clearActivities() {
        localStorage.setItem(CONFIG.storage.activity, JSON.stringify([]));
    }
    
    // Registrar transacción enviada
    logSentTransaction(type, to, amount, symbol, txHash, tokenId = null) {
        this.saveActivity({
            type: 'sent',
            assetType: type, // 'native', 'ERC20', 'ERC721'
            to: to,
            amount: amount,
            symbol: symbol,
            txHash: txHash,
            tokenId: tokenId
        });
    }
    
    // Registrar transacción recibida
    logReceivedTransaction(type, from, amount, symbol, txHash, tokenId = null) {
        this.saveActivity({
            type: 'received',
            assetType: type,
            from: from,
            amount: amount,
            symbol: symbol,
            txHash: txHash,
            tokenId: tokenId
        });
    }

    // ========================================
    // Exportar/Importar Wallet
    // ========================================
    
    exportEncryptedWallet(password, exportPassword, includeContracts = false, includeNetworks = false) {
        try {
            // Primero verificar la contraseña actual
            const privateKey = this.decryptPrivateKey(password);
            
            // También obtener mnemonic si existe
            let mnemonic = null;
            try {
                mnemonic = this.getMnemonic(password);
            } catch (e) {}
            
            // Cifrar con PBKDF2 600k iteraciones para exportación
            const encryptedExport = this.encryptWithPBKDF2(privateKey, exportPassword, 600000);
            
            // También cifrar mnemonic si existe
            let encryptedMnemonic = null;
            if (mnemonic) {
                encryptedMnemonic = this.encryptWithPBKDF2(mnemonic, exportPassword, 600000);
            }
            
            const exportData = {
                version: '2.1',
                type: '0xaddress-encrypted-wallet',
                address: this.address,
                encryptedKey: encryptedExport,
                encryptedMnemonic: encryptedMnemonic,
                pbkdf2Iterations: 600000,
                createdAt: new Date().toISOString()
            };
            
            // Incluir contratos si se solicita
            if (includeContracts && this.contracts.length > 0) {
                exportData.contracts = this.contracts;
            }
            
            // Incluir redes personalizadas si se solicita
            if (includeNetworks) {
                const customNetworks = localStorage.getItem(CONFIG.storage.customNetworks);
                if (customNetworks) {
                    exportData.customNetworks = JSON.parse(customNetworks);
                }
                // Incluir la red actual
                exportData.currentNetwork = localStorage.getItem(CONFIG.storage.network) || 'rollux';
            }
            
            console.log('✅ Wallet exportada con PBKDF2 600k iteraciones');
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            throw new Error('Contraseña incorrecta');
        }
    }
    
    importEncryptedWallet(fileContent, importPassword, newWalletPassword) {
        try {
            const data = JSON.parse(fileContent);
            
            if (data.type !== '0xaddress-encrypted-wallet') {
                throw new Error('Archivo no válido');
            }
            
            // Detectar formato: PBKDF2 (v2.1+) o legacy
            let privateKey;
            let mnemonic = null;
            
            if (data.version === '2.1' && data.encryptedKey && typeof data.encryptedKey === 'object') {
                // Formato PBKDF2 (v2.1)
                privateKey = this.decryptWithPBKDF2(data.encryptedKey, importPassword);
                
                // También descifrar mnemonic si existe
                if (data.encryptedMnemonic) {
                    mnemonic = this.decryptWithPBKDF2(data.encryptedMnemonic, importPassword);
                }
            } else {
                // Formato legacy (CryptoJS.AES simple)
                const bytes = CryptoJS.AES.decrypt(data.encryptedKey, importPassword);
                privateKey = bytes.toString(CryptoJS.enc.Utf8);
            }
            
            if (!privateKey || !privateKey.startsWith('0x')) {
                throw new Error('Contraseña de importación incorrecta');
            }
            
            // Verificar que la llave genera la misma dirección
            const walletObj = new ethers.Wallet(privateKey);
            
            // Cifrar con PBKDF2 300k para almacenamiento local
            const encryptedKey = this.encryptPrivateKey(privateKey, newWalletPassword);
            
            // Guardar wallet
            localStorage.setItem(CONFIG.storage.encryptedKey, JSON.stringify(encryptedKey));
            localStorage.setItem(CONFIG.storage.address, walletObj.address);
            
            // Guardar mnemonic si existe
            if (mnemonic) {
                const encryptedMnemonic = this.encryptWithPBKDF2(mnemonic, newWalletPassword, 300000);
                localStorage.setItem('0xaddress_mnemonic', JSON.stringify(encryptedMnemonic));
            }
            
            this.address = walletObj.address;
            
            // Restaurar contratos si existen en el archivo
            if (data.contracts && Array.isArray(data.contracts)) {
                localStorage.setItem(CONFIG.storage.contracts, JSON.stringify(data.contracts));
                this.contracts = data.contracts;
                console.log('📦 Restaurados', data.contracts.length, 'contratos');
            }
            
            // Restaurar redes personalizadas si existen
            if (data.customNetworks) {
                localStorage.setItem(CONFIG.storage.customNetworks, JSON.stringify(data.customNetworks));
                console.log('🌐 Restauradas redes personalizadas');
            }
            
            // Restaurar red actual si existe
            if (data.currentNetwork) {
                localStorage.setItem(CONFIG.storage.network, data.currentNetwork);
                console.log('🌐 Red restaurada:', data.currentNetwork);
            }
            
            return {
                success: true,
                address: walletObj.address,
                contractsRestored: data.contracts?.length || 0,
                networksRestored: data.customNetworks ? Object.keys(data.customNetworks).length : 0,
                hasMnemonic: !!mnemonic
            };
        } catch (error) {
            console.error('Error importando wallet:', error);
            throw error;
        }
    }

    // ========================================
    // Utilidades
    // ========================================
    
    async getContractInfo(address, type) {
        try {
            const abi = type === 'ERC20' ? ERC20_ABI : ERC721_ABI;
            const contract = new ethers.Contract(address, abi, this.provider);
            
            let name = `${type} ${address.slice(0, 6)}...${address.slice(-4)}`;
            let symbol = type === 'ERC20' ? 'TKN' : 'NFT';
            
            try { name = await contract.name(); } catch (e) {}
            try { symbol = await contract.symbol(); } catch (e) {}
            
            return { name, symbol };
        } catch (error) {
            return { 
                name: `${type} ${address.slice(0, 6)}...${address.slice(-4)}`, 
                symbol: type === 'ERC20' ? 'TKN' : 'NFT' 
            };
        }
    }
    
    isValidAddress(address) {
        return ethers.isAddress(address);
    }
    
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    getExplorerTxUrl(txHash) {
        return `${NETWORK.explorer}/tx/${txHash}`;
    }
    
    getExplorerAddressUrl(address) {
        return `${NETWORK.explorer}/address/${address || this.address}`;
    }
}

const wallet = new Wallet();
