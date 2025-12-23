// ============================================
// 0xAddress - Preferences & Onboarding
// ============================================

// Configuración por defecto
const DEFAULT_PREFS = {
    darkMode: true,
    eduTips: true,
    showNotifications: true,  // Nueva preferencia para notificaciones
    unlockIterations: 100000,
    exportIterations: 300000,
    onboardingComplete: false,
    version: '1.0'
};

// ========================================
// Preferences Manager
// ========================================

const PreferencesManager = {
    storageKey: '0xaddress_preferences',
    
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
            }
        } catch (e) {}
        return { ...DEFAULT_PREFS };
    },
    
    save(prefs) {
        localStorage.setItem(this.storageKey, JSON.stringify(prefs));
    },
    
    get(key) {
        const prefs = this.load();
        return prefs[key];
    },
    
    set(key, value) {
        const prefs = this.load();
        prefs[key] = value;
        this.save(prefs);
    }
};

// ========================================
// Crypto Overlay - Animación de operaciones
// ========================================

const CryptoOverlay = {
    getMessages(type) {
        const messages = {
            unlock: [
                t('overlayDerivingKey'),
                t('overlayApplyingSha'),
                t('overlayDecryptingAes'),
                t('overlayVerifyingIntegrity'),
                t('overlayLoadingWallet')
            ],
            create: [
                t('overlayGeneratingEntropy'),
                t('overlayCreatingBip39'),
                t('overlayDerivingMasterKey'),
                t('overlayEncryptingPbkdf2'),
                t('overlaySavingSecurely')
            ],
            export: [
                t('overlayVerifyingPassword'),
                t('overlayDerivingExportKey'),
                t('overlayApplyingPbkdf2'),
                t('overlayEncryptingData'),
                t('overlayGeneratingPem')
            ],
            import: [
                t('overlayReadingPem'),
                t('overlayDerivingDecryptKey'),
                t('overlayVerifyingPbkdf2'),
                t('overlayDecryptingData'),
                t('overlayImportingWallet')
            ],
            changePassword: [
                t('overlayVerifyingCurrent'),
                t('overlayDecryptingData'),
                t('overlayGeneratingNewKey'),
                t('overlayReencrypting'),
                t('overlaySavingChanges')
            ],
            reveal: [
                t('overlayVerifyingPassword'),
                t('overlayDerivingKey'),
                t('overlayDecryptingAes'),
                t('overlayVerifyingIntegrity'),
                t('overlayPreparingData')
            ]
        };
        return messages[type] || messages.unlock;
    },
    
    currentInterval: null,
    messageIndex: 0,
    progressInterval: null,
    
    show(type = 'unlock', title = 'Procesando...', customIterations = null) {
        const overlay = document.getElementById('cryptoOverlay');
        const titleEl = document.getElementById('cryptoTitle');
        const messageEl = document.getElementById('cryptoMessage');
        const progressBar = document.getElementById('cryptoProgressBar');
        const detailsEl = document.getElementById('cryptoDetails');
        
        if (!overlay) return;
        
        // Obtener iteraciones: custom > archivo > preferencias
        let iterations;
        if (customIterations) {
            iterations = customIterations;
        } else {
            const prefs = PreferencesManager.load();
            iterations = type === 'export' ? prefs.exportIterations : prefs.unlockIterations;
        }
        
        titleEl.textContent = title;
        detailsEl.textContent = `AES-256 • PBKDF2 ${(iterations/1000).toFixed(0)}k • SHA-256`;
        
        overlay.classList.remove('hidden');
        
        const messages = this.getMessages(type);
        this.messageIndex = 0;
        
        // Mostrar primer mensaje inmediatamente
        messageEl.textContent = messages[0];
        
        // Rotar mensajes cada 3 segundos
        if (this.currentInterval) clearInterval(this.currentInterval);
        this.currentInterval = setInterval(() => {
            this.messageIndex = (this.messageIndex + 1) % messages.length;
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.textContent = messages[this.messageIndex];
                messageEl.style.opacity = '1';
            }, 200);
        }, 3000);
        
        // Barra de progreso que avanza gradualmente
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        progressBar.offsetHeight; // Forzar reflow
        
        let progress = 0;
        const targetProgress = 85; // Máximo antes de completar
        const duration = 15000; // 15 segundos para llegar al 85%
        const stepTime = 100; // Actualizar cada 100ms
        const progressStep = (targetProgress / (duration / stepTime));
        
        if (this.progressInterval) clearInterval(this.progressInterval);
        this.progressInterval = setInterval(() => {
            progress += progressStep;
            if (progress >= targetProgress) {
                progress = targetProgress;
                clearInterval(this.progressInterval);
            }
            progressBar.style.transition = 'width 0.1s linear';
            progressBar.style.width = progress + '%';
        }, stepTime);
    },
    
    hide() {
        const overlay = document.getElementById('cryptoOverlay');
        const progressBar = document.getElementById('cryptoProgressBar');
        const messageEl = document.getElementById('cryptoMessage');
        
        // Limpiar intervalos
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // Mensaje de completado
        if (messageEl) {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.textContent = '¡Completado!';
                messageEl.style.opacity = '1';
            }, 100);
        }
        
        // Completar barra al 100% con efecto
        if (progressBar) {
            progressBar.style.transition = 'width 0.3s ease-out';
            progressBar.style.width = '100%';
        }
        
        // Ocultar después del efecto de completado
        setTimeout(() => {
            if (overlay) overlay.classList.add('hidden');
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
            }
            if (messageEl) {
                messageEl.textContent = '';
                messageEl.style.opacity = '1';
            }
        }, 500);
    }
};

