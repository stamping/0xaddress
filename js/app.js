// ============================================
// 0xaddress - Main Application
// ============================================

// Mensajes para el loader
const LOADER_MESSAGES = [
    "Iniciando...",
    "Conectando a blockchain...",
    "Verificando red...",
    "Cargando wallet...",
    "Listo"
];

// ========================================
// Session Manager - Gestión de sesión desbloqueada
// ========================================

const SessionManager = {
    STORAGE_KEY: '0xaddress_session_expiry',
    timerInterval: null,
    
    // Iniciar sesión con tiempo de expiración
    startSession(expiryTimestamp) {
        localStorage.setItem(this.STORAGE_KEY, expiryTimestamp.toString());
    },
    
    // Verificar si la sesión está activa
    isSessionActive() {
        const expiry = localStorage.getItem(this.STORAGE_KEY);
        if (!expiry) return false;
        return Date.now() < parseInt(expiry);
    },
    
    // Obtener tiempo restante en milisegundos
    getTimeRemaining() {
        const expiry = localStorage.getItem(this.STORAGE_KEY);
        if (!expiry) return 0;
        const remaining = parseInt(expiry) - Date.now();
        return remaining > 0 ? remaining : 0;
    },
    
    // Terminar sesión (bloquear)
    endSession() {
        localStorage.removeItem(this.STORAGE_KEY);
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    // Iniciar timer de actualización en UI
    startTimer() {
        // Limpiar timer anterior si existe
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Actualizar inmediatamente
        this.updateTimerUI();
        
        // Actualizar cada minuto
        this.timerInterval = setInterval(() => {
            if (!this.isSessionActive()) {
                // Sesión expirada, bloquear
                this.endSession();
                lockWallet();
                showToast('info', 'Sesión expirada', 'Tu sesión ha expirado por seguridad');
            } else {
                this.updateTimerUI();
            }
        }, 60000); // Cada minuto
    },
    
    // Actualizar UI del timer
    updateTimerUI() {
        const timerEl = document.getElementById('sessionTimeLeft');
        if (!timerEl) return;
        
        const remaining = this.getTimeRemaining();
        if (remaining <= 0) {
            timerEl.textContent = '0:00';
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            timerEl.textContent = `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            timerEl.textContent = `${hours}h ${minutes % 60}m`;
        } else {
            timerEl.textContent = `${minutes}m`;
        }
    },
    
    // Formatear tiempo para mostrar
    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    }
};

// ========================================
// Inicialización
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Mostrar mensajes en el loader
        animateLoaderMessages();
        
        // Inicializar tema (claro/oscuro)
        initTheme();
        updateThemeMenuText();
        
        // Inicializar wallet
        await wallet.init();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Ocultar loader
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
            
            // Determinar qué mostrar
            if (wallet.hasWallet()) {
                // Verificar si hay sesión activa
                if (SessionManager.isSessionActive()) {
                    // Sesión activa, ir directo a la app
                    console.log('🔓 Active session found');
                    startApp();
                    SessionManager.startTimer();
                } else {
                    // Wallet existe pero sesión expirada, mostrar desbloqueo
                    openModal('unlockModal');
                }
            } else {
                // No hay wallet, mostrar setup
                openModal('setupModal');
                // Iniciar banners después de un pequeño delay
                setTimeout(() => {
                    if (typeof initBanners === 'function') {
                        initBanners();
                    }
                }, 300);
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error inicializando:', error);
        const loaderText = document.getElementById('loaderText');
        if (loaderText) loaderText.textContent = 'Error de conexión...';
    }
});

function animateLoaderMessages() {
    const loaderText = document.getElementById('loaderText');
    if (!loaderText) return;
    
    let index = 0;
    const interval = setInterval(() => {
        if (index < LOADER_MESSAGES.length) {
            loaderText.textContent = LOADER_MESSAGES[index];
            index++;
        } else {
            clearInterval(interval);
        }
    }, 400);
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Formulario de Setup
    document.getElementById('setupForm').addEventListener('submit', handleSetup);
    
    // Formulario de Importación
    document.getElementById('importForm').addEventListener('submit', handleImport);
    
    // Validación de contraseñas en setup - también llama validatePasswordRequirements
    document.getElementById('setupPassword').addEventListener('input', () => {
        if (typeof validatePasswordRequirements === 'function') {
            validatePasswordRequirements();
        }
        validateSetupPassword();
    });
    document.getElementById('confirmPassword').addEventListener('input', validateSetupPassword);
    
    // Formulario de Desbloqueo
    document.getElementById('unlockForm').addEventListener('submit', handleUnlock);
    
    // Formulario de Firma
    document.getElementById('signForm').addEventListener('submit', handleSign);
    
    // Formulario de Envío
    document.getElementById('sendForm').addEventListener('submit', handleSend);
    
    // Formulario de Agregar Contrato
    document.getElementById('addContractForm').addEventListener('submit', handleAddContract);
    
    // Verificar contrato al cambiar dirección o tipo
    document.getElementById('contractAddress').addEventListener('blur', previewContract);
    document.getElementById('contractType').addEventListener('change', previewContract);
    
    // Selección de token en envío
    document.getElementById('tokenSelect').addEventListener('change', handleTokenSelectChange);
    
    // Eventos de tokens recibidos
    window.addEventListener('tokenReceived', handleTokenReceived);
    
    // Evento de cambio de balance
    window.addEventListener('balanceChanged', handleBalanceChanged);
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
            if (qrScanner) closeScanner();
        }
    });
    
    // Los modales NO se cierran al hacer click fuera
    // Solo se cierran con el botón X o Cancelar
    // Esto evita perder datos accidentalmente
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            // Solo cerrar el scanner al hacer clic afuera (es seguro)
            if (e.target === modal && modal.id === 'scannerModal') {
                closeModal(modal.id);
                closeScanner();
            }
            // El resto de modales NO se cierran al hacer clic afuera
        });
    });
}

// ========================================
// Setup Handlers
// ========================================

function validateSetupPassword() {
    const password = document.getElementById('setupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const strengthEl = document.getElementById('passwordStrength');
    const matchEl = document.getElementById('passwordMatch');
    const createBtn = document.getElementById('createWalletBtn');
    const confirmGroup = document.getElementById('confirmPasswordGroup');
    
    // Verificar requisitos de contraseña
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const allRequirementsMet = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    
    // Evaluar fortaleza visual (solo si existe el elemento)
    if (strengthEl) {
        strengthEl.className = 'password-strength';
        if (allRequirementsMet) {
            strengthEl.classList.add('strong');
        } else if (password.length >= 8 && (hasUppercase || hasNumber)) {
            strengthEl.classList.add('medium');
        } else if (password.length > 0) {
            strengthEl.classList.add('weak');
        }
    }
    
    // Mostrar campo de confirmación solo si se cumplen todos los requisitos
    if (allRequirementsMet) {
        if (confirmGroup) confirmGroup.classList.remove('hidden');
    } else {
        if (confirmGroup) confirmGroup.classList.add('hidden');
    }
    
    // Verificar coincidencia
    if (matchEl) {
        if (confirm.length > 0 && allRequirementsMet) {
            if (password === confirm) {
                matchEl.textContent = '✓ Las contraseñas coinciden';
                matchEl.className = 'password-match match';
            } else {
                matchEl.textContent = '✗ Las contraseñas no coinciden';
                matchEl.className = 'password-match no-match';
            }
        } else {
            matchEl.textContent = '';
        }
    }
    
    // Habilitar botón solo si cumple todos los requisitos y coinciden
    if (createBtn) {
        createBtn.disabled = !(allRequirementsMet && password === confirm);
    }
}

async function handleSetup(e) {
    e.preventDefault();
    
    const password = document.getElementById('setupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (password !== confirm) {
        showToast('error', 'Error', 'Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 8) {
        showToast('error', 'Error', 'La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    // Mostrar overlay de creación
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.show('create', t('creatingWallet'));
    }
    
    // Dar tiempo para mostrar el overlay
    await new Promise(r => setTimeout(r, 100));
    
    try {
        // Generar wallet
        const result = wallet.generateWallet(password);
        
        // Sesión de 1 hora por defecto para nueva wallet
        const expiryTimestamp = Date.now() + (60 * 60 * 1000);
        SessionManager.startSession(expiryTimestamp);
        
        // Guardar sesión (si estamos en extensión)
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            try {
                const privateKey = wallet.getPrivateKey(password);
                await chrome.runtime.sendMessage({
                    type: 'POPUP_UNLOCK',
                    payload: { 
                        address: wallet.address,
                        privateKey: privateKey,
                        expiryTimestamp: expiryTimestamp
                    }
                });
            } catch (e) {}
        }
        
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.hide();
        }
        
        showToast('success', '¡Wallet creada!', `Dirección: ${wallet.formatAddress(result.address)}`);
        
        // Cerrar modal de setup
        closeModal('setupModal');
        
        // Iniciar app
        startApp();
        
        // Iniciar timer de sesión
        SessionManager.startTimer();
        
        // Iniciar onboarding para nuevos usuarios
        setTimeout(() => {
            if (typeof Onboarding !== 'undefined') {
                Onboarding.start();
            }
        }, 500);
        
    } catch (error) {
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.hide();
        }
        console.error('Error creando wallet:', error);
        showToast('error', 'Error', 'No se pudo crear la wallet');
    }
}

async function handleUnlock(e) {
    e.preventDefault();
    
    const password = document.getElementById('unlockPassword').value;
    const durationMinutes = parseInt(document.getElementById('sessionDuration').value) || 60;
    
    // Mostrar overlay de desbloqueo
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.show('unlock', t('unlockingWallet'));
    }
    
    // Dar tiempo para mostrar el overlay
    await new Promise(r => setTimeout(r, 100));
    
    try {
        if (wallet.verifyPassword(password)) {
            // Calcular timestamp de expiración
            const expiryTimestamp = Date.now() + (durationMinutes * 60 * 1000);
            
            // Guardar sesión en localStorage
            SessionManager.startSession(expiryTimestamp);
            
            // Guardar sesión para background script (extensión)
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                try {
                    const privateKey = wallet.getPrivateKey(password);
                    await chrome.runtime.sendMessage({
                        type: 'POPUP_UNLOCK',
                        payload: { 
                            address: wallet.address,
                            privateKey: privateKey,
                            expiryTimestamp: expiryTimestamp
                        }
                    });
                    console.log('🔓 Session started for', durationMinutes, 'minutes');
                } catch (e) {
                    console.log('Not in extension context');
                }
            }
            
            if (typeof CryptoOverlay !== 'undefined') {
                CryptoOverlay.hide();
            }
            
            closeModal('unlockModal');
            startApp();
            
            // Iniciar timer de sesión
            SessionManager.startTimer();
        } else {
            if (typeof CryptoOverlay !== 'undefined') {
                CryptoOverlay.hide();
            }
            showToast('error', 'Error', 'Contraseña incorrecta');
        }
    } catch (error) {
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.hide();
        }
        showToast('error', 'Error', 'Contraseña incorrecta');
    }
}

// ========================================
// Setup Tabs & Import
// ========================================

function switchSetupTab(tab) {
    // Actualizar tabs
    document.querySelectorAll('.setup-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    // Mostrar contenido correspondiente
    document.getElementById('createTab').classList.toggle('active', tab === 'create');
    document.getElementById('importTab').classList.toggle('active', tab === 'import');
}

let importFileContent = null;

function handleImportFileSelect(event) {
    const file = event.target.files[0];
    const display = document.getElementById('fileInputDisplay');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            importFileContent = e.target.result;
            display.classList.add('has-file');
            display.querySelector('.file-text').textContent = file.name;
            display.querySelector('.file-icon').textContent = '✅';
        };
        reader.onerror = () => {
            showToast('error', 'Error', 'No se pudo leer el archivo');
            importFileContent = null;
        };
        reader.readAsText(file);
    } else {
        importFileContent = null;
        display.classList.remove('has-file');
        display.querySelector('.file-text').textContent = 'Seleccionar archivo...';
        display.querySelector('.file-icon').textContent = '📄';
    }
}

async function handleImport(e) {
    e.preventDefault();
    
    const filePassword = document.getElementById('importFilePassword').value;
    // Ahora el checkbox significa "usar contraseña diferente" (invertido)
    const useDifferentPassword = document.getElementById('keepSamePassword')?.checked ?? false;
    const newPassword = useDifferentPassword ? document.getElementById('newWalletPassword').value : filePassword;
    const newPasswordConfirm = useDifferentPassword ? document.getElementById('newWalletPasswordConfirm').value : filePassword;
    
    if (!importFileContent) {
        showToast('error', 'Error', 'Selecciona un archivo');
        return;
    }
    
    if (!filePassword) {
        showToast('error', 'Error', 'Ingresa la contraseña del archivo');
        return;
    }
    
    if (useDifferentPassword) {
        if (!newPassword || newPassword.length < 8) {
            showToast('error', 'Error', 'La nueva contraseña debe tener mínimo 8 caracteres');
            return;
        }
        
        if (newPassword !== newPasswordConfirm) {
            showToast('error', 'Error', 'Las contraseñas no coinciden');
            return;
        }
    }
    
    // Mostrar spinner de importación
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.show('import', t('decryptingCertificate'));
    }
    
    // Esperar para que el overlay se renderice antes del proceso pesado
    await new Promise(r => setTimeout(r, 150));
    
    // Usar setTimeout para permitir que el UI se actualice
    setTimeout(async () => {
        try {
            const result = wallet.importEncryptedWallet(importFileContent, filePassword, newPassword);
            
            // Ocultar spinner
            if (typeof CryptoOverlay !== 'undefined') {
                CryptoOverlay.hide();
            }
            
            // Sesión de 1 hora por defecto para wallet importada
            const expiryTimestamp = Date.now() + (60 * 60 * 1000);
            SessionManager.startSession(expiryTimestamp);
            
            // Guardar sesión (si estamos en extensión)
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                try {
                    const privateKey = wallet.getPrivateKey(newPassword);
                    await chrome.runtime.sendMessage({
                        type: 'POPUP_UNLOCK',
                        payload: { 
                            address: wallet.address,
                            privateKey: privateKey,
                            expiryTimestamp: expiryTimestamp
                        }
                    });
                } catch (e) {}
            }
            
            // Mensaje con detalles
            let details = `Dirección: ${wallet.formatAddress(result.address)}`;
            if (result.contractsRestored > 0) {
                details += ` | ${result.contractsRestored} contratos`;
            }
            
            showToast('success', '¡Wallet importada!', details);
            
            // Cerrar modal de setup
            closeModal('setupModal');
            
            // Iniciar app
            startApp();
            
            // Iniciar timer de sesión
            SessionManager.startTimer();
            
        } catch (error) {
            // Ocultar spinner en caso de error
            if (typeof CryptoOverlay !== 'undefined') {
                CryptoOverlay.hide();
            }
            console.error('Error importando wallet:', error);
            showToast('error', 'Error', error.message || 'No se pudo importar la wallet');
        }
    }, 50);
}

// Toggle new password fields visibility (checkbox = usar contraseña diferente)
function toggleNewPasswordFields() {
    const useDifferent = document.getElementById('keepSamePassword')?.checked;
    const newFields = document.getElementById('newPasswordFields');
    if (newFields) {
        if (useDifferent) {
            newFields.classList.remove('hidden');
        } else {
            newFields.classList.add('hidden');
        }
    }
}

// ========================================
// Import from Unlock Modal
// ========================================

let unlockImportFileContent = null;

function showImportInUnlock() {
    document.getElementById('unlockForm').style.display = 'none';
    document.querySelector('.unlock-options').style.display = 'none';
    document.getElementById('unlockImportForm').style.display = 'block';
}

function hideImportInUnlock() {
    document.getElementById('unlockForm').style.display = 'block';
    document.querySelector('.unlock-options').style.display = 'flex';
    document.getElementById('unlockImportForm').style.display = 'none';
    unlockImportFileContent = null;
    
    // Reset file input display
    const display = document.getElementById('unlockFileDisplay');
    display.classList.remove('has-file');
    display.querySelector('.file-text').textContent = 'Seleccionar archivo...';
    display.querySelector('.file-icon').textContent = '📄';
}

function handleUnlockImportFile(event) {
    const file = event.target.files[0];
    const display = document.getElementById('unlockFileDisplay');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            unlockImportFileContent = e.target.result;
            display.classList.add('has-file');
            display.querySelector('.file-text').textContent = file.name;
            display.querySelector('.file-icon').textContent = '✅';
        };
        reader.onerror = () => {
            showToast('error', 'Error', 'No se pudo leer el archivo');
            unlockImportFileContent = null;
        };
        reader.readAsText(file);
    }
}

async function importFromUnlock() {
    const filePassword = document.getElementById('unlockImportFilePassword').value;
    // Usar la misma contraseña del archivo
    const newPassword = filePassword;
    
    if (!unlockImportFileContent) {
        showToast('error', 'Error', 'Selecciona un archivo');
        return;
    }
    
    if (!filePassword) {
        showToast('error', 'Error', 'Ingresa la contraseña del archivo');
        return;
    }
    
    // Mostrar spinner de importación
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.show('import', t('decryptingCertificate'));
    }
    
    // Esperar para que el overlay se renderice antes del proceso pesado
    await new Promise(r => setTimeout(r, 150));
    
    // Usar setTimeout para permitir que el UI se actualice
    setTimeout(async () => {
        try {
            const result = wallet.importEncryptedWallet(unlockImportFileContent, filePassword, newPassword);
            
            // Ocultar spinner
            if (typeof CryptoOverlay !== 'undefined') {
                CryptoOverlay.hide();
            }
            
            // Sesión de 1 hora por defecto para wallet importada
            const expiryTimestamp = Date.now() + (60 * 60 * 1000);
            SessionManager.startSession(expiryTimestamp);
            
            // Guardar sesión (si estamos en extensión)
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                try {
                    const privateKey = wallet.getPrivateKey(newPassword);
                    await chrome.runtime.sendMessage({
                        type: 'POPUP_UNLOCK',
                        payload: { 
                            address: wallet.address,
                            privateKey: privateKey,
                            expiryTimestamp: expiryTimestamp
                        }
                    });
                } catch (e) {}
            }
            
            // Mensaje con detalles
            let details = `Dirección: ${wallet.formatAddress(result.address)}`;
            if (result.contractsRestored > 0) {
                details += ` | ${result.contractsRestored} contratos`;
            }
            
            showToast('success', '¡Wallet importada!', details);
            
            // Cerrar modal de unlock
            closeModal('unlockModal');
            
            // Iniciar app
            startApp();
            
            // Iniciar timer de sesión
            SessionManager.startTimer();
            
        } catch (error) {
            // Ocultar spinner en caso de error
            if (typeof CryptoOverlay !== 'undefined') {
                CryptoOverlay.hide();
            }
            console.error('Error importando wallet:', error);
            showToast('error', 'Error', error.message || 'No se pudo importar la wallet');
        }
    }, 50);
}

// ========================================
// App Start
// ========================================

async function startApp() {
    // Verificar si es modo pending (popup desde dApp)
    const urlParams = new URLSearchParams(window.location.search);
    const isPendingMode = urlParams.get('pending') === 'true';
    
    // Mostrar app
    document.getElementById('app').classList.remove('hidden');
    
    // Actualizar UI de red
    updateNetworkUI();
    
    // Actualizar UI
    updateAddressDisplay();
    
    // Actualizar links del footer
    updateFooterLinks();
    
    // En modo pending, omitir operaciones pesadas de RPC
    if (!isPendingMode) {
        // Cargar balances y renderizar listas (updateAllBalances ya llama a render)
        await updateAllBalances();
        
        // Renderizar actividad
        renderActivityList();
        
        // Iniciar listeners de eventos
        wallet.startAllEventListeners();
        updateListenerUI();
        
        // Iniciar rotación de tips
        startTipRotation();
    } else {
        console.log('⚡ Modo pending: omitiendo carga de balances');
    }
    
    // Configurar modal de recibir
    document.getElementById('receiveAddress').textContent = wallet.address;
    generateQRCode(wallet.address);
}

// ========================================
// Transaction Handlers
// ========================================

async function handleSend(e) {
    e.preventDefault();
    
    const sendBtn = document.querySelector('#sendForm .btn-send');
    const originalText = sendBtn.innerHTML;
    
    // Deshabilitar botón inmediatamente para evitar doble clic
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner-small"></span> Procesando...';
    
    const to = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('sendAmount').value;
    
    // Validar dirección
    if (!wallet.isValidAddress(to)) {
        showToast('error', 'Error', 'Dirección inválida');
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalText;
        return;
    }
    
    try {
        if (currentSendType === 'native') {
            // Envío nativo
            await handleNativeSend(to, amount, sendBtn, originalText);
        } else if (currentSendType === 'token') {
            // Envío de token ERC20
            const contractAddress = document.getElementById('tokenSelect').value;
            if (!contractAddress) {
                showToast('error', 'Error', 'Selecciona un token');
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalText;
                return;
            }
            await handleTokenSend(contractAddress, to, amount, sendBtn, originalText);
        } else if (currentSendType === 'nft') {
            // Envío de NFT
            const nftData = document.getElementById('nftSelect').value;
            if (!nftData) {
                showToast('error', 'Error', 'Selecciona un NFT');
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalText;
                return;
            }
            const [contractAddress, tokenId] = nftData.split(':');
            await handleNFTSend(contractAddress, to, tokenId, sendBtn, originalText);
        }
    } catch (error) {
        // Restaurar botón en caso de error no manejado
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalText;
    }
}

async function handleNativeSend(to, amount, sendBtn, originalText) {
    try {
        // Estimar gas
        const gasEstimate = await wallet.estimateNativeGas(to, amount);
        
        // Solicitar firma
        requestSignature({
            type: 'Envío SYS',
            to: to,
            amount: amount,
            symbol: 'SYS',
            gas: gasEstimate?.totalCost || 'N/A'
        }, async (password) => {
            try {
                sendBtn.innerHTML = '<span class="spinner-small"></span> Enviando...';
                
                const result = await wallet.sendNative(to, amount, password);
                
                showToast('success', '¡Enviado!', 
                    `TX: ${wallet.formatAddress(result.hash)}`);
                
                // Abrir en explorador
                setTimeout(() => {
                    window.open(wallet.getExplorerTxUrl(result.hash), '_blank');
                }, 1000);
                
                closeModal('sendModal');
                await updateAllBalances();
                renderActivityList();
                
                // Restaurar botón
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalText;
                
            } catch (error) {
                showToast('error', 'Error', error.message || 'Transacción fallida');
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalText;
            }
        }, () => {
            // Callback de cancelación
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
        });
    } catch (error) {
        showToast('error', 'Error', error.message || 'No se pudo estimar gas');
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalText;
    }
}

async function handleTokenSend(contractAddress, to, amount, sendBtn, originalText) {
    try {
        const contract = wallet.contracts.find(c => c.address === contractAddress);
        
        // Estimar gas
        const gasEstimate = await wallet.estimateTokenGas(contractAddress, to, amount);
        
        // Solicitar firma
        requestSignature({
            type: `Envío ${contract.symbol}`,
            to: to,
            amount: amount,
            symbol: contract.symbol,
            gas: gasEstimate?.totalCost || 'N/A'
        }, async (password) => {
            try {
                sendBtn.innerHTML = '<span class="spinner-small"></span> Enviando...';
                
                const result = await wallet.sendToken(contractAddress, to, amount, password);
                
                showToast('success', '¡Enviado!', 
                    `TX: ${wallet.formatAddress(result.hash)}`);
                
                setTimeout(() => {
                    window.open(wallet.getExplorerTxUrl(result.hash), '_blank');
                }, 1000);
                
                closeModal('sendModal');
                await updateAllBalances();
                renderActivityList();
                
                // Restaurar botón
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalText;
                
            } catch (error) {
                showToast('error', 'Error', error.message || 'Transacción fallida');
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalText;
            }
        }, () => {
            // Callback de cancelación
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
        });
    } catch (error) {
        showToast('error', 'Error', error.message || 'No se pudo estimar gas');
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalText;
    }
}

async function handleNFTSend(contractAddress, to, tokenId, sendBtn, originalText) {
    const contract = wallet.contracts.find(c => c.address === contractAddress);
    
    // Solicitar firma
    requestSignature({
        type: `Envío NFT ${contract.symbol}`,
        to: to,
        amount: `#${tokenId}`,
        symbol: contract.symbol,
        gas: 'Variable'
    }, async (password) => {
        try {
            sendBtn.innerHTML = '<span class="spinner-small"></span> Enviando NFT...';
            
            const result = await wallet.sendNFT(contractAddress, to, tokenId, password);
            
            showToast('success', '¡NFT Enviado!', 
                `TX: ${wallet.formatAddress(result.hash)}`);
            
            setTimeout(() => {
                window.open(wallet.getExplorerTxUrl(result.hash), '_blank');
            }, 1000);
            
            closeModal('sendModal');
            await updateAllBalances();
            renderActivityList();
            
            // Restaurar botón
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
            
        } catch (error) {
            showToast('error', 'Error', error.message || 'Transacción fallida');
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
        }
    }, () => {
        // Callback de cancelación
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalText;
    });
}

// ========================================
// Sign Handler
// ========================================

async function handleSign(e) {
    e.preventDefault();
    
    const password = document.getElementById('signPassword').value;
    
    if (!wallet.verifyPassword(password)) {
        showToast('error', 'Error', 'Contraseña incorrecta');
        return;
    }
    
    closeModal('signModal');
    
    if (pendingSignCallback) {
        await pendingSignCallback(password);
        pendingSignCallback = null;
        pendingCancelCallback = null; // Limpiar callback de cancelación
        pendingTxDetails = null;
    }
}

// ========================================
// Contract Handlers
// ========================================

async function previewContract() {
    const address = document.getElementById('contractAddress').value;
    const type = document.getElementById('contractType').value;
    const preview = document.getElementById('contractPreview');
    const otherFields = document.getElementById('otherContractFields');
    
    // Mostrar/ocultar campos de OTHER
    if (otherFields) {
        otherFields.style.display = type === 'OTHER' ? 'block' : 'none';
    }
    
    if (!address || !type || !wallet.isValidAddress(address)) {
        preview.style.display = 'none';
        return;
    }
    
    // Para tipo OTHER, mostrar info básica
    if (type === 'OTHER') {
        try {
            const provider = new ethers.JsonRpcProvider(NetworkManager.getCurrentNetwork().rpcUrl);
            
            // Intentar obtener nombre
            let name = 'Contrato Personalizado';
            try {
                const contract = new ethers.Contract(address, ['function name() view returns (string)'], provider);
                name = await contract.name();
            } catch {}
            
            document.getElementById('previewName').textContent = name;
            document.getElementById('previewSymbol').textContent = '-';
            
            // Verificar owner
            const ownerRow = document.getElementById('previewOwnerRow');
            try {
                const contract = new ethers.Contract(address, ['function owner() view returns (address)'], provider);
                const owner = await contract.owner();
                const shortOwner = owner.slice(0, 6) + '...' + owner.slice(-4);
                const isOwner = owner.toLowerCase() === wallet.address.toLowerCase();
                
                document.getElementById('previewOwner').textContent = shortOwner;
                document.getElementById('previewIsOwner').textContent = isOwner ? 'TÚ' : '';
                document.getElementById('previewIsOwner').className = isOwner ? 'badge owner' : 'badge';
                if (ownerRow) ownerRow.style.display = 'block';
            } catch {
                if (ownerRow) ownerRow.style.display = 'none';
            }
            
            preview.style.display = 'block';
        } catch (error) {
            preview.style.display = 'none';
        }
        return;
    }
    
    // Para ERC20/ERC721
    try {
        const info = await wallet.getContractInfo(address, type);
        document.getElementById('previewName').textContent = info.name;
        document.getElementById('previewSymbol').textContent = info.symbol;
        
        const ownerRow = document.getElementById('previewOwnerRow');
        if (ownerRow) ownerRow.style.display = 'none';
        
        preview.style.display = 'block';
    } catch (error) {
        preview.style.display = 'none';
    }
}

async function handleAddContract(e) {
    e.preventDefault();
    
    const address = document.getElementById('contractAddress').value;
    const type = document.getElementById('contractType').value;
    
    if (!wallet.isValidAddress(address)) {
        showToast('error', 'Error', 'Dirección inválida');
        return;
    }
    
    if (!type) {
        showToast('error', 'Error', 'Selecciona el tipo de contrato');
        return;
    }
    
    try {
        // Manejar tipo OTHER
        if (type === 'OTHER') {
            const label = document.getElementById('contractLabel')?.value || 'CUSTOM';
            const abiUrl = document.getElementById('contractAbiUrl')?.value || '';
            
            const contractData = await addOtherContract(address, label, abiUrl);
            
            showToast('success', '¡Contrato agregado!', contractData.name || 'Contrato personalizado');
            
            closeModal('addContractModal');
            
            // Limpiar formulario
            document.getElementById('contractAddress').value = '';
            document.getElementById('contractType').value = '';
            document.getElementById('contractLabel').value = '';
            document.getElementById('contractAbiUrl').value = '';
            document.getElementById('contractPreview').style.display = 'none';
            document.getElementById('otherContractFields').style.display = 'none';
            
            // Cambiar a tab de otros
            switchAssetsTab('others');
            
            return;
        }
        
        // ERC20 / ERC721
        const contractData = await wallet.addContract(address, type);
        
        showToast('success', '¡Contrato agregado!', 
            `${contractData.name} (${contractData.symbol})`);
        
        closeModal('addContractModal');
        
        // Limpiar formulario
        document.getElementById('contractAddress').value = '';
        document.getElementById('contractType').value = '';
        document.getElementById('contractPreview').style.display = 'none';
        
        // Actualizar listas
        if (type === 'ERC20') {
            renderTokensList();
        } else {
            renderNFTsList();
        }
        
        // Actualizar indicador de listeners
        updateListenerUI();
        
    } catch (error) {
        showToast('error', 'Error', error.message || 'No se pudo agregar el contrato');
    }
}

// ========================================
// Token Select Change
// ========================================

async function handleTokenSelectChange(e) {
    const contractAddress = e.target.value;
    
    if (contractAddress) {
        const contract = wallet.contracts.find(c => c.address === contractAddress);
        if (contract) {
            document.getElementById('sendTokenSymbol').textContent = contract.symbol;
            await updateMaxBalance('token', contractAddress);
        }
    }
}

// ========================================
// Event Handlers
// ========================================

function handleTokenReceived(e) {
    const { contract, from, value, txHash } = e.detail;
    
    showToast('success', '¡Token recibido!', 
        `+${value} ${contract.symbol} de ${wallet.formatAddress(from)}`);
    
    // Actualizar balances
    updateAllBalances();
    
    // Guardar en historial persistente
    wallet.logReceivedTransaction(
        contract.type || 'ERC20',
        from,
        value,
        contract.symbol,
        txHash
    );
    
    // Actualizar lista de actividad
    renderActivityList();
}

function handleBalanceChanged(e) {
    const { oldBalance, newBalance, diff } = e.detail;
    const network = NetworkManager.getCurrentNetwork();
    const symbol = network.currency?.symbol || 'SYS';
    
    if (diff > 0) {
        showToast('success', `¡${symbol} recibido!`, `+${diff.toFixed(6)} ${symbol}`);
        
        // Guardar en historial persistente
        wallet.logReceivedTransaction(
            'native',
            'Desconocido', // No tenemos el from en el polling
            diff.toFixed(6),
            symbol,
            null // No tenemos txHash en polling
        );
        
        // Actualizar lista de actividad
        renderActivityList();
    }
    
    document.getElementById('mainBalance').textContent = parseFloat(newBalance).toFixed(4);
}

function addActivityItem(data) {
    const container = document.getElementById('activityList');
    
    // Remover estado vacío si existe
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const item = document.createElement('a');
    item.className = 'activity-item fade-in';
    item.href = wallet.getExplorerTxUrl(data.txHash);
    item.target = '_blank';
    
    const isReceive = data.type === 'receive';
    
    item.innerHTML = `
        <div class="activity-icon ${data.type}">
            ${isReceive ? '📥' : '📤'}
        </div>
        <div class="activity-details">
            <h4>${isReceive ? 'Recibido' : 'Enviado'}</h4>
            <p>${isReceive ? 'De' : 'A'}: ${wallet.formatAddress(data.from)}</p>
        </div>
        <div class="activity-amount ${isReceive ? 'positive' : 'negative'}">
            ${isReceive ? '+' : '-'}${data.amount} ${data.symbol}
        </div>
    `;
    
    container.insertBefore(item, container.firstChild);
    
    // Limitar a 10 items
    while (container.children.length > 10) {
        container.lastChild.remove();
    }
}

// ========================================
// Gas Estimation Display
// ========================================

document.getElementById('sendAmount').addEventListener('input', async (e) => {
    const amount = e.target.value;
    const to = document.getElementById('recipientAddress').value;
    
    if (!amount || !to || !wallet.isValidAddress(to)) {
        document.getElementById('gasEstimate').textContent = '--';
        return;
    }
    
    try {
        let gasEstimate;
        
        if (currentSendType === 'native') {
            gasEstimate = await wallet.estimateNativeGas(to, amount);
        } else if (currentSendType === 'token') {
            const contractAddress = document.getElementById('tokenSelect').value;
            if (contractAddress) {
                gasEstimate = await wallet.estimateTokenGas(contractAddress, to, amount);
            }
        }
        
        if (gasEstimate) {
            document.getElementById('gasEstimate').textContent = 
                `~${parseFloat(gasEstimate.totalCost).toFixed(6)} SYS`;
        }
    } catch {
        document.getElementById('gasEstimate').textContent = 'Error';
    }
});

// ========================================
// Utilidades adicionales
// ========================================

// Actualizar balance cuando la ventana vuelve a ser visible
document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && wallet.address) {
        await wallet.getNativeBalance();
        const mainBalanceEl = document.getElementById('mainBalance');
        if (mainBalanceEl) {
            mainBalanceEl.textContent = parseFloat(wallet.nativeBalance).toFixed(4);
        }
    }
});
