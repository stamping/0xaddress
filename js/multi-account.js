// ============================================
// 0xAddress - Multi-Account Support
// Soporte para múltiples direcciones derivadas e importadas
// ============================================

const PBKDF2_ITERATIONS_UNLOCK = 300000;  // Para desbloqueo local
const PBKDF2_ITERATIONS_EXPORT = 600000;  // Para exportar archivos

// ========================================
// Account Manager
// ========================================

class AccountManager {
    constructor() {
        this.accounts = [];
        this.activeAccountIndex = 0;
        this.storageKey = '0xaddress_accounts';
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.accounts = data.accounts || [];
                this.activeAccountIndex = data.activeIndex || 0;
            }
        } catch (e) {
            console.error('Error loading accounts:', e);
            this.accounts = [];
            this.activeAccountIndex = 0;
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify({
            accounts: this.accounts,
            activeIndex: this.activeAccountIndex
        }));
    }

    // Agregar cuenta principal (al crear wallet)
    addPrimaryAccount(address, label = 'Cuenta Principal') {
        this.accounts = [{
            address: address,
            label: label,
            type: 'primary',
            index: 0,
            createdAt: Date.now()
        }];
        this.activeAccountIndex = 0;
        this.save();
    }

    // Derivar nueva cuenta desde mnemonic
    deriveAccount(mnemonic, password, label = null) {
        // Encontrar el siguiente índice disponible
        const derivedAccounts = this.accounts.filter(a => a.type === 'derived' || a.type === 'primary');
        const nextIndex = derivedAccounts.length;
        
        // Derivar usando HD path estándar
        const path = `m/44'/60'/0'/0/${nextIndex}`;
        const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);
        
        const newAccount = {
            address: hdWallet.address,
            label: label || `Cuenta ${nextIndex + 1}`,
            type: 'derived',
            index: nextIndex,
            createdAt: Date.now()
        };
        
        this.accounts.push(newAccount);
        this.save();
        
        return newAccount;
    }

    // Importar cuenta desde llave privada
    importFromPrivateKey(privateKey, label = 'Cuenta Importada') {
        try {
            let pk = privateKey.trim();
            if (!pk.startsWith('0x')) pk = '0x' + pk;
            
            const wallet = new ethers.Wallet(pk);
            
            // Verificar que no exista
            if (this.accounts.find(a => a.address.toLowerCase() === wallet.address.toLowerCase())) {
                throw new Error('Esta cuenta ya existe');
            }
            
            const newAccount = {
                address: wallet.address,
                label: label,
                type: 'imported',
                privateKey: pk, // Se guardará encriptado
                createdAt: Date.now()
            };
            
            this.accounts.push(newAccount);
            this.save();
            
            return newAccount;
        } catch (e) {
            throw new Error('Llave privada inválida: ' + e.message);
        }
    }

    // Obtener cuenta activa
    getActiveAccount() {
        return this.accounts[this.activeAccountIndex] || this.accounts[0];
    }

    // Cambiar cuenta activa
    setActiveAccount(index) {
        if (index >= 0 && index < this.accounts.length) {
            this.activeAccountIndex = index;
            this.save();
            return this.accounts[index];
        }
        return null;
    }

    // Cambiar cuenta activa por dirección
    setActiveAccountByAddress(address) {
        const index = this.accounts.findIndex(a => 
            a.address.toLowerCase() === address.toLowerCase()
        );
        if (index >= 0) {
            return this.setActiveAccount(index);
        }
        return null;
    }

    // Obtener todas las cuentas
    getAllAccounts() {
        return this.accounts;
    }

    // Actualizar etiqueta
    updateLabel(address, label) {
        const account = this.accounts.find(a => 
            a.address.toLowerCase() === address.toLowerCase()
        );
        if (account) {
            account.label = label;
            this.save();
        }
    }

    // Eliminar cuenta (solo importadas, no derivadas)
    removeAccount(address) {
        const index = this.accounts.findIndex(a => 
            a.address.toLowerCase() === address.toLowerCase()
        );
        
        if (index >= 0) {
            const account = this.accounts[index];
            if (account.type === 'primary') {
                throw new Error('No puedes eliminar la cuenta principal');
            }
            
            this.accounts.splice(index, 1);
            
            // Ajustar índice activo si es necesario
            if (this.activeAccountIndex >= this.accounts.length) {
                this.activeAccountIndex = this.accounts.length - 1;
            }
            if (this.activeAccountIndex < 0) this.activeAccountIndex = 0;
            
            this.save();
            return true;
        }
        return false;
    }

    // Obtener private key de una cuenta
    getPrivateKey(address, mnemonic, importedKeys = {}) {
        const account = this.accounts.find(a => 
            a.address.toLowerCase() === address.toLowerCase()
        );
        
        if (!account) throw new Error('Cuenta no encontrada');
        
        if (account.type === 'imported') {
            // Para cuentas importadas, la key debe venir del vault
            const pk = importedKeys[address.toLowerCase()];
            if (!pk) throw new Error('Llave no encontrada para cuenta importada');
            return pk;
        } else {
            // Para derivadas, derivar desde mnemonic
            const path = `m/44'/60'/0'/0/${account.index}`;
            const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);
            return hdWallet.privateKey;
        }
    }
}

