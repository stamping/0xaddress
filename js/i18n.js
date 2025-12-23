// ============================================
// 0xaddress - Internacionalización (i18n)
// Sistema de diccionario multi-idioma completo
// ============================================

const TRANSLATIONS = {
    es: {
        // ========== GENERAL ==========
        appName: '0xAddress',
        loading: 'Cargando...',
        processing: 'Procesando...',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        close: 'Cerrar',
        delete: 'Eliminar',
        save: 'Guardar',
        copy: 'Copiar',
        copied: 'Copiado',
        ok: 'OK',
        yes: 'Sí',
        no: 'No',
        or: 'o',
        and: 'y',
        to: 'Para',
        from: 'De',
        max: 'MAX',
        custom: 'Personalizado',
        default: 'Por defecto',
        restore: 'Restaurar',
        
        // ========== HEADER ==========
        menu: 'Menú',
        
        // ========== MENÚ PRINCIPAL ==========
        events: 'Eventos',
        eventsOn: 'Activo',
        eventsOff: 'Inactivo',
        changeTheme: 'Cambiar Tema',
        refresh: 'Actualizar',
        settings: 'Configuración',
        lockWallet: 'Bloquear Wallet',
        apps: 'Aplicaciones',
        connectedSites: 'Sitios Conectados',
        noConnectedSites: 'Sin sitios conectados',
        disconnect: 'Desconectar',
        security: 'Seguridad',
        networks: 'Redes',
        preferences: 'Preferencias',
        
        // ========== SESSION TIMER ==========
        sessionDuration: 'Duración de sesión',
        minutes: 'minutos',
        hours: 'hora',
        hoursPlural: 'horas',
        days: 'días',
        
        // ========== BALANCE CARD ==========
        totalBalance: 'Balance Total',
        receive: 'Recibir',
        send: 'Enviar',
        add: 'Agregar',
        
        // ========== RECEIVE MODAL ==========
        receiveIn: 'Recibir en',
        evmAddress: 'Dirección EVM',
        evmAddressDesc: 'Esta dirección funciona en la mayoría de redes compatibles con Ethereum (EVM).',
        copyAddress: 'Copiar dirección',
        viewInExplorer: 'Ver en explorador',
        receiveWarning: 'Verifica que envíes activos desde una red compatible. Enviar desde una red incorrecta puede resultar en pérdida de fondos.',
        
        // ========== ADD CONTRACT MODAL ==========
        addContract: 'Agregar Contrato',
        contractAddress: 'Dirección del Contrato',
        contractType: 'Tipo de Contrato',
        selectType: '-- Selecciona tipo --',
        otherContract: 'Otro Contrato',
        label: 'Etiqueta',
        maxChars: '(máx 10 caracteres)',
        optional: '(opcional)',
        abiUrlHint: 'JSON del ABI o IPFS CID. Si no se proporciona, se detectará automáticamente.',
        preview: 'Vista Previa',
        name: 'Nombre',
        symbol: 'Símbolo',
        
        // ========== ASSETS TABS ==========
        others: 'Otros',
        noTokens: 'No hay tokens',
        noNFTs: 'No hay NFTs',
        noContracts: 'No hay contratos',
        noTokensIn: 'No hay tokens en',
        noNFTsIn: 'No hay NFTs en',
        noContractsIn: 'No hay contratos en',
        noTokensAdded: 'No hay tokens agregados',
        noNFTCollections: 'No hay colecciones NFT',
        loadingNFTs: 'Cargando NFTs...',
        
        // ========== TIPS EDUCATIVOS ==========
        tip1: 'Las wallets no guardan tokens, solo las claves para acceder a ellos en la blockchain.',
        tip2: 'Una clave privada es como una contraseña que nunca debes compartir con nadie.',
        tip3: 'La dirección pública es como tu número de cuenta: puedes compartirla para recibir tokens.',
        tip4: 'Cada transacción en blockchain es inmutable y verificable públicamente.',
        tip5: 'El gas es la tarifa que pagas a los validadores por procesar tu transacción.',
        tip6: 'Los smart contracts son programas que se ejecutan automáticamente en la blockchain.',
        tip7: 'ERC20 es el estándar para tokens fungibles (intercambiables entre sí).',
        tip8: 'ERC721 es el estándar para NFTs (tokens únicos y no fungibles).',
        tip9: 'Siempre verifica la dirección antes de enviar una transacción.',
        tip10: 'DYOR: Do Your Own Research antes de interactuar con cualquier contrato.',
        
        // ========== TABS ==========
        tokens: 'Tokens',
        nfts: 'NFTs',
        contracts: 'Contratos',
        activity: 'Actividad',
        
        // ========== TOKENS ==========
        addToken: '+ Agregar Token',
        addTokenBtn: 'Agregar token',
        
        // ========== NFTs ==========
        addCollection: '+ Agregar Colección',
        addCollectionBtn: 'Agregar colección',
        
        // ========== CONTRATOS ==========
        create: 'Crear',
        deploy: 'Desplegar',
        saved: 'Guardados',
        import: 'Importar',
        createdByMe: 'Creados por mí',
        imported: 'Importados',
        importContract: 'Importar Contrato',
        
        // ========== ACTIVIDAD ==========
        noActivity: 'Sin actividad reciente',
        viewFullHistory: 'Ver historial completo',
        sent: 'Enviado',
        received: 'Recibido',
        contractCreated: 'Contrato creado',
        new: 'Nuevo',
        contract: 'Contrato',
        now: 'Ahora',
        minutesAgo: 'Hace {n} min',
        hoursAgo: 'Hace {n} h',
        daysAgo: 'Hace {n} días',
        
        // ========== TOKEN DETAIL ==========
        information: 'Información',
        decimals: 'Decimales',
        viewInExplorer: 'Ver en Explorador',
        sendTokens: 'Enviar Tokens',
        manageContract: 'Gestionar Contrato',
        removeToken: 'Eliminar Token',
        
        // ========== MODAL RECIBIR ==========
        receiveTokens: 'Recibir Tokens',
        scanQR: 'Escanea este código QR o copia la dirección',
        copyAddress: 'Copiar Dirección',
        
        // ========== MODAL ENVIAR ==========
        sendTokensTitle: 'Enviar',
        recipient: 'Destinatario',
        recipientPlaceholder: 'Dirección 0x...',
        amount: 'Cantidad',
        amountPlaceholder: 'Cantidad a enviar',
        token: 'Token',
        selectToken: 'Seleccionar token',
        nativeToken: 'Token nativo',
        estimatedGas: 'Gas estimado',
        calculating: 'Calculando...',
        sendBtn: 'Enviar',
        
        // ========== MODAL AGREGAR CONTRATO ==========
        addContractTitle: 'Agregar Contrato',
        contractAddressLabel: 'Dirección del Contrato',
        contractAddressPlaceholder: 'Dirección 0x...',
        contractType: 'Tipo de Contrato',
        selectType: 'Seleccionar tipo',
        contractPreview: 'Vista previa del contrato',
        addContractBtn: 'Agregar Contrato',
        
        // ========== MODAL FIRMA ==========
        signTransaction: 'Firmar Transacción',
        enterPassword: 'Ingresa tu contraseña para firmar',
        password: 'Contraseña',
        passwordPlaceholder: 'Tu contraseña',
        signBtn: 'Firmar y Enviar',
        sign: 'Firmar',
        reject: 'Rechazar',
        
        // ========== ONBOARDING TOOLTIPS ==========
        onboardingWelcomeTitle: '¡Bienvenido! 🎉',
        onboardingWelcomeContent: 'Tu wallet ha sido creada. Te mostraremos las opciones principales.',
        onboardingBalanceTitle: 'Tu Balance',
        onboardingBalanceContent: 'Aquí verás el saldo. Usa los botones de abajo para enviar y recibir.',
        onboardingMenuTitle: 'Menú Principal',
        onboardingMenuContent: 'Accede a <strong>Seguridad</strong> para ver tu frase semilla y exportar respaldos.',
        onboardingAssetsTitle: 'Tus Activos',
        onboardingAssetsContent: 'Aquí puedes ver y agregar tokens ERC20, NFTs y otros contratos.',
        onboardingReadyTitle: '¡Listo!',
        onboardingReadyContent: 'Tu wallet usa cifrado <strong>AES-256</strong> con <strong>PBKDF2</strong>. Las claves nunca salen de tu navegador.',
        onboardingNext: 'Siguiente',
        onboardingSkip: 'Omitir',
        onboardingGotIt: '¡Entendido!',
        
        // ========== MODAL SETUP ==========
        welcomeTitle: '¡Bienvenido!',
        welcomeSubtitle: 'Crea tu wallet en segundos',
        createWallet: 'Crear Wallet',
        newWallet: 'Nueva',
        importWallet: 'Importar Wallet',
        createNewWallet: 'Crear Nueva Wallet',
        createNewWalletDesc: 'Se generará una frase de 12 palabras protegida con tu contraseña',
        encryptionPassword: 'Contraseña de cifrado',
        createSecurePassword: 'Crea una contraseña segura',
        confirmPassword: 'Confirmar Contraseña',
        repeatPassword: 'Repite tu contraseña',
        passwordRequirements: 'Mínimo 8 caracteres',
        passwordsMatch: 'Las contraseñas coinciden',
        passwordsDontMatch: 'Las contraseñas no coinciden',
        createBtn: 'Crear Wallet',
        
        // ========== SETUP BANNERS ==========
        bannerSecurityTitle: 'Máxima Seguridad',
        bannerSecurityDesc: 'Cifrado AES-256 con PBKDF2 (300,000 iteraciones) para proteger la custodia de tus credenciales.',
        bannerMultiNetworkTitle: 'Multi-red',
        bannerMultiNetworkDesc: 'Compatible con Rollux, Ethereum, Polygon, BSC, Arbitrum, Optimism y muchas más redes EVM.',
        bannerOpenSourceTitle: 'Código Abierto',
        bannerOpenSourceDesc: 'Código 100% auditable. Tu seguridad es nuestra prioridad.',
        
        // ========== MODAL IMPORT ==========
        importTitle: 'Importar Wallet',
        importMethod: 'Método de importación',
        privateKey: 'Clave Privada',
        seedPhrase: 'Frase Semilla',
        jsonFile: 'Archivo JSON',
        pemFile: 'Archivo PEM',
        enterPrivateKey: 'Ingresa tu clave privada',
        privateKeyPlaceholder: 'Clave privada (64 caracteres hex)',
        enterSeedPhrase: 'Ingresa tu frase semilla',
        seedPhrasePlaceholder: '12 o 24 palabras separadas por espacios',
        selectFile: 'Seleccionar archivo',
        filePassword: 'Contraseña del archivo',
        importBtn: 'Importar',
        
        // ========== MODAL UNLOCK ==========
        unlockTitle: 'Desbloquear Wallet',
        unlockSubtitle: 'Ingresa tu contraseña',
        unlockBtn: 'Desbloquear',
        forgotPassword: '¿Olvidaste tu contraseña?',
        resetWallet: 'Resetear Wallet',
        
        // ========== SEED PHRASE MODAL ==========
        seedPhraseTitle: 'Tu Frase de Recuperación',
        seedPhraseWarning: '¡IMPORTANTE! Guarda estas palabras en un lugar seguro. Nunca las compartas con nadie.',
        seedPhraseSaved: 'He guardado mi frase de forma segura',
        showSeedPhrase: 'Mostrar Frase Semilla',
        hideSeedPhrase: 'Ocultar',
        copySeedPhrase: 'Copiar Frase',
        
        // ========== MODAL SETTINGS ==========
        settingsTitle: 'Configuración',
        networkSettings: 'Configuración de Red',
        currentNetwork: 'Red actual',
        selectNetwork: 'Seleccionar red',
        addNetwork: 'Agregar Red',
        configureNetwork: 'Configurar Red',
        networkName: 'Nombre de la red',
        chainId: 'Chain ID',
        rpcUrl: 'URL RPC',
        rpcPrimary: 'RPC Principal',
        rpcSecondary: 'RPC Secundario',
        wssPrimary: 'WSS Principal',
        wssSecondary: 'WSS Secundario',
        explorerUrl: 'URL Explorador',
        currencySymbol: 'Símbolo',
        saveNetwork: 'Guardar Red',
        cancelAddNetwork: 'Cancelar',
        httpRpc: 'HTTP (RPC)',
        websocketRealtime: 'WebSocket (tiempo real)',
        others: 'Otros',
        chainIdCantChange: 'El Chain ID no se puede modificar',
        
        // ========== MODAL DEPLOY ==========
        deployTitle: 'Crear Contrato',
        deployERC20: 'Token ERC-20',
        deployERC721: 'Colección NFT (ERC-721)',
        totalSupply: 'Supply Total',
        totalSupplyHint: 'Cantidad total de tokens (en unidades mínimas con decimales)',
        symbol: 'Símbolo',
        symbolPlaceholder: 'Ej: TKN',
        tokenName: 'Nombre del Token',
        tokenNamePlaceholder: 'Ej: Mi Token',
        collectionName: 'Nombre de la Colección',
        collectionNamePlaceholder: 'Ej: Mi Colección',
        deployBtn: 'Desplegar Contrato',
        deployingContract: 'Desplegando contrato...',
        waitingConfirmation: 'Esperando confirmación...',
        contractCreatedSuccess: '¡Contrato Creado!',
        contractAddress: 'Dirección',
        viewInExplorerBtn: 'Ver en Explorador',
        manageContractBtn: 'Gestionar Contrato',
        
        // ========== MODAL CONFIRM ==========
        deleteToken: '¿Eliminar este token?',
        deleteTokenMsg: 'El token será removido de tu lista. Podrás agregarlo de nuevo más tarde.',
        deleteTokenBtn: 'Eliminar Token',
        deleteCollection: '¿Eliminar esta colección?',
        deleteCollectionMsg: 'La colección NFT será removida de tu lista.',
        deleteCollectionBtn: 'Eliminar Colección',
        deleteContract: '¿Eliminar este contrato?',
        deleteContractMsg: 'El contrato será removido de tu lista guardada.',
        deleteContractBtn: 'Eliminar Contrato',
        resetWalletConfirm: '¿Resetear wallet?',
        resetWalletMsg: 'Se eliminarán todos los datos. Asegúrate de haber exportado tu wallet.',
        resetWalletBtn: 'Resetear Todo',
        
        // ========== EXPORT ==========
        exportWallet: 'Exportar Wallet',
        exportPrivateKey: 'Exportar Clave Privada',
        exportSeedPhrase: 'Exportar Frase Semilla',
        exportPEM: 'Exportar PEM',
        exportJSON: 'Exportar JSON',
        downloadPEM: 'Descargar PEM',
        downloadJSON: 'Descargar JSON',
        
        // ========== APPS ==========
        appsTitle: 'Aplicaciones',
        appsSubtitle: 'Explora el ecosistema',
        
        // ========== dApp CONNECTION ==========
        connectRequest: 'Solicitud de Conexión',
        connectRequestMsg: 'quiere conectarse a tu wallet',
        approveConnection: 'Aprobar',
        rejectConnection: 'Rechazar',
        signRequest: 'Solicitud de Firma',
        signRequestMsg: 'quiere que firmes un mensaje',
        transactionRequest: 'Solicitud de Transacción',
        transactionRequestMsg: 'quiere enviar una transacción',
        signMessage: 'Firma de Mensaje',
        signMessageDesc: 'Solicitud para firmar el siguiente mensaje',
        messageToSign: 'MENSAJE A FIRMAR',
        signTypedData: 'Firma Tipada (EIP-712)',
        signTypedDataDesc: 'Firma de datos estructurados',
        type: 'Tipo',
        domain: 'Dominio',
        eip712Warning: 'Las firmas EIP-712 pueden autorizar acciones. Revisa cuidadosamente.',
        signMessagesSecure: 'Firmar mensajes es seguro y no cuesta gas.',
        account: 'CUENTA',
        
        // ========== TOASTS / ALERTS ==========
        success: '¡Éxito!',
        error: 'Error',
        warning: 'Advertencia',
        info: 'Información',
        copiedToClipboard: 'Copiado al portapapeles',
        txSent: 'Transacción enviada',
        txConfirmed: 'Transacción confirmada',
        walletLocked: 'Wallet bloqueada',
        walletLockedMsg: 'Ingresa tu contraseña para continuar',
        invalidPassword: 'Contraseña incorrecta',
        wrongPassword: 'Contraseña incorrecta',
        walletCreated: '¡Wallet creada!',
        walletImported: '¡Wallet importada!',
        addressLabel: 'Dirección',
        
        // ========== ERROR MESSAGES ==========
        errorPasswordsDontMatch: 'Las contraseñas no coinciden',
        errorPasswordTooShort: 'La contraseña debe tener al menos 8 caracteres',
        errorInvalidAddress: 'Dirección inválida',
        errorSelectToken: 'Selecciona un token',
        errorSelectNFT: 'Selecciona un NFT',
        errorSelectFile: 'Selecciona un archivo',
        errorEnterFilePassword: 'Ingresa la contraseña del archivo',
        errorReadingFile: 'No se pudo leer el archivo',
        errorCreatingWallet: 'No se pudo crear la wallet',
        errorImportingWallet: 'No se pudo importar la wallet',
        errorSelectContractType: 'Selecciona el tipo de contrato',
        errorAddingContract: 'No se pudo agregar el contrato',
        errorEstimatingGas: 'Error estimando gas',
        errorTransactionFailed: 'Transacción fallida',
        errorNetworkRequired: 'Nombre, RPC URL y Explorador son obligatorios',
        errorInvalidRpcUrl: 'La RPC URL debe comenzar con http:// o https://',
        errorInvalidWssUrl: 'La WSS URL debe comenzar con ws:// o wss://',
        errorNetworkConnect: 'No se pudo conectar a la red',
        errorFillRequired: 'Completa todos los campos requeridos',
        errorEnterPassword: 'Ingresa tu contraseña',
        errorWrongPassword: 'Contraseña incorrecta',
        errorCopyFailed: 'No se pudo copiar',
        errorEnterWalletPassword: 'Ingresa la contraseña de la wallet',
        errorFillFilePasswords: 'Completa las contraseñas del archivo',
        errorFilePasswordsDontMatch: 'Las contraseñas del archivo no coinciden',
        errorPasswordMinLength: 'La contraseña debe tener mínimo 8 caracteres',
        errorGeneratingCertificate: 'No se pudo generar el certificado',
        errorRpcConnect: 'No se pudo conectar al RPC',
        errorInvalidAmount: 'Cantidad inválida',
        errorExecuting: 'Error al ejecutar',
        errorInsufficientFunds: 'Fondos insuficientes para gas + valor',
        errorNonce: 'Error de nonce, intenta de nuevo',
        errorRejected: 'Transacción rechazada',
        errorUnknown: 'Error desconocido',
        copyFailed: 'No se pudo copiar',
        
        // ========== GENERAL UI ==========
        walletLocked: 'Wallet bloqueada',
        enterPassword: 'Ingresa tu contraseña',
        yourPassword: 'Tu contraseña',
        deleteWalletTitle: '¿Eliminar tu wallet?',
        deleteWalletMsg: 'Esta acción es irreversible. Perderás acceso a tus fondos si no tienes respaldo de tu frase semilla o clave privada.',
        deleteWalletBtn: 'Sí, eliminar wallet',
        saved: 'Guardado',
        restored: 'Restaurado',
        networkAdded: 'Red agregada',
        explorerNotConfigured: 'Explorador no configurado para esta red',
        functionNotAvailable: 'Función no disponible en esta versión',
        customNetworksNoRestore: 'Las redes personalizadas no se pueden restaurar',
        networkRestoredDefault: 'Red restaurada a valores predeterminados',
        savedButReconnectError: 'Configuración guardada, pero hubo un error al reconectar',
        restoredButReconnectError: 'Configuración restaurada, pero hubo un error al reconectar',
        testingConnection: 'Verificando conexión a la red',
        addedCorrectly: 'añadida correctamente',
        preferencesUpdated: 'Preferencias actualizadas',
        passwordUpdated: 'Contraseña actualizada',
        confirmChanges: 'Confirmar Cambios',
        enterPasswordToReencrypt: 'Ingresa tu contraseña para re-cifrar los datos con la nueva configuración de seguridad.',
        apply: 'Aplicar',
        updatingSecurity: 'Actualizando seguridad...',
        updated: 'Actualizado',
        nowUsing: 'Ahora usando',
        iterations: 'iteraciones',
        
        // ========== SUCCESS MESSAGES ==========
        successSent: '¡Enviado!',
        successNFTSent: '¡NFT Enviado!',
        successContractAdded: '¡Contrato agregado!',
        successTokenReceived: '¡Token recibido!',
        successNetworkSaved: 'Configuración de red actualizada',
        successNetworkAdded: 'Red agregada correctamente',
        successMessageSigned: 'Mensaje firmado correctamente',
        successTransactionSent: 'Transacción enviada',
        certificateGenerated: '¡Certificado generado!',
        certificateGeneratedDesc: 'Certificado generado con PBKDF2 600k',
        
        // ========== SESSION ==========
        sessionExpired: 'Sesión expirada',
        sessionExpiredMsg: 'Tu sesión ha expirado por seguridad',
        confirmAction: 'Confirmar Acción',
        enterPasswordToContinue: 'Ingresa tu contraseña para continuar',
        unlocking: 'Desbloqueando...',
        derivingKey: 'Derivando clave PBKDF2...',
        savingSession: 'Guardando sesión...',
        executingAction: 'Ejecutando acción...',
        completed: '¡Completado!',
        
        // ========== PROCESSING OVERLAY ==========
        loadingWallet: 'Cargando wallet...',
        encryptingData: 'Cifrando datos...',
        decryptingData: 'Descifrando datos...',
        generatingSeed: 'Generando frase semilla...',
        creatingWallet: 'Creando tu wallet...',
        importingWallet: 'Importando wallet...',
        signingTransaction: 'Firmando transacción...',
        sendingTransaction: 'Enviando transacción...',
        unlockingWallet: 'Desbloqueando wallet...',
        decryptingCertificate: 'Descifrando certificado...',
        changingPassword: 'Cambiando contraseña...',
        decryptingPrivateKey: 'Descifrando llave privada...',
        generatingCertificate: 'Generando Certificado .PEM...',
        decryptingSeedPhrase: 'Descifrando frase semilla...',
        
        // ========== CRYPTO OVERLAY MESSAGES ==========
        overlayDerivingKey: 'Derivando clave con PBKDF2...',
        overlayApplyingSha: 'Aplicando SHA-256...',
        overlayDecryptingAes: 'Descifrando con AES-256...',
        overlayVerifyingIntegrity: 'Verificando integridad...',
        overlayLoadingWallet: 'Cargando wallet...',
        overlayGeneratingEntropy: 'Generando entropía segura...',
        overlayCreatingBip39: 'Creando frase BIP-39...',
        overlayDerivingMasterKey: 'Derivando clave maestra...',
        overlayEncryptingPbkdf2: 'Cifrando con PBKDF2...',
        overlaySavingSecurely: 'Guardando de forma segura...',
        overlayVerifyingPassword: 'Verificando contraseña...',
        overlayDerivingExportKey: 'Derivando clave de exportación...',
        overlayApplyingPbkdf2: 'Aplicando PBKDF2 600k...',
        overlayEncryptingData: 'Cifrando datos sensibles...',
        overlayGeneratingPem: 'Generando certificado .PEM...',
        overlayReadingPem: 'Leyendo certificado .PEM...',
        overlayDerivingDecryptKey: 'Derivando clave de descifrado...',
        overlayVerifyingPbkdf2: 'Verificando PBKDF2...',
        overlayDecryptingData: 'Descifrando datos...',
        overlayImportingWallet: 'Importando wallet...',
        overlayVerifyingCurrent: 'Verificando contraseña actual...',
        overlayGeneratingNewKey: 'Generando nueva clave...',
        overlayReencrypting: 'Re-cifrando con PBKDF2...',
        overlaySavingChanges: 'Guardando cambios...',
        overlayPreparingData: 'Preparando datos...',
        
        // ========== MISC ==========
        owner: 'PROPIETARIO',
        scanQRCode: 'Escanear QR',
        customContract: 'Contrato personalizado',
        name: 'Nombre',
        
        // ========== FOOTER ==========
        footerCredit: 'Wallet educativa creada por',
        explorer: 'Explorador',
        faucet: 'Faucet',
        documentation: 'Documentación',
        
        // ========== LANGUAGE SELECTION ==========
        selectLanguage: 'Seleccionar idioma',
        languageChanged: 'Idioma cambiado a Español',
        spanish: 'Español',
        english: 'English',
        
        // ========== PREFERENCES - APPEARANCE ==========
        appearance: 'Apariencia',
        language: 'Idioma',
        languageDesc: 'Idioma de la interfaz',
        darkMode: 'Modo Oscuro',
        darkModeDesc: 'Tema visual de la app',
        eduTips: 'Tips Educativos',
        eduTipsDesc: 'Mostrar consejos útiles',
        
        // ========== SETUP BANNERS ==========
        setupTitle: 'Crear Wallet',
        newWallet: 'Nueva',
        bannerSecurityTitle: 'Máxima Seguridad',
        bannerSecurityDesc: 'Cifrado AES-256 con PBKDF2 (300,000 iteraciones) para proteger la custodia de tus credenciales.',
        bannerSeedTitle: 'Estándar BIP-39',
        bannerSeedDesc: 'Frase de recuperación de 12 palabras compatible con cualquier wallet del ecosistema.',
        bannerBackupTitle: 'Backup Reforzado',
        bannerBackupDesc: 'Exportación con 600,000 iteraciones PBKDF2 para máxima protección de tus respaldos.',
        bannerWarningTitle: 'Guarda tu Frase',
        bannerWarningDesc: 'Después de crear la wallet, anota tu frase de recuperación en un lugar seguro y offline.',
        
        // ========== SETUP FORM ==========
        createNewWallet: 'Crear Nueva Wallet',
        createNewWalletDesc: 'Se generará una frase de 12 palabras protegida con tu contraseña',
        encryptionPassword: 'Contraseña de cifrado',
        createSecurePassword: 'Crea una contraseña segura',
        confirmPassword: 'Confirmar contraseña',
        repeatPassword: 'Repite tu contraseña',
        createWalletBtn: 'Crear Wallet',
        setupHint: 'El proceso toma ~1 segundo (cifrado PBKDF2)',
        importWalletDesc: 'Recupera tu wallet desde un certificado .PEM exportado previamente',
        importFromSeed: 'Desde frase semilla',
        importFromFile: 'Desde archivo',
        enterSeedPhrase: 'Ingresa tu frase de recuperación (12 o 24 palabras)',
        selectBackupFile: 'Selecciona tu archivo de respaldo (.pem o .json)',
        selectCertificate: 'Seleccionar certificado...',
        filePassword: 'Contraseña del archivo',
        filePasswordPlaceholder: 'Contraseña usada al exportar',
        samePasswordHint: 'Se usará esta misma contraseña para la wallet',
        useDifferentPassword: 'Usar contraseña diferente para la wallet',
        newPasswordPlaceholder: 'Nueva contraseña (mín. 8 caracteres)',
        confirmNewPassword: 'Confirmar nueva contraseña',
        importWalletBtn: 'Importar Wallet',
        importHint: 'El proceso toma ~2 segundos (descifrado PBKDF2)',
        securityWarning: 'Advertencia de Seguridad',
        selfCustodyWarning: 'Esta es una wallet de <strong>autocustodia</strong>. Tú controlas tus llaves privadas. Si almacenas activos de alto valor, te recomendamos usar una <strong>"cold wallet"</strong>.',
        learnMore: 'Conoce más →',
        importBtn: 'Importar',
        
        // ========== PASSWORD REQUIREMENTS ==========
        reqLength: 'Mínimo 8 caracteres',
        reqUppercase: 'Una mayúscula (A-Z)',
        reqLowercase: 'Una minúscula (a-z)',
        reqNumber: 'Un número (0-9)',
        reqSpecial: 'Un carácter especial (!@#$%...)',
        
        // ========== UNLOCK ==========
        welcomeBack: '¡Bienvenido de nuevo!',
        unlockWallet: 'Desbloquear Wallet',
        unlockTitle: 'Desbloquear Wallet',
        enterPassword: 'Ingresa tu contraseña',
        unlock: 'Desbloquear',
        unlockBtn: 'Desbloquear',
        forgotPassword: '¿Olvidaste tu contraseña?',
        importDifferentWallet: 'Importar otra wallet',
        keepUnlocked: 'Mantener desbloqueado:',
        securityNote: 'Tu llave privada está encriptada localmente. Solo verificamos que eres tú, nunca accedemos a tus fondos.',
        importWallet: 'Importar Wallet',
        resetWallet: 'Resetear Wallet',
        walletCertificate: 'Certificado de Wallet (.pem)',
        
        // ========== dApp APPROVAL ==========
        connectRequest: 'Solicitud de Conexión',
        signMessage: 'Firma de Mensaje',
        signMessageDesc: 'Solicitud para firmar el siguiente mensaje',
        signTypedData: 'Firma Tipada (EIP-712)',
        sendTransaction: 'Enviar Transacción',
        approve: 'Aprobar',
        reject: 'Rechazar',
        sign: 'Firmar',
        connect: 'Conectar',
        connection: 'Conexión',
        signature: 'Firma',
        transaction: 'Transacción',
        request: 'Solicitud',
        messageToSign: 'MENSAJE A FIRMAR',
        structuredDataSignature: 'Firma de datos estructurados',
        eip712Warning: 'Las firmas EIP-712 pueden autorizar acciones. Revisa cuidadosamente.',
        signingIsSafe: 'Firmar mensajes es seguro y no cuesta gas.',
        account: 'CUENTA',
        type: 'Tipo',
        domain: 'Dominio',
        contractInteraction: 'Interacción con Contrato',
        toAddress: 'Para',
        data: 'Datos',
        newContract: 'Nuevo contrato',
        txWillSend: 'Esta transacción enviará',
        insufficientFunds: 'Fondos insuficientes para esta transacción',
        wantsToConnect: 'quiere conectarse a tu wallet',
        shareAddress: 'Compartirás tu dirección pública',
        neverSharePrivateKey: 'Nunca compartas tu clave privada',
        thisSiteWill: 'ESTE SITIO PODRÁ',
        viewPublicAddress: 'Ver tu dirección pública',
        viewAccountBalance: 'Ver el balance de tu cuenta',
        requestSignaturesAndTx: 'Solicitar firmas y transacciones',
        
        // ========== NETWORK MANAGEMENT ==========
        addNetwork: 'Agregar Red',
        addAndSwitch: 'Agregar y Cambiar',
        addNetworkRequest: 'Solicitud de Nueva Red',
        wantsToAddNetwork: 'Este sitio quiere agregar una nueva red',
        networkName: 'Nombre de Red',
        chainId: 'Chain ID',
        rpcUrl: 'URL RPC',
        currency: 'Moneda',
        addNetworkWarning: 'Verifica que esta red sea de confianza antes de agregarla.',
        switchNetwork: 'Cambiar Red',
        switchNetworkRequest: 'Cambiar de Red',
        wantsToSwitchNetwork: 'Este sitio quiere cambiar a otra red',
        switchTo: 'Cambiar a'
    },
    
    en: {
        // ========== GENERAL ==========
        appName: '0xAddress',
        loading: 'Loading...',
        processing: 'Processing...',
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',
        delete: 'Delete',
        save: 'Save',
        copy: 'Copy',
        copied: 'Copied',
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        or: 'or',
        and: 'and',
        to: 'To',
        from: 'From',
        max: 'MAX',
        custom: 'Custom',
        default: 'Default',
        restore: 'Restore',
        
        // ========== HEADER ==========
        menu: 'Menu',
        
        // ========== MENÚ PRINCIPAL ==========
        events: 'Events',
        eventsOn: 'Active',
        eventsOff: 'Inactive',
        changeTheme: 'Change Theme',
        refresh: 'Refresh',
        settings: 'Settings',
        lockWallet: 'Lock Wallet',
        apps: 'Apps',
        connectedSites: 'Connected Sites',
        noConnectedSites: 'No connected sites',
        disconnect: 'Disconnect',
        security: 'Security',
        networks: 'Networks',
        preferences: 'Preferences',
        
        // ========== SESSION TIMER ==========
        sessionDuration: 'Session duration',
        minutes: 'minutes',
        hours: 'hour',
        hoursPlural: 'hours',
        days: 'days',
        
        // ========== BALANCE CARD ==========
        totalBalance: 'Total Balance',
        receive: 'Receive',
        send: 'Send',
        add: 'Add',
        
        // ========== RECEIVE MODAL ==========
        receiveIn: 'Receive on',
        evmAddress: 'EVM Address',
        evmAddressDesc: 'This address works on most Ethereum-compatible networks (EVM).',
        copyAddress: 'Copy address',
        viewInExplorer: 'View in explorer',
        receiveWarning: 'Make sure you send assets from a compatible network. Sending from an incorrect network may result in loss of funds.',
        
        // ========== ADD CONTRACT MODAL ==========
        addContract: 'Add Contract',
        contractAddress: 'Contract Address',
        contractType: 'Contract Type',
        selectType: '-- Select type --',
        otherContract: 'Other Contract',
        label: 'Label',
        maxChars: '(max 10 characters)',
        optional: '(optional)',
        abiUrlHint: 'ABI JSON or IPFS CID. If not provided, it will be auto-detected.',
        preview: 'Preview',
        name: 'Name',
        symbol: 'Symbol',
        
        // ========== ASSETS TABS ==========
        others: 'Others',
        noTokens: 'No tokens',
        noNFTs: 'No NFTs',
        noContracts: 'No contracts',
        noTokensIn: 'No tokens in',
        noNFTsIn: 'No NFTs in',
        noContractsIn: 'No contracts in',
        noTokensAdded: 'No tokens added',
        noNFTCollections: 'No NFT collections',
        loadingNFTs: 'Loading NFTs...',
        
        // ========== TIPS EDUCATIVOS ==========
        tip1: 'Wallets don\'t store tokens, only the keys to access them on the blockchain.',
        tip2: 'A private key is like a password that you should never share with anyone.',
        tip3: 'The public address is like your account number: you can share it to receive tokens.',
        tip4: 'Every blockchain transaction is immutable and publicly verifiable.',
        tip5: 'Gas is the fee you pay to validators to process your transaction.',
        tip6: 'Smart contracts are programs that automatically execute on the blockchain.',
        tip7: 'ERC20 is the standard for fungible tokens (interchangeable with each other).',
        tip8: 'ERC721 is the standard for NFTs (unique, non-fungible tokens).',
        tip9: 'Always verify the address before sending a transaction.',
        tip10: 'DYOR: Do Your Own Research before interacting with any contract.',
        
        // ========== TABS ==========
        tokens: 'Tokens',
        nfts: 'NFTs',
        contracts: 'Contracts',
        activity: 'Activity',
        
        // ========== TOKENS ==========
        addToken: '+ Add Token',
        addTokenBtn: 'Add token',
        
        // ========== NFTs ==========
        addCollection: '+ Add Collection',
        addCollectionBtn: 'Add collection',
        
        // ========== CONTRATOS ==========
        create: 'Create',
        deploy: 'Deploy',
        saved: 'Saved',
        import: 'Import',
        createdByMe: 'Created by me',
        imported: 'Imported',
        importContract: 'Import Contract',
        
        // ========== ACTIVIDAD ==========
        noActivity: 'No recent activity',
        viewFullHistory: 'View full history',
        sent: 'Sent',
        received: 'Received',
        contractCreated: 'Contract created',
        new: 'New',
        contract: 'Contract',
        now: 'Now',
        minutesAgo: '{n} min ago',
        hoursAgo: '{n} h ago',
        daysAgo: '{n} days ago',
        
        // ========== TOKEN DETAIL ==========
        information: 'Information',
        decimals: 'Decimals',
        sendTokens: 'Send Tokens',
        manageContract: 'Manage Contract',
        removeToken: 'Remove Token',
        
        // ========== MODAL RECIBIR ==========
        receiveTokens: 'Receive Tokens',
        scanQR: 'Scan this QR code or copy the address',
        copyAddress: 'Copy Address',
        
        // ========== MODAL ENVIAR ==========
        sendTokensTitle: 'Send',
        recipient: 'Recipient',
        recipientPlaceholder: 'Address 0x...',
        amount: 'Amount',
        amountPlaceholder: 'Amount to send',
        token: 'Token',
        selectToken: 'Select token',
        nativeToken: 'Native token',
        estimatedGas: 'Estimated gas',
        calculating: 'Calculating...',
        sendBtn: 'Send',
        
        // ========== MODAL AGREGAR CONTRATO ==========
        addContractTitle: 'Add Contract',
        contractAddressLabel: 'Contract Address',
        contractAddressPlaceholder: 'Address 0x...',
        contractType: 'Contract Type',
        selectType: 'Select type',
        contractPreview: 'Contract preview',
        addContractBtn: 'Add Contract',
        
        // ========== MODAL FIRMA ==========
        signTransaction: 'Sign Transaction',
        enterPassword: 'Enter your password to sign',
        password: 'Password',
        passwordPlaceholder: 'Your password',
        signBtn: 'Sign & Send',
        sign: 'Sign',
        reject: 'Reject',
        
        // ========== ONBOARDING TOOLTIPS ==========
        onboardingWelcomeTitle: 'Welcome! 🎉',
        onboardingWelcomeContent: 'Your wallet has been created. We\'ll show you the main options.',
        onboardingBalanceTitle: 'Your Balance',
        onboardingBalanceContent: 'Here you\'ll see your balance. Use the buttons below to send and receive.',
        onboardingMenuTitle: 'Main Menu',
        onboardingMenuContent: 'Access <strong>Security</strong> to view your seed phrase and export backups.',
        onboardingAssetsTitle: 'Your Assets',
        onboardingAssetsContent: 'Here you can view and add ERC20 tokens, NFTs and other contracts.',
        onboardingReadyTitle: 'Ready!',
        onboardingReadyContent: 'Your wallet uses <strong>AES-256</strong> encryption with <strong>PBKDF2</strong>. Keys never leave your browser.',
        onboardingNext: 'Next',
        onboardingSkip: 'Skip',
        onboardingGotIt: 'Got it!',
        
        // ========== MODAL SETUP ==========
        welcomeTitle: 'Welcome!',
        welcomeSubtitle: 'Create your wallet in seconds',
        createWallet: 'Create Wallet',
        newWallet: 'New',
        importWallet: 'Import Wallet',
        createNewWallet: 'Create New Wallet',
        createNewWalletDesc: 'A 12-word phrase will be generated protected with your password',
        encryptionPassword: 'Encryption password',
        createSecurePassword: 'Create a secure password',
        confirmPassword: 'Confirm Password',
        repeatPassword: 'Repeat your password',
        passwordRequirements: 'Minimum 8 characters',
        passwordsMatch: 'Passwords match',
        passwordsDontMatch: 'Passwords don\'t match',
        createBtn: 'Create Wallet',
        
        // ========== SETUP BANNERS ==========
        bannerSecurityTitle: 'Maximum Security',
        bannerSecurityDesc: 'AES-256 encryption with PBKDF2 (300,000 iterations) to protect your credentials.',
        bannerMultiNetworkTitle: 'Multi-network',
        bannerMultiNetworkDesc: 'Compatible with Rollux, Ethereum, Polygon, BSC, Arbitrum, Optimism and many more EVM networks.',
        bannerOpenSourceTitle: 'Open Source',
        bannerOpenSourceDesc: '100% auditable code. Your security is our priority.',
        
        // ========== MODAL IMPORT ==========
        importTitle: 'Import Wallet',
        importMethod: 'Import method',
        privateKey: 'Private Key',
        seedPhrase: 'Seed Phrase',
        jsonFile: 'JSON File',
        pemFile: 'PEM File',
        enterPrivateKey: 'Enter your private key',
        privateKeyPlaceholder: 'Private key (64 hex characters)',
        enterSeedPhrase: 'Enter your seed phrase',
        seedPhrasePlaceholder: '12 or 24 words separated by spaces',
        selectFile: 'Select file',
        filePassword: 'File password',
        importBtn: 'Import',
        
        // ========== MODAL UNLOCK ==========
        unlockTitle: 'Unlock Wallet',
        unlockSubtitle: 'Enter your password',
        unlockBtn: 'Unlock',
        forgotPassword: 'Forgot your password?',
        resetWallet: 'Reset Wallet',
        
        // ========== SEED PHRASE MODAL ==========
        seedPhraseTitle: 'Your Recovery Phrase',
        seedPhraseWarning: 'IMPORTANT! Save these words in a secure place. Never share them with anyone.',
        seedPhraseSaved: 'I have saved my phrase securely',
        showSeedPhrase: 'Show Seed Phrase',
        hideSeedPhrase: 'Hide',
        copySeedPhrase: 'Copy Phrase',
        
        // ========== MODAL SETTINGS ==========
        settingsTitle: 'Settings',
        networkSettings: 'Network Settings',
        currentNetwork: 'Current network',
        selectNetwork: 'Select network',
        addNetwork: 'Add Network',
        configureNetwork: 'Configure Network',
        networkName: 'Network name',
        chainId: 'Chain ID',
        rpcUrl: 'RPC URL',
        rpcPrimary: 'Primary RPC',
        rpcSecondary: 'Secondary RPC',
        wssPrimary: 'Primary WSS',
        wssSecondary: 'Secondary WSS',
        explorerUrl: 'Explorer URL',
        currencySymbol: 'Symbol',
        saveNetwork: 'Save Network',
        cancelAddNetwork: 'Cancel',
        httpRpc: 'HTTP (RPC)',
        websocketRealtime: 'WebSocket (realtime)',
        others: 'Others',
        chainIdCantChange: 'Chain ID cannot be modified',
        
        // ========== MODAL DEPLOY ==========
        deployTitle: 'Create Contract',
        deployERC20: 'ERC-20 Token',
        deployERC721: 'NFT Collection (ERC-721)',
        totalSupply: 'Total Supply',
        totalSupplyHint: 'Total amount of tokens (in minimum units with decimals)',
        symbol: 'Symbol',
        symbolPlaceholder: 'E.g.: TKN',
        tokenName: 'Token Name',
        tokenNamePlaceholder: 'E.g.: My Token',
        collectionName: 'Collection Name',
        collectionNamePlaceholder: 'E.g.: My Collection',
        deployBtn: 'Deploy Contract',
        deployingContract: 'Deploying contract...',
        waitingConfirmation: 'Waiting for confirmation...',
        contractCreatedSuccess: 'Contract Created!',
        contractAddress: 'Address',
        viewInExplorerBtn: 'View in Explorer',
        manageContractBtn: 'Manage Contract',
        
        // ========== MODAL CONFIRM ==========
        deleteToken: 'Delete this token?',
        deleteTokenMsg: 'The token will be removed from your list. You can add it again later.',
        deleteTokenBtn: 'Delete Token',
        deleteCollection: 'Delete this collection?',
        deleteCollectionMsg: 'The NFT collection will be removed from your list.',
        deleteCollectionBtn: 'Delete Collection',
        deleteContract: 'Delete this contract?',
        deleteContractMsg: 'The contract will be removed from your saved list.',
        deleteContractBtn: 'Delete Contract',
        resetWalletConfirm: 'Reset wallet?',
        resetWalletMsg: 'All data will be deleted. Make sure you have exported your wallet.',
        resetWalletBtn: 'Reset All',
        
        // ========== EXPORT ==========
        exportWallet: 'Export Wallet',
        exportPrivateKey: 'Export Private Key',
        exportSeedPhrase: 'Export Seed Phrase',
        exportPEM: 'Export PEM',
        exportJSON: 'Export JSON',
        downloadPEM: 'Download PEM',
        downloadJSON: 'Download JSON',
        
        // ========== APPS ==========
        appsTitle: 'Applications',
        appsSubtitle: 'Explore the ecosystem',
        
        // ========== dApp CONNECTION ==========
        connectRequest: 'Connection Request',
        connectRequestMsg: 'wants to connect to your wallet',
        approveConnection: 'Approve',
        rejectConnection: 'Reject',
        signRequest: 'Sign Request',
        signRequestMsg: 'wants you to sign a message',
        transactionRequest: 'Transaction Request',
        transactionRequestMsg: 'wants to send a transaction',
        signMessage: 'Sign Message',
        signMessageDesc: 'Request to sign the following message',
        messageToSign: 'MESSAGE TO SIGN',
        signTypedData: 'Typed Signature (EIP-712)',
        signTypedDataDesc: 'Structured data signature',
        type: 'Type',
        domain: 'Domain',
        eip712Warning: 'EIP-712 signatures can authorize actions. Review carefully.',
        signMessagesSecure: 'Signing messages is safe and costs no gas.',
        account: 'ACCOUNT',
        
        // ========== TOASTS / ALERTS ==========
        success: 'Success!',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        copiedToClipboard: 'Copied to clipboard',
        txSent: 'Transaction sent',
        txConfirmed: 'Transaction confirmed',
        walletLocked: 'Wallet locked',
        walletLockedMsg: 'Enter your password to continue',
        invalidPassword: 'Invalid password',
        wrongPassword: 'Wrong password',
        walletCreated: 'Wallet created!',
        walletImported: 'Wallet imported!',
        addressLabel: 'Address',
        
        // ========== ERROR MESSAGES ==========
        errorPasswordsDontMatch: 'Passwords don\'t match',
        errorPasswordTooShort: 'Password must be at least 8 characters',
        errorInvalidAddress: 'Invalid address',
        errorSelectToken: 'Select a token',
        errorSelectNFT: 'Select an NFT',
        errorSelectFile: 'Select a file',
        errorEnterFilePassword: 'Enter the file password',
        errorReadingFile: 'Could not read file',
        errorCreatingWallet: 'Could not create wallet',
        errorImportingWallet: 'Could not import wallet',
        errorSelectContractType: 'Select contract type',
        errorAddingContract: 'Could not add contract',
        errorEstimatingGas: 'Error estimating gas',
        errorTransactionFailed: 'Transaction failed',
        errorNetworkRequired: 'Name, RPC URL and Explorer are required',
        errorInvalidRpcUrl: 'RPC URL must start with http:// or https://',
        errorInvalidWssUrl: 'WSS URL must start with ws:// or wss://',
        errorNetworkConnect: 'Could not connect to network',
        errorFillRequired: 'Fill in all required fields',
        errorEnterPassword: 'Enter your password',
        errorWrongPassword: 'Wrong password',
        errorCopyFailed: 'Could not copy',
        errorEnterWalletPassword: 'Enter wallet password',
        errorFillFilePasswords: 'Complete file passwords',
        errorFilePasswordsDontMatch: 'File passwords don\'t match',
        errorPasswordMinLength: 'Password must be at least 8 characters',
        errorGeneratingCertificate: 'Could not generate certificate',
        errorRpcConnect: 'Could not connect to RPC',
        errorInvalidAmount: 'Invalid amount',
        errorExecuting: 'Error executing',
        errorInsufficientFunds: 'Insufficient funds for gas + value',
        errorNonce: 'Nonce error, try again',
        errorRejected: 'Transaction rejected',
        errorUnknown: 'Unknown error',
        copyFailed: 'Could not copy',
        
        // ========== GENERAL UI ==========
        walletLocked: 'Wallet locked',
        enterPassword: 'Enter your password',
        yourPassword: 'Your password',
        deleteWalletTitle: 'Delete your wallet?',
        deleteWalletMsg: 'This action is irreversible. You will lose access to your funds if you don\'t have a backup of your seed phrase or private key.',
        deleteWalletBtn: 'Yes, delete wallet',
        explorerNotConfigured: 'Explorer not configured for this network',
        functionNotAvailable: 'Function not available in this version',
        customNetworksNoRestore: 'Custom networks cannot be restored',
        networkRestoredDefault: 'Network restored to default values',
        savedButReconnectError: 'Configuration saved, but there was an error reconnecting',
        restoredButReconnectError: 'Configuration restored, but there was an error reconnecting',
        testingConnection: 'Testing network connection',
        addedCorrectly: 'added correctly',
        preferencesUpdated: 'Preferences updated',
        passwordUpdated: 'Password updated',
        confirmChanges: 'Confirm Changes',
        enterPasswordToReencrypt: 'Enter your password to re-encrypt data with the new security configuration.',
        apply: 'Apply',
        updatingSecurity: 'Updating security...',
        updated: 'Updated',
        nowUsing: 'Now using',
        iterations: 'iterations',
        
        // ========== SUCCESS MESSAGES ==========
        successSent: 'Sent!',
        successNFTSent: 'NFT Sent!',
        successContractAdded: 'Contract added!',
        successTokenReceived: 'Token received!',
        successNetworkSaved: 'Network configuration updated',
        successNetworkAdded: 'Network added successfully',
        successMessageSigned: 'Message signed successfully',
        successTransactionSent: 'Transaction sent',
        tokenDeleted: 'Token deleted',
        tokenRemovedFromList: 'has been removed from your list',
        collectionDeleted: 'Collection deleted',
        nftCollectionRemoved: 'NFT collection has been removed',
        networkChanged: 'Network changed',
        connectedTo: 'Connected to',
        saved: 'Saved',
        restored: 'Restored',
        networkRestored: 'Network restored to default values',
        networkAdded: 'Network added',
        addedSuccessfully: 'added successfully',
        keyDecrypted: 'Key decrypted',
        clickToReveal: 'Click to reveal',
        privateKeyCopied: 'Private key copied to clipboard',
        certificateGenerated: 'Certificate generated!',
        certificateGeneratedDesc: 'Certificate generated with PBKDF2 600k',
        updated: 'Updated',
        dataUpdated: 'Data updated successfully',
        listenersActivated: 'Listeners activated',
        listeningContracts: 'Listening contracts',
        contractAddressCopied: 'Contract address copied',
        addressCopied: 'Address copied to clipboard',
        
        // ========== SESSION ==========
        sessionExpired: 'Session expired',
        sessionExpiredMsg: 'Your session has expired for security',
        confirmAction: 'Confirm Action',
        enterPasswordToContinue: 'Enter your password to continue',
        unlocking: 'Unlocking...',
        derivingKey: 'Deriving PBKDF2 key...',
        savingSession: 'Saving session...',
        executingAction: 'Executing action...',
        completed: 'Completed!',
        
        // ========== PROCESSING OVERLAY ==========
        loadingWallet: 'Loading wallet...',
        encryptingData: 'Encrypting data...',
        decryptingData: 'Decrypting data...',
        generatingSeed: 'Generating seed phrase...',
        creatingWallet: 'Creating your wallet...',
        importingWallet: 'Importing wallet...',
        signingTransaction: 'Signing transaction...',
        sendingTransaction: 'Sending transaction...',
        unlockingWallet: 'Unlocking wallet...',
        decryptingCertificate: 'Decrypting certificate...',
        changingPassword: 'Changing password...',
        decryptingPrivateKey: 'Decrypting private key...',
        generatingCertificate: 'Generating .PEM Certificate...',
        decryptingSeedPhrase: 'Decrypting seed phrase...',
        
        // ========== CRYPTO OVERLAY MESSAGES ==========
        overlayDerivingKey: 'Deriving key with PBKDF2...',
        overlayApplyingSha: 'Applying SHA-256...',
        overlayDecryptingAes: 'Decrypting with AES-256...',
        overlayVerifyingIntegrity: 'Verifying integrity...',
        overlayLoadingWallet: 'Loading wallet...',
        overlayGeneratingEntropy: 'Generating secure entropy...',
        overlayCreatingBip39: 'Creating BIP-39 phrase...',
        overlayDerivingMasterKey: 'Deriving master key...',
        overlayEncryptingPbkdf2: 'Encrypting with PBKDF2...',
        overlaySavingSecurely: 'Saving securely...',
        overlayVerifyingPassword: 'Verifying password...',
        overlayDerivingExportKey: 'Deriving export key...',
        overlayApplyingPbkdf2: 'Applying PBKDF2 600k...',
        overlayEncryptingData: 'Encrypting sensitive data...',
        overlayGeneratingPem: 'Generating .PEM certificate...',
        overlayReadingPem: 'Reading .PEM certificate...',
        overlayDerivingDecryptKey: 'Deriving decryption key...',
        overlayVerifyingPbkdf2: 'Verifying PBKDF2...',
        overlayDecryptingData: 'Decrypting data...',
        overlayImportingWallet: 'Importing wallet...',
        overlayVerifyingCurrent: 'Verifying current password...',
        overlayGeneratingNewKey: 'Generating new key...',
        overlayReencrypting: 'Re-encrypting with PBKDF2...',
        overlaySavingChanges: 'Saving changes...',
        overlayPreparingData: 'Preparing data...',
        
        // ========== MISC ==========
        owner: 'OWNER',
        scanQRCode: 'Scan QR',
        customContract: 'Custom contract',
        name: 'Name',
        
        // ========== FOOTER ==========
        footerCredit: 'Educational wallet created by',
        explorer: 'Explorer',
        faucet: 'Faucet',
        documentation: 'Documentation',
        
        // ========== LANGUAGE SELECTION ==========
        selectLanguage: 'Select language',
        languageChanged: 'Language changed to English',
        spanish: 'Español',
        english: 'English',
        
        // ========== PREFERENCES - APPEARANCE ==========
        appearance: 'Appearance',
        language: 'Language',
        languageDesc: 'Interface language',
        darkMode: 'Dark Mode',
        darkModeDesc: 'App visual theme',
        eduTips: 'Educational Tips',
        eduTipsDesc: 'Show helpful tips',
        
        // ========== SETUP BANNERS ==========
        setupTitle: 'Create Wallet',
        newWallet: 'New',
        bannerSecurityTitle: 'Maximum Security',
        bannerSecurityDesc: 'AES-256 encryption with PBKDF2 (300,000 iterations) to protect your credentials custody.',
        bannerSeedTitle: 'BIP-39 Standard',
        bannerSeedDesc: '12-word recovery phrase compatible with any wallet in the ecosystem.',
        bannerBackupTitle: 'Enhanced Backup',
        bannerBackupDesc: 'Export with 600,000 PBKDF2 iterations for maximum backup protection.',
        bannerWarningTitle: 'Save Your Phrase',
        bannerWarningDesc: 'After creating the wallet, write down your recovery phrase in a safe, offline place.',
        
        // ========== SETUP FORM ==========
        createNewWallet: 'Create New Wallet',
        createNewWalletDesc: 'A 12-word phrase will be generated protected with your password',
        encryptionPassword: 'Encryption password',
        createSecurePassword: 'Create a secure password',
        confirmPassword: 'Confirm password',
        repeatPassword: 'Repeat your password',
        createWalletBtn: 'Create Wallet',
        setupHint: 'Process takes ~1 second (PBKDF2 encryption)',
        importWalletDesc: 'Recover your wallet from a previously exported .PEM certificate',
        importFromSeed: 'From seed phrase',
        importFromFile: 'From file',
        enterSeedPhrase: 'Enter your recovery phrase (12 or 24 words)',
        selectBackupFile: 'Select your backup file (.pem or .json)',
        selectCertificate: 'Select certificate...',
        filePassword: 'File password',
        filePasswordPlaceholder: 'Password used when exporting',
        samePasswordHint: 'This same password will be used for the wallet',
        useDifferentPassword: 'Use different password for wallet',
        newPasswordPlaceholder: 'New password (min. 8 characters)',
        confirmNewPassword: 'Confirm new password',
        importWalletBtn: 'Import Wallet',
        importHint: 'Process takes ~2 seconds (PBKDF2 decryption)',
        securityWarning: 'Security Warning',
        selfCustodyWarning: 'This is a <strong>self-custody</strong> wallet. You control your private keys. If storing high-value assets, we recommend using a <strong>"cold wallet"</strong>.',
        learnMore: 'Learn more →',
        importBtn: 'Import',
        
        // ========== PASSWORD REQUIREMENTS ==========
        reqLength: 'Minimum 8 characters',
        reqUppercase: 'One uppercase letter (A-Z)',
        reqLowercase: 'One lowercase letter (a-z)',
        reqNumber: 'One number (0-9)',
        reqSpecial: 'One special character (!@#$%...)',
        
        // ========== UNLOCK ==========
        welcomeBack: 'Welcome back!',
        unlockWallet: 'Unlock Wallet',
        unlockTitle: 'Unlock Wallet',
        enterPassword: 'Enter your password',
        unlock: 'Unlock',
        unlockBtn: 'Unlock',
        forgotPassword: 'Forgot your password?',
        importDifferentWallet: 'Import different wallet',
        keepUnlocked: 'Keep unlocked:',
        securityNote: 'Your private key is encrypted locally. We only verify it\'s you, we never access your funds.',
        importWallet: 'Import Wallet',
        resetWallet: 'Reset Wallet',
        walletCertificate: 'Wallet Certificate (.pem)',
        
        // ========== dApp APPROVAL EXTRA ==========
        approve: 'Approve',
        reject: 'Reject',
        sign: 'Sign',
        connect: 'Connect',
        connection: 'Connection',
        signature: 'Signature',
        transaction: 'Transaction',
        request: 'Request',
        structuredDataSignature: 'Structured data signature',
        signingIsSafe: 'Signing messages is safe and costs no gas.',
        signMessageDesc: 'Request to sign the following message',
        contractInteraction: 'Contract Interaction',
        toAddress: 'To',
        data: 'Data',
        newContract: 'New contract',
        txWillSend: 'This transaction will send',
        insufficientFunds: 'Insufficient funds for this transaction',
        wantsToConnect: 'wants to connect to your wallet',
        shareAddress: 'You will share your public address',
        neverSharePrivateKey: 'Never share your private key',
        thisSiteWill: 'THIS SITE WILL BE ABLE TO',
        viewPublicAddress: 'View your public address',
        viewAccountBalance: 'View your account balance',
        requestSignaturesAndTx: 'Request signatures and transactions',
        
        // ========== NETWORK MANAGEMENT ==========
        addNetwork: 'Add Network',
        addAndSwitch: 'Add and Switch',
        addNetworkRequest: 'New Network Request',
        wantsToAddNetwork: 'This site wants to add a new network',
        networkName: 'Network Name',
        chainId: 'Chain ID',
        rpcUrl: 'RPC URL',
        currency: 'Currency',
        addNetworkWarning: 'Verify that this network is trustworthy before adding it.',
        switchNetwork: 'Switch Network',
        switchNetworkRequest: 'Switch Network',
        wantsToSwitchNetwork: 'This site wants to switch to another network',
        switchTo: 'Switch to'
    },
    
    // Portugués (fallback a inglés para keys no traducidas)
    pt: {
        // ========== GENERAL ==========
        appName: '0xAddress',
        loading: 'Carregando...',
        processing: 'Processando...',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        close: 'Fechar',
        delete: 'Excluir',
        save: 'Salvar',
        copy: 'Copiar',
        copied: 'Copiado',
        ok: 'OK',
        yes: 'Sim',
        no: 'Não',
        
        // ========== SETUP ==========
        setupTitle: 'Criar Carteira',
        newWallet: 'Nova',
        import: 'Importar',
        createNewWallet: 'Criar Nova Carteira',
        createNewWalletDesc: 'Uma frase de 12 palavras será gerada protegida com sua senha',
        encryptionPassword: 'Senha de criptografia',
        createSecurePassword: 'Crie uma senha segura',
        confirmPassword: 'Confirmar senha',
        repeatPassword: 'Repita sua senha',
        createWalletBtn: 'Criar Carteira',
        importWallet: 'Importar Carteira',
        importWalletBtn: 'Importar Carteira',
        
        // ========== UNLOCK ==========
        unlockTitle: 'Desbloquear Carteira',
        unlockBtn: 'Desbloquear',
        password: 'Senha',
        
        // ========== BANNERS ==========
        bannerSecurityTitle: 'Máxima Segurança',
        bannerSecurityDesc: 'Criptografia AES-256 com PBKDF2 (300.000 iterações) para proteger suas credenciais.',
        bannerSeedTitle: 'Padrão BIP-39',
        bannerSeedDesc: 'Frase de recuperação de 12 palavras compatível com qualquer carteira do ecossistema.',
        bannerBackupTitle: 'Backup Reforçado',
        bannerBackupDesc: 'Exportação com 600.000 iterações PBKDF2 para máxima proteção de seus backups.',
        bannerWarningTitle: 'Guarde sua Frase',
        bannerWarningDesc: 'Após criar a carteira, anote sua frase de recuperação em um lugar seguro e offline.',
        
        // ========== PREFERENCES - APPEARANCE ==========
        appearance: 'Aparência',
        language: 'Idioma',
        languageDesc: 'Idioma da interface',
        darkMode: 'Modo Escuro',
        darkModeDesc: 'Tema visual do app',
        eduTips: 'Dicas Educativas',
        eduTipsDesc: 'Mostrar dicas úteis',
        
        // ========== dApp ==========
        approve: 'Aprovar',
        reject: 'Rejeitar',
        sign: 'Assinar',
        connect: 'Conectar',
        signMessage: 'Assinar Mensagem',
        signTypedData: 'Assinatura Tipada (EIP-712)',
        
        languageChanged: 'Idioma alterado para Português'
    },
    
    // Chino simplificado (fallback a inglés para keys no traducidas)
    zh: {
        // ========== GENERAL ==========
        appName: '0xAddress',
        loading: '加载中...',
        processing: '处理中...',
        cancel: '取消',
        confirm: '确认',
        close: '关闭',
        delete: '删除',
        save: '保存',
        copy: '复制',
        copied: '已复制',
        ok: '确定',
        yes: '是',
        no: '否',
        
        // ========== SETUP ==========
        setupTitle: '创建钱包',
        newWallet: '新建',
        import: '导入',
        createNewWallet: '创建新钱包',
        createNewWalletDesc: '将生成12个助记词，并使用您的密码加密保护',
        encryptionPassword: '加密密码',
        createSecurePassword: '创建安全密码',
        confirmPassword: '确认密码',
        repeatPassword: '重复密码',
        createWalletBtn: '创建钱包',
        importWallet: '导入钱包',
        importWalletBtn: '导入钱包',
        
        // ========== UNLOCK ==========
        unlockTitle: '解锁钱包',
        unlockBtn: '解锁',
        password: '密码',
        
        // ========== BANNERS ==========
        bannerSecurityTitle: '最高安全性',
        bannerSecurityDesc: 'AES-256加密，PBKDF2（300,000次迭代）保护您的凭据。',
        bannerSeedTitle: 'BIP-39标准',
        bannerSeedDesc: '12个助记词与生态系统中的任何钱包兼容。',
        bannerBackupTitle: '增强备份',
        bannerBackupDesc: '导出时使用600,000次PBKDF2迭代，最大程度保护您的备份。',
        bannerWarningTitle: '保存助记词',
        bannerWarningDesc: '创建钱包后，请将助记词写在安全的离线位置。',
        
        // ========== PREFERENCES - APPEARANCE ==========
        appearance: '外观',
        language: '语言',
        languageDesc: '界面语言',
        darkMode: '深色模式',
        darkModeDesc: '应用视觉主题',
        eduTips: '教育提示',
        eduTipsDesc: '显示有用的提示',
        
        // ========== dApp ==========
        approve: '批准',
        reject: '拒绝',
        sign: '签名',
        connect: '连接',
        signMessage: '签名消息',
        signTypedData: '类型化签名 (EIP-712)',
        
        languageChanged: '语言已更改为中文'
    }
};