// ========================================
// Onboarding Tutorial
// ========================================

const Onboarding = {
    getSteps() {
        return [
            {
                target: null,
                title: t('onboardingWelcomeTitle'),
                content: t('onboardingWelcomeContent'),
                position: 'center'
            },
            {
                target: '.main-balance-section',
                title: t('onboardingBalanceTitle'),
                content: t('onboardingBalanceContent'),
                position: 'bottom',
                arrow: 'top'
            },
            {
                target: '#menuButton',
                title: t('onboardingMenuTitle'),
                content: t('onboardingMenuContent'),
                position: 'left',
                arrow: 'right'
            },
            {
                target: '.assets-tabs',
                title: t('onboardingAssetsTitle'),
                content: t('onboardingAssetsContent'),
                position: 'top',
                arrow: 'bottom'
            },
            {
                target: null,
                title: t('onboardingReadyTitle'),
                content: t('onboardingReadyContent'),
                position: 'center'
            }
        ];
    },
    
    currentStep: 0,
    
    start() {
        // Verificar si ya completó el onboarding
        if (PreferencesManager.get('onboardingComplete')) return;
        
        this.currentStep = 0;
        this.showStep();
    },
    
    showStep() {
        const overlay = document.getElementById('onboardingOverlay');
        const tooltip = document.getElementById('onboardingTooltip');
        const highlight = document.getElementById('onboardingHighlight');
        const stepEl = document.getElementById('onboardingStep');
        const contentEl = document.getElementById('onboardingContent');
        const nextBtn = document.getElementById('onboardingNext');
        const skipBtn = document.getElementById('onboardingSkip');
        
        const steps = this.getSteps();
        
        if (!overlay || this.currentStep >= steps.length) {
            this.complete();
            return;
        }
        
        const step = steps[this.currentStep];
        
        overlay.classList.remove('hidden');
        stepEl.textContent = `${this.currentStep + 1}/${steps.length}`;
        
        contentEl.innerHTML = `
            <h4>${step.title}</h4>
            <p>${step.content}</p>
        `;
        
        // Botones con traducción
        nextBtn.textContent = this.currentStep === steps.length - 1 ? t('onboardingGotIt') : t('onboardingNext');
        if (skipBtn) skipBtn.textContent = t('onboardingSkip');
        
        // Limpiar clases de flecha y estilos previos
        tooltip.classList.remove('arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');
        tooltip.style.top = '';
        tooltip.style.left = '';
        tooltip.style.right = '';
        tooltip.style.bottom = '';
        tooltip.style.transform = '';
        
        // Posicionar tooltip y highlight
        if (step.target && step.position !== 'center') {
            const targetEl = document.querySelector(step.target);
            if (targetEl) {
                const rect = targetEl.getBoundingClientRect();
                const tooltipWidth = 240;
                const tooltipMargin = 12;
                
                // Highlight
                highlight.style.display = 'block';
                highlight.style.top = (rect.top - 4) + 'px';
                highlight.style.left = (rect.left - 4) + 'px';
                highlight.style.width = (rect.width + 8) + 'px';
                highlight.style.height = (rect.height + 8) + 'px';
                
                // Tooltip position según tipo
                if (step.position === 'bottom') {
                    // Tooltip debajo del elemento
                    tooltip.style.top = (rect.bottom + tooltipMargin) + 'px';
                    tooltip.style.left = Math.max(10, rect.left) + 'px';
                    tooltip.style.right = 'auto';
                    tooltip.classList.add('arrow-top');
                } else if (step.position === 'top') {
                    // Tooltip arriba del elemento
                    tooltip.style.bottom = (window.innerHeight - rect.top + tooltipMargin) + 'px';
                    tooltip.style.left = Math.max(10, rect.left) + 'px';
                    tooltip.style.right = 'auto';
                    tooltip.classList.add('arrow-bottom');
                } else if (step.position === 'left') {
                    // Tooltip a la izquierda del elemento
                    tooltip.style.top = rect.top + 'px';
                    tooltip.style.right = (window.innerWidth - rect.left + tooltipMargin) + 'px';
                    tooltip.style.left = 'auto';
                    tooltip.classList.add('arrow-right');
                } else if (step.position === 'right') {
                    // Tooltip a la derecha del elemento
                    tooltip.style.top = rect.top + 'px';
                    tooltip.style.left = (rect.right + tooltipMargin) + 'px';
                    tooltip.style.right = 'auto';
                    tooltip.classList.add('arrow-left');
                }
            } else {
                // Target no encontrado, mostrar centrado
                this.centerTooltip(tooltip, highlight);
            }
        } else {
            // Centro
            this.centerTooltip(tooltip, highlight);
        }
    },
    
    centerTooltip(tooltip, highlight) {
        highlight.style.display = 'none';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.right = 'auto';
        tooltip.style.bottom = 'auto';
        tooltip.style.transform = 'translate(-50%, -50%)';
    },
    
    next() {
        this.currentStep++;
        
        if (this.currentStep >= this.getSteps().length) {
            this.complete();
        } else {
            this.showStep();
        }
    },
    
    skip() {
        this.complete();
    },
    
    complete() {
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) overlay.classList.add('hidden');
        
        PreferencesManager.set('onboardingComplete', true);
    }
};

