// ============================================
// 0xAddress - Popup Bridge
// Sesión persistente + UI Profesional
// ============================================

(function() {
    'use strict';

    console.log('🔌 Popup bridge initializing...');

    // Estado
    let pendingRequestsQueue = [];
    let isShowingRequest = false;
    let sessionPrivateKey = null;
    let walletUnlocked = false;

    const urlParams = new URLSearchParams(window.location.search);
    const hasPendingParam = urlParams.get('pending') === 'true';

    // Si hay solicitud pendiente, mostrar la pantalla de carga igual que la normal
    if (hasPendingParam) {
        // El loader normal se mostrará, solo ocultamos otros elementos
        const style = document.createElement('style');
        style.id = 'oxPendingStyles';
        style.textContent = `
            #mainView, #unlockModal, #setupModal, #app {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // Verificar si hay wallet
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const hasWallet = localStorage.getItem('0xaddress_encrypted_key') || 
                                  localStorage.getItem('0xwallet_encrypted_key');
                
                if (!hasWallet) {
                    // No hay wallet - mostrar setup modal
                    console.log('📋 No wallet found - showing setup');
                    const pendingStyles = document.getElementById('oxPendingStyles');
                    if (pendingStyles) {
                        pendingStyles.textContent = `
                            #loader, #mainView, #unlockModal, #app {
                                display: none !important;
                            }
                            #setupModal {
                                display: flex !important;
                            }
                        `;
                    }
                }
            }, 100);
        });
    }

    // Inyectar estilos
    injectStyles();

    // ========================================
    // Esperar a que la wallet se desbloquee
    // ========================================
    
    // Verificar periódicamente si la wallet está desbloqueada
    const checkWalletInterval = setInterval(() => {
        if (typeof wallet !== 'undefined' && wallet.address && !walletUnlocked) {
            walletUnlocked = true;
            console.log('🔓 Wallet detected as unlocked');
            onWalletUnlocked();
        }
    }, 500);

    async function onWalletUnlocked() {
        // Notificar al background
        try {
            const privateKey = wallet.getPrivateKey ? 
                (wallet._cachedPrivateKey || null) : null;
            
            await chrome.runtime.sendMessage({
                type: 'POPUP_UNLOCK',
                payload: { 
                    address: wallet.address,
                    privateKey: privateKey
                }
            });
            
            if (privateKey) {
                sessionPrivateKey = privateKey;
            }
        } catch (e) {
            console.error('Failed to notify unlock:', e);
        }
        
        // Verificar si hay sesión guardada
        try {
            const response = await chrome.runtime.sendMessage({ type: 'POPUP_GET_SESSION' });
            if (response.hasSession) {
                sessionPrivateKey = response.privateKey;
                console.log('🔓 Session restored, expires in', response.expiresIn, 'min');
            }
        } catch (e) {}
        
        // Verificar solicitudes pendientes
        setTimeout(checkAndShowPendingRequests, 300);
    }

    // Interceptar startApp para capturar la clave
    const originalStartApp = window.startApp;
    window.startApp = async function() {
        if (originalStartApp) {
            await originalStartApp();
        }
        
        // Marcar como desbloqueada
        if (typeof wallet !== 'undefined' && wallet.address) {
            walletUnlocked = true;
            onWalletUnlocked();
        }
    };

    // ========================================
    // Verificar solicitudes pendientes
    // ========================================
    async function checkAndShowPendingRequests() {
        if (isShowingRequest || !walletUnlocked) return;

        try {
            const response = await chrome.runtime.sendMessage({ type: 'POPUP_GET_PENDING' });
            
            if (response?.requests?.length > 0) {
                pendingRequestsQueue = response.requests;
                console.log('📋 Found', pendingRequestsQueue.length, 'pending requests');
                showNextRequest();
            }
        } catch (error) {
            console.error('Error checking pending:', error);
        }
    }

    function showNextRequest() {
        if (pendingRequestsQueue.length === 0) {
            isShowingRequest = false;
            
            // Si es popup de dApp (ventana separada), cerrar
            if (hasPendingParam) {
                console.log('📋 No more pending requests, closing window...');
                setTimeout(() => {
                    window.close();
                }, 300);
            } else {
                // Si es popup normal (click en icono), mostrar contenido principal
                showMainContent();
            }
            return;
        }

        isShowingRequest = true;
        showApprovalModal(pendingRequestsQueue[0]);
    }
    
    // Funciones para ocultar/mostrar contenido principal
    function hideMainContent() {
        const mainView = document.getElementById('mainView');
        const unlockModal = document.getElementById('unlockModal');
        const setupModal = document.getElementById('setupModal');
        const loader = document.getElementById('splashLoader');
        
        if (mainView) mainView.style.visibility = 'hidden';
        if (unlockModal) unlockModal.style.visibility = 'hidden';
        if (setupModal) setupModal.style.visibility = 'hidden';
        if (loader) loader.style.display = 'none';
        
        // Crear fondo oscuro temporal si no existe
        if (!document.getElementById('oxPendingBackdrop')) {
            const backdrop = document.createElement('div');
            backdrop.id = 'oxPendingBackdrop';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #0f0f1a;
                z-index: 9998;
            `;
            document.body.appendChild(backdrop);
        }
    }
    
    function showMainContent() {
        const mainView = document.getElementById('mainView');
        const unlockModal = document.getElementById('unlockModal');
        const setupModal = document.getElementById('setupModal');
        const backdrop = document.getElementById('oxPendingBackdrop');
        
        if (mainView) mainView.style.visibility = 'visible';
        if (unlockModal) unlockModal.style.visibility = 'visible';
        if (setupModal) setupModal.style.visibility = 'visible';
        if (backdrop) backdrop.remove();
    }

    // ========================================
    // Modal de Aprobación
    // ========================================
    async function showApprovalModal(request) {
        console.log('📋 Showing modal for:', request.method);
        
        removeModal();
        
        // Ocultar el loader si está visible
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
        
        // Remover el backdrop de pending si existe
        const pendingBackdrop = document.getElementById('oxPendingBackdrop');
        if (pendingBackdrop) {
            pendingBackdrop.remove();
        }
        
        // Ocultar contenido principal para evitar que se vea detrás
        hideMainContent();
        
        // Para transacciones, obtener el balance actualizado
        if (request.method === 'eth_sendTransaction' && wallet?.address) {
            try {
                const balanceWei = await wallet.provider.getBalance(wallet.address);
                wallet.nativeBalance = ethers.formatEther(balanceWei);
            } catch (e) {
                console.warn('Could not fetch balance:', e);
            }
        }

        // Detectar tema
        const isDark = document.body.classList.contains('dark-mode') || 
                       window.matchMedia('(prefers-color-scheme: dark)').matches ||
                       getComputedStyle(document.body).backgroundColor.includes('26, 26');

        const modal = document.createElement('div');
        modal.id = 'oxApprovalOverlay';
        modal.className = isDark ? 'ox-dark' : 'ox-light';
        
        // Función para generar el favicon con fallback simple
        const getFaviconElement = (favicon) => {
            if (!favicon || favicon === '' || favicon === 'undefined' || favicon === 'null') {
                return `<div class="ox-site-icon-fallback">🌐</div>`;
            }
            // Imagen sin handlers inline - se configuran después con JS
            return `<img src="${favicon}" class="ox-site-icon ox-favicon-check" style="display:none;"><div class="ox-site-icon-fallback">🌐</div>`;
        };
        
        modal.innerHTML = `
            <div class="ox-modal">
                <!-- Header - Compact layout -->
                <div class="ox-modal-header">
                    <div class="ox-site-info">
                        ${getFaviconElement(request.favicon)}
                        <div class="ox-site-details">
                            <div class="ox-site-name">${escapeHtml(request.title || 'Aplicación')}</div>
                            <div class="ox-site-origin">${escapeHtml(request.origin)}</div>
                        </div>
                    </div>
                    <div class="ox-request-badge-small">${getRequestBadgeSmall(request.method)}</div>
                </div>

                <!-- Content -->
                <div class="ox-modal-content">
                    ${getRequestUI(request)}
                </div>

                <!-- Account Info -->
                <div class="ox-account-bar">
                    <span class="ox-account-label">CUENTA</span>
                    <div class="ox-account-info">
                        <div class="ox-account-avatar">${wallet?.address?.slice(2, 4).toUpperCase() || '0x'}</div>
                        <span class="ox-account-address">${wallet?.address ? wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4) : '-'}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="ox-modal-actions">
                    <button class="ox-btn ox-btn-secondary" id="oxRejectBtn">
                        ${typeof t === 'function' ? t('reject') : 'Rechazar'}
                    </button>
                    <button class="ox-btn ox-btn-primary" id="oxApproveBtn">
                        ${getApproveText(request.method)}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('oxRejectBtn').onclick = () => rejectRequest(request);
        document.getElementById('oxApproveBtn').onclick = () => handleApprove(request);

        // Configurar favicons sin inline handlers
        setupFaviconHandlers();

        // Animación
        requestAnimationFrame(() => {
            modal.classList.add('ox-visible');
        });
    }

    // Función para configurar handlers de favicon sin usar inline JS
    function setupFaviconHandlers() {
        document.querySelectorAll('.ox-favicon-check').forEach(img => {
            const fallback = img.nextElementSibling;
            
            img.onload = function() {
                this.style.display = 'block';
                if (fallback) fallback.style.display = 'none';
            };
            
            img.onerror = function() {
                this.style.display = 'none';
                if (fallback) fallback.style.display = 'flex';
            };
            
            // Si la imagen ya está cacheada, verificar estado
            if (img.complete) {
                if (img.naturalWidth > 0) {
                    img.style.display = 'block';
                    if (fallback) fallback.style.display = 'none';
                } else {
                    img.style.display = 'none';
                    if (fallback) fallback.style.display = 'flex';
                }
            }
        });
    }

    function getRequestBadge(method) {
        const badges = {
            'eth_requestAccounts': `🔗 ${typeof t === 'function' ? t('connection') : 'Conexión'}`,
            'personal_sign': `✍️ ${typeof t === 'function' ? t('signature') : 'Firma'}`,
            'eth_sign': `✍️ ${typeof t === 'function' ? t('signature') : 'Firma'}`,
            'eth_signTypedData_v4': '📝 EIP-712',
            'eth_sendTransaction': `📤 ${typeof t === 'function' ? t('transaction') : 'Transacción'}`,
            'wallet_addEthereumChain': `🌐 ${typeof t === 'function' ? t('addNetwork') : 'Agregar Red'}`,
            'wallet_switchEthereumChain': `🔄 ${typeof t === 'function' ? t('switchNetwork') : 'Cambiar Red'}`
        };
        return badges[method] || `📋 ${typeof t === 'function' ? t('request') : 'Solicitud'}`;
    }

    function getRequestBadgeSmall(method) {
        const badges = {
            'eth_requestAccounts': '🔗',
            'personal_sign': '✍️',
            'eth_sign': '✍️',
            'eth_signTypedData_v4': '📝',
            'eth_sendTransaction': '📤',
            'wallet_addEthereumChain': '🌐',
            'wallet_switchEthereumChain': '🔄'
        };
        return badges[method] || '📋';
    }

    function getApproveText(method) {
        const texts = {
            'eth_requestAccounts': typeof t === 'function' ? t('connect') : 'Conectar',
            'personal_sign': typeof t === 'function' ? t('sign') : 'Firmar',
            'eth_sign': typeof t === 'function' ? t('sign') : 'Firmar',
            'eth_signTypedData_v4': typeof t === 'function' ? t('sign') : 'Firmar',
            'eth_sendTransaction': typeof t === 'function' ? t('confirm') : 'Confirmar',
            'wallet_addEthereumChain': typeof t === 'function' ? t('addAndSwitch') : 'Agregar y Cambiar',
            'wallet_switchEthereumChain': typeof t === 'function' ? t('switchNetwork') : 'Cambiar Red'
        };
        return texts[method] || (typeof t === 'function' ? t('approve') : 'Aprobar');
    }

    function getRequestUI(request) {
        switch (request.method) {
            case 'eth_requestAccounts':
                return `
                    <div class="ox-request-header">
                        <div class="ox-request-icon">🔗</div>
                        <div class="ox-request-title">${typeof t === 'function' ? t('connectRequest') : 'Solicitud de Conexión'}</div>
                    </div>
                    <p class="ox-request-desc">${typeof t === 'function' ? t('wantsToConnect') : 'Este sitio quiere conectarse a tu wallet'}</p>
                    
                    <div class="ox-permissions">
                        <div class="ox-permission-title">${typeof t === 'function' ? t('thisSiteWill') : 'ESTE SITIO PODRÁ'}:</div>
                        <div class="ox-permission-item">
                            <span class="ox-check">✓</span>
                            <span>${typeof t === 'function' ? t('viewPublicAddress') : 'Ver tu dirección pública'}</span>
                        </div>
                        <div class="ox-permission-item">
                            <span class="ox-check">✓</span>
                            <span>${typeof t === 'function' ? t('viewAccountBalance') : 'Ver el balance de tu cuenta'}</span>
                        </div>
                        <div class="ox-permission-item">
                            <span class="ox-check">✓</span>
                            <span>${typeof t === 'function' ? t('requestSignaturesAndTx') : 'Solicitar firmas y transacciones'}</span>
                        </div>
                    </div>
                `;

            case 'personal_sign':
            case 'eth_sign':
                const message = decodeMessage(request.params?.[0] || '');
                return `
                    <div class="ox-request-header">
                        <div class="ox-request-icon">✍️</div>
                        <div class="ox-request-title">${typeof t === 'function' ? t('signMessage') : 'Firma de Mensaje'}</div>
                    </div>
                    <p class="ox-request-desc">${typeof t === 'function' ? t('signMessageDesc') : 'Solicitud para firmar el siguiente mensaje'}</p>
                    
                    <div class="ox-data-box">
                        <div class="ox-data-label">${typeof t === 'function' ? t('messageToSign') : 'MENSAJE A FIRMAR'}</div>
                        <div class="ox-message-content">${escapeHtml(message)}</div>
                    </div>

                    <div class="ox-info-box">
                        <span>ℹ️</span>
                        <span>${typeof t === 'function' ? t('signingIsSafe') : 'Firmar mensajes es seguro y no cuesta gas.'}</span>
                    </div>
                `;

            case 'eth_signTypedData_v4':
                let typedInfo = { type: 'Datos Tipados', domain: '-' };
                try {
                    const data = typeof request.params[1] === 'string' 
                        ? JSON.parse(request.params[1]) 
                        : request.params[1];
                    typedInfo.type = data.primaryType || 'Typed Data';
                    typedInfo.domain = data.domain?.name || '-';
                } catch (e) {}
                
                return `
                    <div class="ox-request-header">
                        <div class="ox-request-icon">📝</div>
                        <div class="ox-request-title">${typeof t === 'function' ? t('signTypedData') : 'Firma Tipada (EIP-712)'}</div>
                    </div>
                    <p class="ox-request-desc">${typeof t === 'function' ? t('structuredDataSignature') : 'Firma de datos estructurados'}</p>
                    
                    <div class="ox-data-box">
                        <div class="ox-data-row">
                            <span class="ox-data-key">${typeof t === 'function' ? t('type') : 'Tipo'}</span>
                            <span class="ox-data-value">${escapeHtml(typedInfo.type)}</span>
                        </div>
                        <div class="ox-data-row">
                            <span class="ox-data-key">${typeof t === 'function' ? t('domain') : 'Dominio'}</span>
                            <span class="ox-data-value">${escapeHtml(typedInfo.domain)}</span>
                        </div>
                    </div>

                    <div class="ox-warning-box">
                        <span>⚠️</span>
                        <span>${typeof t === 'function' ? t('eip712Warning') : 'Las firmas EIP-712 pueden autorizar acciones. Revisa cuidadosamente.'}</span>
                    </div>
                `;

            case 'eth_sendTransaction':
                const tx = request.params?.[0] || {};
                const value = tx.value ? (parseInt(tx.value, 16) / 1e18) : 0;
                const hasData = tx.data && tx.data !== '0x' && tx.data.length > 2;
                const symbol = getCurrentSymbol();
                const currentBalance = parseFloat(wallet?.nativeBalance || '0');
                const hasInsufficientFunds = value > currentBalance;
                
                const txTitle = hasData 
                    ? (typeof t === 'function' ? t('contractInteraction') : 'Interacción con Contrato')
                    : (typeof t === 'function' ? t('send') : 'Enviar') + ' ' + symbol;
                const toLabel = typeof t === 'function' ? t('toAddress') : 'Para';
                const dataLabel = typeof t === 'function' ? t('data') : 'Datos';
                const newContractLabel = typeof t === 'function' ? t('newContract') : 'Nuevo contrato';
                const txWillSendLabel = typeof t === 'function' ? t('txWillSend') : 'Esta transacción enviará';
                const insufficientLabel = typeof t === 'function' ? t('insufficientFunds') : 'Fondos insuficientes';
                
                return `
                    <div class="ox-tx-header">
                        <div class="ox-tx-icon">${hasData ? '📄' : '📤'}</div>
                        <div class="ox-tx-title">${txTitle}</div>
                    </div>
                    
                    <div class="ox-tx-amount">
                        <div class="ox-tx-value">${value.toFixed(6)}</div>
                        <div class="ox-tx-symbol">${symbol}</div>
                    </div>

                    <div class="ox-data-box">
                        <div class="ox-data-row">
                            <span class="ox-data-key">${toLabel}</span>
                            <span class="ox-data-value ox-mono">${tx.to ? tx.to.slice(0, 10) + '...' + tx.to.slice(-8) : newContractLabel}</span>
                        </div>
                        ${hasData ? `
                        <div class="ox-data-row">
                            <span class="ox-data-key">${dataLabel}</span>
                            <span class="ox-data-value ox-mono">${tx.data.slice(0, 10)}...</span>
                        </div>
                        ` : ''}
                    </div>

                    ${value > 0 ? `
                    <div class="ox-warning-box ox-warning">
                        <span>⚠️</span>
                        <span>${txWillSendLabel} ${value.toFixed(6)} ${symbol}</span>
                    </div>
                    ` : ''}
                    
                    ${hasInsufficientFunds ? `
                    <div class="ox-error-box">
                        <span>❌</span>
                        <span>${insufficientLabel}. ${currentBalance.toFixed(6)} ${symbol}</span>
                    </div>
                    ` : ''}
                `;

            case 'wallet_addEthereumChain':
                const networkParams = request.networkParams || {};
                const addNetworkTitle = typeof t === 'function' ? t('addNetworkRequest') : 'Solicitud de Nueva Red';
                const addNetworkDesc = typeof t === 'function' ? t('wantsToAddNetwork') : 'Este sitio quiere agregar una nueva red';
                const networkNameLabel = typeof t === 'function' ? t('networkName') : 'Nombre de Red';
                const chainIdLabel = typeof t === 'function' ? t('chainId') : 'Chain ID';
                const rpcUrlLabel = typeof t === 'function' ? t('rpcUrl') : 'RPC URL';
                const currencyLabel = typeof t === 'function' ? t('currency') : 'Moneda';
                const explorerLabel = typeof t === 'function' ? t('explorer') : 'Explorador';
                const addNetworkWarning = typeof t === 'function' ? t('addNetworkWarning') : 'Verifica que esta red sea de confianza antes de agregarla.';
                
                return `
                    <div class="ox-request-header">
                        <div class="ox-request-icon">🌐</div>
                        <div class="ox-request-title">${addNetworkTitle}</div>
                    </div>
                    <p class="ox-request-desc">${addNetworkDesc}</p>
                    
                    <div class="ox-data-box">
                        <div class="ox-data-row">
                            <span class="ox-data-key">${networkNameLabel}</span>
                            <span class="ox-data-value">${escapeHtml(networkParams.name || 'Unknown')}</span>
                        </div>
                        <div class="ox-data-row">
                            <span class="ox-data-key">${chainIdLabel}</span>
                            <span class="ox-data-value">${networkParams.chainId || '?'} (${networkParams.chainIdHex || '?'})</span>
                        </div>
                        <div class="ox-data-row">
                            <span class="ox-data-key">${rpcUrlLabel}</span>
                            <span class="ox-data-value ox-mono" style="font-size: 11px;">${escapeHtml(networkParams.rpcUrl || '')}</span>
                        </div>
                        <div class="ox-data-row">
                            <span class="ox-data-key">${currencyLabel}</span>
                            <span class="ox-data-value">${escapeHtml(networkParams.currency?.symbol || 'ETH')}</span>
                        </div>
                        ${networkParams.explorer ? `
                        <div class="ox-data-row">
                            <span class="ox-data-key">${explorerLabel}</span>
                            <span class="ox-data-value ox-mono" style="font-size: 11px;">${escapeHtml(networkParams.explorer)}</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="ox-warning-box">
                        <span>⚠️</span>
                        <span>${addNetworkWarning}</span>
                    </div>
                `;

            case 'wallet_switchEthereumChain':
                const switchParams = request.networkParams || {};
                const switchNetworkTitle = typeof t === 'function' ? t('switchNetworkRequest') : 'Cambiar de Red';
                const switchNetworkDesc = typeof t === 'function' ? t('wantsToSwitchNetwork') : 'Este sitio quiere cambiar a otra red';
                const switchToLabel = typeof t === 'function' ? t('switchTo') : 'Cambiar a';
                const switchChainIdLabel = typeof t === 'function' ? t('chainId') : 'Chain ID';
                
                return `
                    <div class="ox-request-header">
                        <div class="ox-request-icon">🔄</div>
                        <div class="ox-request-title">${switchNetworkTitle}</div>
                    </div>
                    <p class="ox-request-desc">${switchNetworkDesc}</p>
                    
                    <div class="ox-data-box">
                        <div class="ox-data-row">
                            <span class="ox-data-key">${switchToLabel}</span>
                            <span class="ox-data-value" style="font-weight: 600; font-size: 14px;">${escapeHtml(switchParams.name || 'Unknown')}</span>
                        </div>
                        <div class="ox-data-row">
                            <span class="ox-data-key">${switchChainIdLabel}</span>
                            <span class="ox-data-value">${switchParams.chainId || '?'} (${switchParams.chainIdHex || '?'})</span>
                        </div>
                    </div>
                `;

            default:
                return `
                    <div class="ox-request-header">
                        <div class="ox-request-icon">📋</div>
                        <div class="ox-request-title">${escapeHtml(request.method)}</div>
                    </div>
                    <p class="ox-request-desc">${typeof t === 'function' ? t('request') : 'Solicitud'}</p>
                `;
        }
    }

    // ========================================
    // Manejar aprobación
    // ========================================
    async function handleApprove(request) {
        // Conexión - aprobar directo
        if (request.method === 'eth_requestAccounts') {
            await approveConnection(request);
            return;
        }

        // Agregar red - aprobar directo (no requiere contraseña)
        if (request.method === 'wallet_addEthereumChain') {
            await approveAddNetwork(request);
            return;
        }

        // Cambiar red - aprobar directo (no requiere contraseña)
        if (request.method === 'wallet_switchEthereumChain') {
            await approveSwitchNetwork(request);
            return;
        }

        // Para transacciones, verificar balance
        if (request.method === 'eth_sendTransaction') {
            const tx = request.params?.[0] || {};
            const value = tx.value ? (parseInt(tx.value, 16) / 1e18) : 0;
            const currentBalance = parseFloat(wallet?.nativeBalance || '0');
            
            if (value > currentBalance) {
                showErrorModal('Saldo Insuficiente', `No tienes suficiente saldo para esta transacción.\n\nNecesitas: ${value.toFixed(6)} ${getCurrentSymbol()}\nTienes: ${currentBalance.toFixed(6)} ${getCurrentSymbol()}`);
                return;
            }
        }

        // Verificar si hay sesión activa
        if (sessionPrivateKey) {
            await executeWithSession(request);
        } else {
            // Pedir contraseña
            showPasswordModal(request);
        }
    }

    async function approveSwitchNetwork(request) {
        setButtonLoading('oxApproveBtn', true);
        
        try {
            await chrome.runtime.sendMessage({
                type: 'POPUP_APPROVE_REQUEST',
                payload: { 
                    requestId: request.id,
                    result: null
                }
            });
            
            const networkName = request.networkParams?.name || 'Red';
            const networkId = request.networkParams?.networkId;
            
            closeAndNext();
            showNotification('success', `Cambiado a ${networkName}`);
            
            // Usar selectNetwork para actualizar la UI completamente
            if (networkId && typeof selectNetwork === 'function') {
                setTimeout(() => {
                    selectNetwork(networkId);
                }, 300);
            }
        } catch (e) {
            showNotification('error', e.message);
            setButtonLoading('oxApproveBtn', false);
        }
    }

    async function approveAddNetwork(request) {
        setButtonLoading('oxApproveBtn', true);
        
        try {
            // Enviar al background para que agregue la red
            await chrome.runtime.sendMessage({
                type: 'POPUP_APPROVE_REQUEST',
                payload: { 
                    requestId: request.id,
                    result: null // wallet_addEthereumChain retorna null en éxito
                }
            });
            
            const networkName = request.networkParams?.name || 'Nueva red';
            const networkId = request.networkParams?.existingNetworkId || `custom_${request.networkParams?.chainId}`;
            
            closeAndNext();
            showNotification('success', `${networkName} agregada`);
            
            // Usar selectNetwork para actualizar la UI completamente
            if (networkId && typeof selectNetwork === 'function') {
                setTimeout(() => {
                    selectNetwork(networkId);
                }, 300);
            }
        } catch (e) {
            showNotification('error', e.message);
            setButtonLoading('oxApproveBtn', false);
        }
    }

    function showErrorModal(title, message) {
        const content = document.querySelector('.ox-modal-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="ox-error-modal">
                <div class="ox-error-icon">❌</div>
                <div class="ox-error-title">${escapeHtml(title)}</div>
                <div class="ox-error-message">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        // Update button to only close
        const approveBtn = document.getElementById('oxApproveBtn');
        if (approveBtn) {
            approveBtn.style.display = 'none';
        }
        
        const rejectBtn = document.getElementById('oxRejectBtn');
        if (rejectBtn) {
            rejectBtn.textContent = 'Cerrar';
        }
    }

    async function approveConnection(request) {
        setButtonLoading('oxApproveBtn', true);
        
        try {
            await chrome.runtime.sendMessage({
                type: 'POPUP_APPROVE_REQUEST',
                payload: { requestId: request.id }
            });
            closeAndNext();
            showNotification('success', 'Conectado exitosamente');
        } catch (e) {
            showNotification('error', e.message);
            setButtonLoading('oxApproveBtn', false);
        }
    }

    async function executeWithSession(request) {
        setButtonLoading('oxApproveBtn', true);
        
        try {
            const result = await executeAction(request, sessionPrivateKey);
            
            await chrome.runtime.sendMessage({
                type: 'POPUP_APPROVE_REQUEST',
                payload: { requestId: request.id, result }
            });

            closeAndNext();
            
            const msg = request.method.includes('sign') ? 'Mensaje firmado correctamente' : 'Transacción enviada';
            showNotification('success', msg);
        } catch (error) {
            console.error('Execution error:', error);
            
            // Parsear error para mensaje amigable
            let friendlyError = 'Error al ejecutar';
            const errorMsg = error.message || '';
            
            if (errorMsg.includes('insufficient funds')) {
                friendlyError = 'Fondos insuficientes para gas + valor';
            } else if (errorMsg.includes('nonce')) {
                friendlyError = 'Error de nonce, intenta de nuevo';
            } else if (errorMsg.includes('gas')) {
                friendlyError = 'Error estimando gas';
            } else if (errorMsg.includes('rejected')) {
                friendlyError = 'Transacción rechazada';
            } else if (errorMsg.length > 50) {
                friendlyError = errorMsg.substring(0, 50) + '...';
            } else {
                friendlyError = errorMsg || 'Error desconocido';
            }
            
            showNotification('error', friendlyError);
            
            // Rechazar la solicitud para que el dApp no quede esperando
            try {
                await chrome.runtime.sendMessage({
                    type: 'POPUP_REJECT_REQUEST',
                    payload: { requestId: request.id, error: friendlyError }
                });
            } catch (e) {}
            
            closeAndNext();
        }
    }

    function showPasswordModal(request) {
        const content = document.querySelector('.ox-modal-content');
        if (!content) return;

        content.innerHTML = `
            <div class="ox-request-header">
                <div class="ox-request-icon">🔐</div>
                <div class="ox-request-title">${typeof t === 'function' ? t('confirmAction') : 'Confirmar Acción'}</div>
            </div>
            <p class="ox-request-desc">${typeof t === 'function' ? t('enterPasswordToContinue') : 'Ingresa tu contraseña para continuar'}</p>
            
            <div class="ox-input-group">
                <input type="password" id="oxPasswordInput" class="ox-input" placeholder="${typeof t === 'function' ? t('yourPassword') : 'Tu contraseña'}" autofocus>
                <p class="ox-error" id="oxPasswordError"></p>
            </div>
        `;

        const input = document.getElementById('oxPasswordInput');
        setTimeout(() => input?.focus(), 100);
        
        // Actualizar botones
        document.getElementById('oxApproveBtn').onclick = () => executeWithPassword(request);
        input.onkeypress = (e) => {
            if (e.key === 'Enter') executeWithPassword(request);
        };
    }

    async function executeWithPassword(request) {
        const password = document.getElementById('oxPasswordInput')?.value;
        const errorEl = document.getElementById('oxPasswordError');
        
        if (!password) {
            if (errorEl) errorEl.textContent = typeof t === 'function' ? t('enterPassword') : 'Ingresa tu contraseña';
            return;
        }

        if (!wallet.verifyPassword(password)) {
            if (errorEl) errorEl.textContent = typeof t === 'function' ? t('wrongPassword') : 'Contraseña incorrecta';
            document.getElementById('oxPasswordInput').value = '';
            return;
        }

        // Mostrar overlay de procesamiento
        showProcessingOverlay(typeof t === 'function' ? t('unlocking') : 'Desbloqueando...');

        try {
            // Pequeña pausa para mostrar el overlay
            await new Promise(r => setTimeout(r, 100));
            
            // Obtener la llave privada y guardar sesión
            updateProcessingMessage(typeof t === 'function' ? t('derivingKey') : 'Derivando clave PBKDF2...');
            const privateKey = wallet.getPrivateKey(password);
            sessionPrivateKey = privateKey;
            
            // Guardar sesión en background
            updateProcessingMessage(typeof t === 'function' ? t('savingSession') : 'Guardando sesión...');
            await chrome.runtime.sendMessage({
                type: 'POPUP_SAVE_SESSION',
                payload: { privateKey }
            });

            updateProcessingMessage(typeof t === 'function' ? t('executingAction') : 'Ejecutando acción...');
            const result = await executeAction(request, privateKey);
            
            await chrome.runtime.sendMessage({
                type: 'POPUP_APPROVE_REQUEST',
                payload: { requestId: request.id, result }
            });

            updateProcessingMessage(typeof t === 'function' ? t('completed') : '¡Completado!');
            await new Promise(r => setTimeout(r, 300));
            
            hideProcessingOverlay();
            closeAndNext();
            
            const msg = request.method.includes('sign') 
                ? (typeof t === 'function' ? t('successMessageSigned') : 'Mensaje firmado correctamente')
                : (typeof t === 'function' ? t('successTransactionSent') : 'Transacción enviada');
            showNotification('success', msg);
        } catch (error) {
            console.error('Execution error:', error);
            hideProcessingOverlay();
            
            // Parsear error para mensaje amigable
            let friendlyError = typeof t === 'function' ? t('errorExecuting') : 'Error al ejecutar';
            const errorMsg = error.message || '';
            
            if (errorMsg.includes('insufficient funds')) {
                friendlyError = typeof t === 'function' ? t('errorInsufficientFunds') : 'Fondos insuficientes para gas + valor';
            } else if (errorMsg.includes('nonce')) {
                friendlyError = typeof t === 'function' ? t('errorNonce') : 'Error de nonce, intenta de nuevo';
            } else if (errorMsg.includes('gas')) {
                friendlyError = typeof t === 'function' ? t('errorEstimatingGas') : 'Error estimando gas';
            } else if (errorMsg.includes('rejected')) {
                friendlyError = typeof t === 'function' ? t('errorRejected') : 'Transacción rechazada';
            } else if (errorMsg.length > 50) {
                friendlyError = errorMsg.substring(0, 50) + '...';
            } else {
                friendlyError = errorMsg || (typeof t === 'function' ? t('errorUnknown') : 'Error desconocido');
            }
            
            // Mostrar error en el modal
            showNotification('error', friendlyError);
            
            // Rechazar la solicitud en el background para que el dApp no quede esperando
            try {
                await chrome.runtime.sendMessage({
                    type: 'POPUP_REJECT_REQUEST',
                    payload: { requestId: request.id, error: friendlyError }
                });
            } catch (e) {}
            
            closeAndNext();
        }
    }

    async function executeAction(request, privateKey) {
        const provider = new ethers.JsonRpcProvider(NetworkManager.getCurrentNetwork().rpcUrl);
        const signer = new ethers.Wallet(privateKey, provider);

        switch (request.method) {
            case 'personal_sign': {
                const message = request.params[0];
                const msgToSign = message.startsWith('0x') ? ethers.toUtf8String(message) : message;
                return await signer.signMessage(msgToSign);
            }

            case 'eth_sign': {
                const hash = request.params[1];
                return await signer.signMessage(ethers.getBytes(hash));
            }

            case 'eth_signTypedData_v4': {
                const typedData = typeof request.params[1] === 'string' 
                    ? JSON.parse(request.params[1]) 
                    : request.params[1];
                const { domain, types, message } = typedData;
                const cleanTypes = { ...types };
                delete cleanTypes.EIP712Domain;
                return await signer.signTypedData(domain, cleanTypes, message);
            }

            case 'eth_sendTransaction': {
                const tx = request.params[0];
                
                // Construir objeto de transacción
                const txParams = {
                    to: tx.to || undefined, // undefined para deploy de contrato
                    value: tx.value || '0x0',
                    data: tx.data || '0x'
                };
                
                // Gas limit
                if (tx.gas) txParams.gasLimit = tx.gas;
                else if (tx.gasLimit) txParams.gasLimit = tx.gasLimit;
                
                // Gas price (legacy)
                if (tx.gasPrice) txParams.gasPrice = tx.gasPrice;
                
                // EIP-1559 gas
                if (tx.maxFeePerGas) txParams.maxFeePerGas = tx.maxFeePerGas;
                if (tx.maxPriorityFeePerGas) txParams.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
                
                // Nonce (si se especifica)
                if (tx.nonce !== undefined) txParams.nonce = parseInt(tx.nonce, 16);
                
                const txResponse = await signer.sendTransaction(txParams);
                
                if (!txResponse.hash) {
                    throw new Error('No transaction hash returned');
                }
                
                // Esperar a que la transacción sea visible en el nodo (polling)
                const maxAttempts = 10;
                const delayMs = 500;
                
                for (let i = 0; i < maxAttempts; i++) {
                    try {
                        const txData = await wallet.provider.getTransaction(txResponse.hash);
                        if (txData) {
                            break;
                        }
                    } catch (e) {
                        // Ignorar errores de polling
                    }
                    await new Promise(r => setTimeout(r, delayMs));
                }
                
                return txResponse.hash;
            }

            default:
                throw new Error('Método no soportado: ' + request.method);
        }
    }

    // ========================================
    // Rechazar
    // ========================================
    async function rejectRequest(request) {
        try {
            await chrome.runtime.sendMessage({
                type: 'POPUP_REJECT_REQUEST',
                payload: { requestId: request.id }
            });
        } catch (e) {}

        closeAndNext();
        showNotification('info', 'Solicitud rechazada');
    }

    // ========================================
    // UI Helpers
    // ========================================
    function removeModal() {
        const existing = document.getElementById('oxApprovalOverlay');
        if (existing) existing.remove();
    }

    function closeAndNext() {
        const modal = document.getElementById('oxApprovalOverlay');
        if (modal) {
            modal.classList.remove('ox-visible');
            setTimeout(() => modal.remove(), 200);
        }
        
        pendingRequestsQueue.shift();
        isShowingRequest = false;
        
        // Si no hay más solicitudes, mostrar pantalla de cierre
        if (pendingRequestsQueue.length === 0) {
            showClosingScreen();
        } else {
            setTimeout(showNextRequest, 300);
        }
    }

    function showClosingScreen() {
        // Crear pantalla de cierre con logo
        const closingScreen = document.createElement('div');
        closingScreen.id = 'oxClosingScreen';
        closingScreen.innerHTML = `
            <div class="ox-closing-content">
                <div class="ox-closing-logo">
                    <span class="ox-logo-hex">0x</span><span class="ox-logo-text">address</span>
                </div>
                <div class="ox-closing-message">✓</div>
            </div>
        `;
        document.body.appendChild(closingScreen);
        
        // Mostrar con animación
        requestAnimationFrame(() => {
            closingScreen.classList.add('ox-visible');
        });
        
        // Cerrar después de un momento
        setTimeout(() => {
            window.close();
        }, 800);
    }

    function setButtonLoading(id, loading) {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        if (loading) {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.innerHTML = '<span class="ox-spinner"></span>';
        } else {
            btn.disabled = false;
            btn.textContent = btn.dataset.originalText || 'Aprobar';
        }
    }

    // Overlay de procesamiento con spinner
    function showProcessingOverlay(message = 'Procesando...') {
        // Remover overlay existente si hay
        hideProcessingOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'oxProcessingOverlay';
        overlay.innerHTML = `
            <div class="ox-processing-content">
                <div class="ox-processing-spinner"></div>
                <div class="ox-processing-message" id="oxProcessingMessage">${escapeHtml(message)}</div>
                <div class="ox-processing-bar">
                    <div class="ox-processing-bar-fill" id="oxProcessingBar"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Iniciar animación de barra
        setTimeout(() => {
            const bar = document.getElementById('oxProcessingBar');
            if (bar) bar.style.width = '70%';
        }, 100);
    }
    
    function updateProcessingMessage(message) {
        const msgEl = document.getElementById('oxProcessingMessage');
        if (msgEl) {
            msgEl.style.opacity = '0';
            setTimeout(() => {
                msgEl.textContent = message;
                msgEl.style.opacity = '1';
            }, 150);
        }
    }
    
    function hideProcessingOverlay() {
        const overlay = document.getElementById('oxProcessingOverlay');
        if (overlay) {
            // Completar barra al 100%
            const bar = document.getElementById('oxProcessingBar');
            if (bar) bar.style.width = '100%';
            
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // Control de notificaciones duplicadas
    let lastNotification = { message: '', timestamp: 0 };
    const NOTIFICATION_DEBOUNCE_MS = 2000; // 2 segundos entre notificaciones iguales
    
    function showNotification(type, message) {
        // Verificar si las notificaciones están habilitadas
        try {
            const prefs = JSON.parse(localStorage.getItem('0xaddress_preferences') || '{}');
            if (prefs.showNotifications === false) {
                console.log('Notification suppressed:', type, message);
                return;
            }
        } catch (e) {}
        
        // Evitar notificaciones duplicadas en corto tiempo
        const now = Date.now();
        if (message === lastNotification.message && 
            (now - lastNotification.timestamp) < NOTIFICATION_DEBOUNCE_MS) {
            console.log('Duplicate notification suppressed:', message);
            return;
        }
        lastNotification = { message, timestamp: now };
        
        // Remover notificaciones anteriores del mismo tipo
        document.querySelectorAll(`.ox-toast-${type}`).forEach(toast => {
            toast.remove();
        });
        
        // Usar el toast de 0xAddress si existe
        if (typeof showToast === 'function') {
            showToast(type, type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ', message);
        } else {
            // Crear notificación simple
            const toast = document.createElement('div');
            toast.className = `ox-toast ox-toast-${type}`;
            toast.innerHTML = `
                <span class="ox-toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
                <span class="ox-toast-text">${escapeHtml(message)}</span>
            `;
            document.body.appendChild(toast);
            
            requestAnimationFrame(() => toast.classList.add('ox-toast-visible'));
            setTimeout(() => {
                toast.classList.remove('ox-toast-visible');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function decodeMessage(message) {
        if (!message) return '';
        if (!message.startsWith('0x')) return message;
        
        try {
            const bytes = [];
            for (let i = 2; i < message.length; i += 2) {
                bytes.push(parseInt(message.substr(i, 2), 16));
            }
            return new TextDecoder().decode(new Uint8Array(bytes));
        } catch (e) {
            return message;
        }
    }

    function getCurrentSymbol() {
        try {
            return NetworkManager.getCurrentNetwork().currency?.symbol || 'ETH';
        } catch (e) {
            return 'ETH';
        }
    }

    // ========================================
    // Estilos - Con colores fijos para evitar problemas
    // ========================================
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #oxApprovalOverlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            #oxApprovalOverlay.ox-visible {
                opacity: 1;
            }

            /* Tema oscuro (default) */
            .ox-modal {
                background: #1a1a2e;
                border-radius: 16px;
                width: 100%;
                max-width: 360px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                overflow: hidden;
                transform: scale(0.95);
                transition: transform 0.2s ease;
                color: #ffffff;
            }

            /* Tema claro */
            .ox-light .ox-modal {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                color: #1f2937;
            }

            .ox-visible .ox-modal {
                transform: scale(1);
            }

            .ox-modal-header {
                padding: 16px 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .ox-site-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .ox-site-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                background: white;
                padding: 2px;
                object-fit: contain;
            }

            .ox-site-icon-fallback {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                padding: 2px;
            }

            .ox-site-icon-fallback svg {
                width: 100%;
                height: 100%;
                border-radius: 8px;
            }

            .ox-site-name {
                font-weight: 600;
                font-size: 14px;
                color: white;
            }

            .ox-site-origin {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.8);
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .ox-request-badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 6px 10px;
                border-radius: 20px;
                font-size: 11px;
                color: white;
                font-weight: 500;
            }

            .ox-request-badge-small {
                background: rgba(255, 255, 255, 0.2);
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 14px;
            }

            .ox-modal-content {
                padding: 20px;
            }

            .ox-tx-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
            }

            .ox-tx-icon {
                font-size: 22px;
            }

            .ox-tx-title {
                font-size: 15px;
                font-weight: 600;
            }

            .ox-error-box {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                background: rgba(239, 68, 68, 0.15);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 8px;
                font-size: 12px;
                color: #ef4444;
                margin-top: 10px;
            }

            .ox-light .ox-error-box {
                background: rgba(239, 68, 68, 0.1);
            }

            .ox-request-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
            }

            .ox-request-icon {
                font-size: 28px;
            }

            .ox-request-title {
                font-size: 18px;
                font-weight: 600;
            }

            .ox-light .ox-request-title {
                color: #1f2937;
            }

            .ox-request-desc {
                color: #9ca3af;
                font-size: 13px;
                margin-bottom: 20px;
            }

            .ox-permissions {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 12px;
                padding: 16px;
            }

            .ox-light .ox-permissions {
                background: #f3f4f6;
            }

            .ox-permission-title {
                font-size: 11px;
                color: #9ca3af;
                margin-bottom: 12px;
                letter-spacing: 0.5px;
            }

            .ox-permission-item {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                padding: 8px 0;
                color: #e5e7eb;
            }

            .ox-light .ox-permission-item {
                color: #374151;
            }

            .ox-check {
                color: #10b981;
                font-weight: bold;
                font-size: 14px;
            }

            .ox-data-box {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
            }

            .ox-light .ox-data-box {
                background: #f3f4f6;
            }

            .ox-data-label {
                font-size: 11px;
                color: #9ca3af;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }

            .ox-message-content {
                font-size: 13px;
                line-height: 1.5;
                max-height: 100px;
                overflow-y: auto;
                word-break: break-word;
                font-family: monospace;
                background: rgba(0, 0, 0, 0.2);
                padding: 12px;
                border-radius: 8px;
                color: #e5e7eb;
            }

            .ox-light .ox-message-content {
                background: #e5e7eb;
                color: #374151;
            }

            .ox-data-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .ox-light .ox-data-row {
                border-bottom-color: #e5e7eb;
            }

            .ox-data-row:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .ox-data-row:first-child {
                padding-top: 0;
            }

            .ox-data-key {
                font-size: 12px;
                color: #9ca3af;
            }

            .ox-data-value {
                font-size: 13px;
                color: #e5e7eb;
            }

            .ox-light .ox-data-value {
                color: #374151;
            }

            .ox-mono {
                font-family: monospace;
            }

            .ox-tx-amount {
                text-align: center;
                padding: 24px;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
                border-radius: 12px;
                margin-bottom: 16px;
            }

            .ox-tx-value {
                font-size: 32px;
                font-weight: 700;
            }

            .ox-light .ox-tx-value {
                color: #1f2937;
            }

            .ox-tx-symbol {
                font-size: 14px;
                color: #9ca3af;
                margin-top: 4px;
            }

            .ox-info-box {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 12px;
                background: rgba(59, 130, 246, 0.1);
                border-radius: 10px;
                font-size: 12px;
                color: #60a5fa;
            }

            .ox-warning-box {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 12px;
                background: rgba(245, 158, 11, 0.1);
                border-radius: 10px;
                font-size: 12px;
                color: #fbbf24;
            }

            .ox-warning-box.ox-danger {
                background: rgba(239, 68, 68, 0.1);
                color: #f87171;
            }

            .ox-account-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 20px;
                background: rgba(0, 0, 0, 0.2);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }

            .ox-light .ox-account-bar {
                background: #f9fafb;
                border-top-color: #e5e7eb;
            }

            .ox-account-label {
                font-size: 11px;
                color: #9ca3af;
                letter-spacing: 0.5px;
            }

            .ox-account-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .ox-account-avatar {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
                font-weight: 700;
                color: white;
            }

            .ox-account-address {
                font-family: monospace;
                font-size: 12px;
                color: #e5e7eb;
            }

            .ox-light .ox-account-address {
                color: #374151;
            }

            .ox-modal-actions {
                display: flex;
                gap: 12px;
                padding: 16px 20px 20px;
            }

            .ox-btn {
                flex: 1;
                padding: 14px 20px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ox-btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .ox-light .ox-btn-secondary {
                background: #e5e7eb;
                color: #374151;
            }

            .ox-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .ox-light .ox-btn-secondary:hover {
                background: #d1d5db;
            }

            .ox-btn-primary {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }

            .ox-btn-primary:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }

            .ox-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
            }

            .ox-spinner {
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: ox-spin 0.8s linear infinite;
            }

            @keyframes ox-spin {
                to { transform: rotate(360deg); }
            }

            .ox-input-group {
                margin-bottom: 8px;
            }

            .ox-input {
                width: 100%;
                padding: 14px 16px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: white;
                font-size: 14px;
                transition: border-color 0.2s;
            }

            .ox-light .ox-input {
                background: #f3f4f6;
                border-color: #d1d5db;
                color: #1f2937;
            }

            .ox-input:focus {
                outline: none;
                border-color: #667eea;
            }

            .ox-input::placeholder {
                color: #9ca3af;
            }

            .ox-error {
                color: #f87171;
                font-size: 12px;
                margin-top: 8px;
                min-height: 18px;
            }

            /* Error Modal Content */
            .ox-error-modal {
                text-align: center;
                padding: 10px 0;
            }

            .ox-error-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }

            .ox-error-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #ef4444;
            }

            .ox-error-message {
                font-size: 13px;
                color: #9ca3af;
                line-height: 1.5;
            }

            /* Toast */
            .ox-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #1f2937;
                color: white;
                padding: 12px 20px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
                z-index: 10001;
            }

            .ox-toast-visible {
                transform: translateX(-50%) translateY(0);
            }

            .ox-toast-success { border-left: 3px solid #10b981; }
            .ox-toast-error { border-left: 3px solid #ef4444; }
            .ox-toast-info { border-left: 3px solid #3b82f6; }

            .ox-toast-icon {
                font-size: 16px;
            }

            /* Processing Overlay */
            #oxProcessingOverlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(15, 15, 26, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10002;
            }

            /* Pending Backdrop with Splash */
            #oxPendingBackdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
            }

            .ox-splash-content {
                text-align: center;
            }

            .ox-splash-logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                font-weight: 700;
                color: white;
                margin: 0 auto 16px;
                box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
            }

            .ox-splash-text {
                font-size: 24px;
                font-weight: 600;
                color: white;
                letter-spacing: -0.5px;
            }

            .ox-splash-text::before {
                content: '0x';
                color: #6366f1;
                font-weight: 700;
            }

            .ox-processing-content {
                text-align: center;
                padding: 30px;
            }

            .ox-processing-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-top-color: #667eea;
                border-radius: 50%;
                animation: ox-spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            .ox-processing-message {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 20px;
                transition: opacity 0.15s;
            }

            /* Closing Screen */
            #oxClosingScreen {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10002;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            #oxClosingScreen.ox-visible {
                opacity: 1;
            }

            .ox-closing-content {
                text-align: center;
            }

            .ox-closing-logo {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 20px;
            }

            .ox-logo-hex {
                color: #8b5cf6;
            }

            .ox-logo-text {
                color: white;
            }

            .ox-closing-message {
                font-size: 48px;
                color: #10b981;
                animation: ox-pulse 0.5s ease;
            }

            @keyframes ox-pulse {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            }

            .ox-processing-bar {
                width: 180px;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                margin: 0 auto;
                overflow: hidden;
            }

            .ox-processing-bar-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 2s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // Override lock
    // ========================================
    const originalLockWallet = window.lockWallet;
    window.lockWallet = async function() {
        try {
            await chrome.runtime.sendMessage({ type: 'POPUP_LOCK' });
        } catch (e) {}
        sessionPrivateKey = null;
        walletUnlocked = false;
        if (originalLockWallet) originalLockWallet();
    };

    // ========================================
    // Polling para pendientes
    // ========================================
    setInterval(() => {
        if (!isShowingRequest && walletUnlocked) {
            checkAndShowPendingRequests();
        }
    }, 2000);

    console.log('🔌 Popup bridge ready');
})();