// Idioma actual
let currentLanguage = 'es';

// Detectar idioma del navegador (ahora solo retorna español por defecto)
function detectBrowserLanguage() {
    // Siempre español por defecto
    return 'es';
}

// Inicializar idioma desde storage
function initLanguageFromStorage(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['0xaddress_language'], (result) => {
            if (result['0xaddress_language']) {
                currentLanguage = result['0xaddress_language'];
            } else {
                // Si no hay idioma guardado, usar español
                currentLanguage = 'es';
            }
            if (callback) callback();
        });
    } else {
        const saved = localStorage.getItem('0xaddress_language');
        if (saved) {
            currentLanguage = saved;
        } else {
            // Si no hay idioma guardado, usar español
            currentLanguage = 'es';
        }
        if (callback) callback();
    }
}

// Obtener traducción con fallback: idioma actual -> inglés -> español -> key
function t(key, params = {}) {
    const currentLang = TRANSLATIONS[currentLanguage];
    const englishLang = TRANSLATIONS.en;
    const spanishLang = TRANSLATIONS.es;
    
    let text = (currentLang && currentLang[key]) || 
               (englishLang && englishLang[key]) || 
               (spanishLang && spanishLang[key]) || 
               key;
    
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });
    
    return text;
}

// Cambiar idioma
function setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
        currentLanguage = lang;
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ '0xaddress_language': lang });
        } else {
            localStorage.setItem('0xaddress_language', lang);
        }
        
        // Actualizar select de preferencias si existe
        const langSelect = document.getElementById('prefLanguage');
        if (langSelect && langSelect.value !== lang) {
            langSelect.value = lang;
        }
        
        // Actualizar botones del selector de idioma en setup y unlock
        document.querySelectorAll('.setup-lang-selector .lang-btn, .unlock-lang-selector .lang-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-click')?.match(/'(\w+)'/)?.[1];
            if (btnLang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        applyTranslations();
        closeLangMenu();
        
        // Solo mostrar toast si no estamos en el setup/unlock inicial
        const setupModal = document.getElementById('setupModal');
        const unlockModal = document.getElementById('unlockModal');
        const isInSetup = setupModal && setupModal.classList.contains('active');
        const isInUnlock = unlockModal && unlockModal.classList.contains('active');
        
        if (typeof showToast === 'function' && !isInSetup && !isInUnlock) {
            showToast('info', t('success'), t('languageChanged'));
        }
    }
}