// ========================================
// UI Functions
// ========================================

function showPreferences() {
    const prefs = PreferencesManager.load();
    
    // Set toggles
    const darkModeToggle = document.getElementById('prefDarkMode');
    const tipsToggle = document.getElementById('prefEduTips');
    const notificationsToggle = document.getElementById('prefShowNotifications');
    const unlockSelect = document.getElementById('prefUnlockIterations');
    const exportSelect = document.getElementById('prefExportIterations');
    
    if (darkModeToggle) darkModeToggle.checked = prefs.darkMode;
    if (tipsToggle) tipsToggle.checked = prefs.eduTips;
    if (notificationsToggle) notificationsToggle.checked = prefs.showNotifications !== false;
    if (unlockSelect) unlockSelect.value = prefs.unlockIterations.toString();
    if (exportSelect) exportSelect.value = prefs.exportIterations.toString();
    
    // Cerrar todas las secciones
    document.querySelectorAll('#preferencesModal .config-section').forEach(s => {
        s.classList.remove('open');
    });
    
    // Limpiar formulario de cambio de contraseña
    const pwdInputs = ['currentPassword', 'newPassword', 'confirmNewPassword'];
    pwdInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    openModal('preferencesModal');
}

function toggleThemePreference() {
    const checkbox = document.getElementById('prefDarkMode');
    if (checkbox) {
        PreferencesManager.set('darkMode', checkbox.checked);
        // Usar el sistema de data-theme del CSS
        const newTheme = checkbox.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('0xaddress_theme', newTheme);
    }
}