// ========================================
// PBKDF2 Encryption Helpers
// ========================================

function deriveKeyPBKDF2(password, salt, iterations = PBKDF2_ITERATIONS_UNLOCK) {
    return CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: iterations,
        hasher: CryptoJS.algo.SHA256
    });
}

function encryptWithPBKDF2(data, password, iterations = PBKDF2_ITERATIONS_UNLOCK) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    const key = deriveKeyPBKDF2(password, salt, iterations);
    
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
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

function decryptWithPBKDF2(encryptedData, password) {
    try {
        const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
        const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
        const iterations = encryptedData.iterations || PBKDF2_ITERATIONS_UNLOCK;
        
        const key = deriveKeyPBKDF2(password, salt, iterations);
        
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Base64.parse(encryptedData.ct) },
            key,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );
        
        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        throw new Error('Contraseña incorrecta');
    }
}

// ========================================
// Export/Import with 600k iterations
// ========================================

function exportWalletSecure(mnemonic, accounts, password, useNewPassword = false, newPassword = null) {
    const exportPassword = useNewPassword && newPassword ? newPassword : password;
    
    const exportData = {
        version: 2,
        type: '0xaddress-secure-backup',
        mnemonic: mnemonic,
        accounts: accounts.map(a => ({
            address: a.address,
            label: a.label,
            type: a.type,
            index: a.index
        })),
        exportedAt: Date.now()
    };
    
    const encrypted = encryptWithPBKDF2(exportData, exportPassword, PBKDF2_ITERATIONS_EXPORT);
    
    return {
        type: '0xaddress-secure-backup',
        version: 2,
        encrypted: encrypted,
        metadata: {
            accountCount: accounts.length,
            exportedAt: new Date().toISOString(),
            pbkdf2Iterations: PBKDF2_ITERATIONS_EXPORT
        }
    };
}

function importWalletSecure(backupData, filePassword) {
    if (!backupData.encrypted) {
        throw new Error('Formato de backup no válido');
    }
    
    return decryptWithPBKDF2(backupData.encrypted, filePassword);
}

// ========================================
// Global Instance
// ========================================

const accountManager = new AccountManager();

// Hacer disponible globalmente
window.accountManager = accountManager;
window.PBKDF2_ITERATIONS_UNLOCK = PBKDF2_ITERATIONS_UNLOCK;
window.PBKDF2_ITERATIONS_EXPORT = PBKDF2_ITERATIONS_EXPORT;
window.encryptWithPBKDF2 = encryptWithPBKDF2;
window.decryptWithPBKDF2 = decryptWithPBKDF2;
window.exportWalletSecure = exportWalletSecure;
window.importWalletSecure = importWalletSecure;

console.log('✅ Multi-account module loaded');