// Obtener idioma actual
function getCurrentLanguage() {
    return currentLanguage;
}

// Aplicar traducciones
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation !== key) {
            el.textContent = translation;
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
    
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = t(key);
    });
}

// Inicializar idioma
function initLanguage() {
    initLanguageFromStorage(() => {
        // Actualizar select de preferencias si existe
        const langSelect = document.getElementById('prefLanguage');
        if (langSelect) {
            langSelect.value = currentLanguage;
        }
        
        // Marcar botón de idioma activo en setup y unlock
        document.querySelectorAll('.setup-lang-selector .lang-btn, .unlock-lang-selector .lang-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-click')?.match(/'(\w+)'/)?.[1];
            if (btnLang === currentLanguage) {
                btn.classList.add('active');
            }
        });
        
        applyTranslations();
    });
}

// Cambiar idioma desde el select de preferencias
function changeLanguageFromSelect() {
    const langSelect = document.getElementById('prefLanguage');
    if (langSelect) {
        setLanguage(langSelect.value);
    }
}

// ========================================
// Menús
// ========================================

function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    const overlay = document.getElementById('langMenuOverlay');
    
    if (menu && overlay) {
        const isOpen = menu.classList.contains('open');
        if (typeof closeMainMenu === 'function') closeMainMenu();
        
        if (isOpen) {
            closeLangMenu();
        } else {
            menu.classList.add('open');
            overlay.classList.add('open');
        }
    }
}