function toggleTipsPreference() {
    const checkbox = document.getElementById('prefEduTips');
    if (checkbox) {
        PreferencesManager.set('eduTips', checkbox.checked);
        // Actualizar UI de tips
        const tipsSection = document.querySelector('.edu-tips');
        if (tipsSection) {
            tipsSection.style.display = checkbox.checked ? 'block' : 'none';
        }
    }
}

function toggleNotificationsPreference() {
    const checkbox = document.getElementById('prefShowNotifications');
    if (checkbox) {
        PreferencesManager.set('showNotifications', checkbox.checked);
    }
}

async function applyIterationsChange() {
    const unlockSelect = document.getElementById('prefUnlockIterations');
    const exportSelect = document.getElementById('prefExportIterations');
    
    const newUnlockIterations = parseInt(unlockSelect.value);
    const newExportIterations = parseInt(exportSelect.value);
    
    const currentPrefs = PreferencesManager.load();
    
    // Si no cambió las iteraciones de unlock, no necesita re-cifrar
    if (newUnlockIterations === currentPrefs.unlockIterations) {
        PreferencesManager.set('exportIterations', newExportIterations);
        showToast('success', t('saved'), t('preferencesUpdated'));
        return;
    }
    
    // Mostrar formulario de contraseña para re-cifrar
    showIterationsPasswordModal(newUnlockIterations, newExportIterations);
}