function closeLangMenu() {
    const menu = document.getElementById('langMenu');
    const overlay = document.getElementById('langMenuOverlay');
    
    if (menu && overlay) {
        menu.classList.remove('open');
        overlay.classList.remove('open');
    }
}

function toggleMainMenu() {
    const menu = document.getElementById('mainMenu');
    const overlay = document.getElementById('mainMenuOverlay');
    
    if (menu && overlay) {
        const isOpen = menu.classList.contains('open');
        closeLangMenu();
        
        if (isOpen) {
            closeMainMenu();
        } else {
            menu.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            updateMenuListenerStatus();
        }
    }
}

function closeMainMenu() {
    const menu = document.getElementById('mainMenu');
    const overlay = document.getElementById('mainMenuOverlay');
    
    if (menu && overlay) {
        menu.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function updateMenuListenerStatus() {
    const status = document.getElementById('menuListenerStatus');
    if (status && typeof wallet !== 'undefined') {
        const isActive = wallet.eventListeners && wallet.eventListeners.length > 0;
        status.textContent = isActive ? t('eventsOn') : t('eventsOff');
        status.className = 'menu-status' + (isActive ? ' active' : '');
    }
}

function toggleAppsMenu() {}
function closeAppsMenu() {}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLangMenu();
        closeMainMenu();
    }
});

document.addEventListener('DOMContentLoaded', initLanguage);