function showIterationsPasswordModal(newUnlockIterations, newExportIterations) {
    // Crear modal si no existe
    let modal = document.getElementById('iterationsPasswordModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'iterationsPasswordModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 340px;">
                <button class="modal-close" onclick="closeModal('iterationsPasswordModal')">&times;</button>
                <h2>🔐 ${typeof t === 'function' ? t('confirmChanges') : 'Confirmar Cambios'}</h2>
                <p class="modal-desc">${typeof t === 'function' ? t('enterPasswordToReencrypt') : 'Ingresa tu contraseña para re-cifrar los datos con la nueva configuración de seguridad.'}</p>
                <div class="input-group">
                    <label>${typeof t === 'function' ? t('password') : 'Contraseña'}</label>
                    <input type="password" id="iterationsPassword" placeholder="${typeof t === 'function' ? t('yourPassword') : 'Tu contraseña'}">
                </div>
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 16px;">
                    <button class="btn-secondary" style="flex:1" onclick="closeModal('iterationsPasswordModal')">${typeof t === 'function' ? t('cancel') : 'Cancelar'}</button>
                    <button class="btn-primary" style="flex:1" id="confirmIterationsBtn">${typeof t === 'function' ? t('apply') : 'Aplicar'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Guardar valores para usar después
    modal.dataset.unlockIterations = newUnlockIterations;
    modal.dataset.exportIterations = newExportIterations;
    
    // Limpiar y mostrar
    document.getElementById('iterationsPassword').value = '';
    modal.classList.add('active');
    document.getElementById('iterationsPassword').focus();
    
    // Event listener para confirmar
    document.getElementById('confirmIterationsBtn').onclick = () => executeIterationsChange();
}

async function executeIterationsChange() {
    const modal = document.getElementById('iterationsPasswordModal');
    const password = document.getElementById('iterationsPassword').value;
    const newUnlockIterations = parseInt(modal.dataset.unlockIterations);
    const newExportIterations = parseInt(modal.dataset.exportIterations);
    
    if (!password) {
        showToast('error', t('error'), t('enterPassword'));
        return;
    }
    
    closeModal('iterationsPasswordModal');
    CryptoOverlay.show('changePassword', typeof t === 'function' ? t('updatingSecurity') : 'Actualizando seguridad...');
    
    await new Promise(r => setTimeout(r, 100));
    
    try {
        // Verificar contraseña y obtener datos
        const privateKey = wallet.decryptPrivateKey(password);
        const mnemonic = wallet.getMnemonic(password);
        
        // Re-cifrar con nuevas iteraciones
        const encryptedKey = wallet.encryptWithPBKDF2(privateKey, password, newUnlockIterations);
        localStorage.setItem(CONFIG.storage.encryptedKey, JSON.stringify(encryptedKey));
        
        if (mnemonic) {
            const encryptedMnemonic = wallet.encryptWithPBKDF2(mnemonic, password, newUnlockIterations);
            localStorage.setItem('0xaddress_mnemonic', JSON.stringify(encryptedMnemonic));
        }
        
        // Guardar preferencias
        PreferencesManager.set('unlockIterations', newUnlockIterations);
        PreferencesManager.set('exportIterations', newExportIterations);
        
        CryptoOverlay.hide();
        const msg = typeof t === 'function' ? t('nowUsing') : 'Ahora usando';
        showToast('success', t('updated'), `${msg} ${(newUnlockIterations/1000).toFixed(0)}k ${t('iterations')}`);
        
    } catch (error) {
        CryptoOverlay.hide();
        showToast('error', t('error'), t('wrongPassword'));
    }
}

function showChangePasswordForm() {
    document.getElementById('changePasswordForm').style.display = 'block';
    document.getElementById('btnShowChangePassword').style.display = 'none';
    document.getElementById('currentPassword').focus();
}

function cancelChangePassword() {
    document.getElementById('changePasswordForm').style.display = 'none';
    document.getElementById('btnShowChangePassword').style.display = 'block';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
}

async function executeChangePassword() {
    const currentPwd = document.getElementById('currentPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmNewPassword').value;
    
    if (!currentPwd || !newPwd || !confirmPwd) {
        showToast('error', t('error'), t('errorFillRequired'));
        return;
    }
    
    if (newPwd !== confirmPwd) {
        showToast('error', t('error'), t('errorPasswordsDontMatch'));
        return;
    }
    
    if (newPwd.length < 8) {
        showToast('error', t('error'), t('errorPasswordMinLength'));
        return;
    }
    
    CryptoOverlay.show('changePassword', t('changingPassword'));
    await new Promise(r => setTimeout(r, 100));
    
    try {
        const prefs = PreferencesManager.load();
        const iterations = prefs.unlockIterations;
        
        // Verificar contraseña actual
        const privateKey = wallet.decryptPrivateKey(currentPwd);
        const mnemonic = wallet.getMnemonic(currentPwd);
        
        // Re-cifrar con nueva contraseña
        const encryptedKey = wallet.encryptWithPBKDF2(privateKey, newPwd, iterations);
        localStorage.setItem(CONFIG.storage.encryptedKey, JSON.stringify(encryptedKey));
        
        if (mnemonic) {
            const encryptedMnemonic = wallet.encryptWithPBKDF2(mnemonic, newPwd, iterations);
            localStorage.setItem('0xaddress_mnemonic', JSON.stringify(encryptedMnemonic));
        }
        
        CryptoOverlay.hide();
        cancelChangePassword();
        showToast('success', t('success'), t('passwordUpdated'));
        
    } catch (error) {
        CryptoOverlay.hide();
        showToast('error', t('error'), t('wrongPassword'));
    }
}

// Funciones globales para onboarding
function nextOnboardingStep() {
    Onboarding.next();
}

function skipOnboarding() {
    Onboarding.skip();
}

// ========================================
// Inicialización
// ========================================

function initPreferences() {
    const prefs = PreferencesManager.load();
    
    // Aplicar tema usando data-theme
    const theme = prefs.darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('0xaddress_theme', theme);
    
    // Aplicar tips (por defecto ON)
    if (prefs.eduTips) {
        const tipsSection = document.querySelector('.edu-tips');
        if (tipsSection) tipsSection.style.display = 'block';
    }
}

// Exponer globalmente
window.PreferencesManager = PreferencesManager;
window.CryptoOverlay = CryptoOverlay;
window.Onboarding = Onboarding;
window.showPreferences = showPreferences;
window.toggleThemePreference = toggleThemePreference;
window.toggleTipsPreference = toggleTipsPreference;
window.toggleNotificationsPreference = toggleNotificationsPreference;
window.applyIterationsChange = applyIterationsChange;
window.showChangePasswordForm = showChangePasswordForm;
window.cancelChangePassword = cancelChangePassword;
window.executeChangePassword = executeChangePassword;
window.nextOnboardingStep = nextOnboardingStep;
window.skipOnboarding = skipOnboarding;
window.initPreferences = initPreferences;

console.log('✅ Preferences module loaded');
