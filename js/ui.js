// ============================================
// 0xaddress - UI Management
// ============================================

// ========================================
// Variables Globales UI
// ========================================

let currentSendType = 'native';
let pendingSignCallback = null;
let pendingTxDetails = null;
let currentNFTDetail = null;
let currentTokenDetail = null;

// ========================================
// Sistema de Temas (Claro/Oscuro)
// ========================================

function initTheme() {
    const savedTheme = localStorage.getItem('0xaddress_theme');
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('0xaddress_theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('0xaddress_theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
    updateThemeMenuText();
    
    // Regenerar QR con colores correctos
    if (document.getElementById('receiveModal').classList.contains('active') && wallet.address) {
        generateQRCode(wallet.address);
    }
}

function updateThemeMenuText() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (themeIcon && themeText) {
        if (currentTheme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Claro';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Oscuro';
        }
    }
}

function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}

// ========================================
// Menú Móvil
// ========================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    
    if (menu && overlay) {
        menu.classList.toggle('open');
        overlay.classList.toggle('open');
        
        if (menu.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    
    if (menu && overlay) {
        menu.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Cerrar menú móvil con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileMenu();
        cancelConfirm();
    }
});

// ========================================
// Modal de Confirmación Universal
// ========================================

let confirmCallback = null;

function showConfirmModal(options) {
    const {
        icon = '⚠️',
        title = '¿Estás seguro?',
        message = 'Esta acción no se puede deshacer.',
        itemIcon = null,
        itemName = null,
        itemDetail = null,
        buttonText = 'Confirmar',
        buttonClass = 'btn-danger',
        onConfirm = null
    } = options;
    
    // Guardar callback
    confirmCallback = onConfirm;
    
    // Configurar modal
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    // Preview del item (opcional)
    const previewEl = document.getElementById('confirmItemPreview');
    if (itemIcon && itemName) {
        document.getElementById('confirmItemIcon').textContent = itemIcon;
        document.getElementById('confirmItemName').textContent = itemName;
        document.getElementById('confirmItemDetail').textContent = itemDetail || '';
        previewEl.style.display = 'flex';
    } else {
        previewEl.style.display = 'none';
    }
    
    // Botón de confirmación
    const confirmBtn = document.getElementById('confirmButton');
    confirmBtn.textContent = buttonText;
    confirmBtn.className = buttonClass;
    
    openModal('confirmModal');
}

function cancelConfirm() {
    confirmCallback = null;
    closeModal('confirmModal');
}

function executeConfirm() {
    if (confirmCallback && typeof confirmCallback === 'function') {
        confirmCallback();
    }
    confirmCallback = null;
    closeModal('confirmModal');
}

// ========================================
// Modales
// ========================================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// ========================================
// Toast Notifications
// ========================================

function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add close button listener
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, duration);
}

// ========================================
// Password Visibility Toggle
// ========================================

function togglePassword(inputId) {
    togglePasswordVisibility(inputId);
}

// ========================================
// QR Code Generation
// ========================================

function generateQRCode(address) {
    const qrContainer = document.getElementById('qrCode');
    if (!qrContainer) {
        console.error('QR container not found');
        return;
    }
    
    qrContainer.innerHTML = '';
    
    if (!address) {
        console.error('No hay dirección para generar QR');
        qrContainer.innerHTML = '<p style="color: #666; padding: 20px;">Sin dirección</p>';
        return;
    }
    
    // Verificar si QRCode está disponible
    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        qrContainer.innerHTML = `<div style="padding: 20px; text-align: center; font-family: monospace; font-size: 10px; word-break: break-all;">${address}</div>`;
        return;
    }
    
    try {
        new QRCode(qrContainer, {
            text: address,
            width: 180,
            height: 180,
            colorDark: "#1a1a2e",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        console.log('✅ QR generado para:', address);
    } catch (error) {
        console.error('Error generando QR:', error);
        qrContainer.innerHTML = `<div style="padding: 20px; text-align: center; font-family: monospace; font-size: 10px; word-break: break-all;">${address}</div>`;
    }
}

// ========================================
// Copy Address
// ========================================

function copyAddress() {
    const address = wallet.address;
    navigator.clipboard.writeText(address).then(() => {
        showToast('success', t('copied'), t('copiedToClipboard'));
    }).catch(() => {
        showToast('error', t('error'), t('copyFailed'));
    });
}

// ========================================
// Send Modal Tabs
// ========================================

async function switchSendTab(type) {
    currentSendType = type;
    
    document.querySelectorAll('.send-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === type);
    });
    
    const tokenSelect = document.getElementById('tokenSelectGroup');
    const nftSelect = document.getElementById('nftSelectGroup');
    const amountGroup = document.getElementById('amountGroup');
    const sendSymbol = document.getElementById('sendTokenSymbol');
    
    tokenSelect.style.display = 'none';
    nftSelect.style.display = 'none';
    amountGroup.style.display = 'block';
    
    const network = NetworkManager.getCurrentNetwork();
    const nativeSymbol = network.currency?.symbol || 'ETH';
    
    if (type === 'native') {
        sendSymbol.textContent = nativeSymbol;
        updateMaxBalance('native');
    } else if (type === 'token') {
        tokenSelect.style.display = 'block';
        populateTokenSelect();
    } else if (type === 'nft') {
        nftSelect.style.display = 'block';
        amountGroup.style.display = 'none';
        await populateNFTSelect();
    }
}

function populateTokenSelect() {
    const select = document.getElementById('tokenSelect');
    select.innerHTML = '<option value="">-- Selecciona un token --</option>';
    
    const erc20Contracts = wallet.contracts.filter(c => c.type === 'ERC20');
    
    for (const contract of erc20Contracts) {
        const option = document.createElement('option');
        option.value = contract.address;
        option.textContent = `${contract.name} (${contract.symbol})`;
        select.appendChild(option);
    }
    
    if (erc20Contracts.length === 0) {
        select.innerHTML = `<option value="">${t('noTokensAdded')}</option>`;
    }
}

async function populateNFTSelect() {
    const select = document.getElementById('nftSelect');
    select.innerHTML = `<option value="">${t('loadingNFTs')}</option>`;
    
    const erc721Contracts = wallet.contracts.filter(c => c.type === 'ERC721');
    
    if (erc721Contracts.length === 0) {
        select.innerHTML = `<option value="">${t('noNFTCollections')}</option>`;
        return;
    }
    
    // Limpiar y agregar opción por defecto
    select.innerHTML = '<option value="">-- Selecciona un NFT --</option>';
    
    let totalNFTs = 0;
    
    for (const contract of erc721Contracts) {
        try {
            const nfts = await wallet.getNFTs(contract.address);
            console.log(`NFTs encontrados en ${contract.symbol}:`, nfts.length);
            
            for (const nft of nfts) {
                const option = document.createElement('option');
                option.value = `${contract.address}:${nft.tokenId}`;
                option.textContent = `${contract.symbol} #${nft.tokenId} - ${nft.name || 'NFT'}`;
                select.appendChild(option);
                totalNFTs++;
            }
        } catch (error) {
            console.error('Error obteniendo NFTs de', contract.symbol, ':', error);
        }
    }
    
    if (totalNFTs === 0) {
        select.innerHTML = '<option value="">No tienes NFTs disponibles</option>';
    }
}

async function updateMaxBalance(type, contractAddress = null) {
    const balanceSpan = document.getElementById('sendMaxBalance');
    
    if (type === 'native') {
        balanceSpan.textContent = parseFloat(wallet.nativeBalance).toFixed(6);
    } else if (contractAddress) {
        const balance = await wallet.getTokenBalance(contractAddress);
        balanceSpan.textContent = parseFloat(balance).toFixed(6);
    }
}

function setMaxAmount() {
    const balance = document.getElementById('sendMaxBalance').textContent;
    document.getElementById('sendAmount').value = balance;
}

// ========================================
// Sign Transaction Modal
// ========================================

let pendingCancelCallback = null;

function requestSignature(txDetails, callback, cancelCallback) {
    pendingTxDetails = txDetails;
    pendingSignCallback = callback;
    pendingCancelCallback = cancelCallback || null;
    
    const detailsContainer = document.getElementById('txDetails');
    detailsContainer.innerHTML = `
        <div class="tx-detail-row">
            <span class="tx-detail-label">Tipo</span>
            <span class="tx-detail-value">${txDetails.type}</span>
        </div>
        <div class="tx-detail-row">
            <span class="tx-detail-label">Para</span>
            <span class="tx-detail-value">${wallet.formatAddress(txDetails.to)}</span>
        </div>
        <div class="tx-detail-row">
            <span class="tx-detail-label">Cantidad</span>
            <span class="tx-detail-value">${txDetails.amount} ${txDetails.symbol}</span>
        </div>
        ${txDetails.gas ? `
        <div class="tx-detail-row">
            <span class="tx-detail-label">Gas estimado</span>
            <span class="tx-detail-value">${txDetails.gas} SYS</span>
        </div>
        ` : ''}
    `;
    
    document.getElementById('signPassword').value = '';
    openModal('signModal');
}

function cancelSign() {
    // Llamar callback de cancelación si existe
    if (pendingCancelCallback) {
        pendingCancelCallback();
    }
    pendingSignCallback = null;
    pendingCancelCallback = null;
    pendingTxDetails = null;
    closeModal('signModal');
}

// ========================================
// Add Contract Modal
// ========================================

function openAddContractWithType(type) {
    document.getElementById('contractType').value = type;
    openModal('addContractModal');
}

// ========================================
// Receive Modal
// ========================================

function openReceiveModal(symbol = null) {
    const network = NetworkManager.getCurrentNetwork();
    const networkName = network.name || 'Red';
    const nativeSymbol = network.currency?.symbol || 'ETH';
    
    // Actualizar elementos del nuevo diseño
    document.getElementById('receiveAddress').textContent = wallet.address;
    document.getElementById('receiveNetworkName').textContent = networkName;
    document.getElementById('receiveAddressTitle').textContent = 'Dirección EVM';
    
    // Icono del logo según la red
    const logoIcon = document.getElementById('qrLogoIcon');
    if (logoIcon) {
        const icons = {
            'rollux': '🔷',
            'ethereum': '⟠',
            'polygon': '🟣',
            'bsc': '🟡',
            'arbitrum': '🔵',
            'optimism': '🔴'
        };
        const networkKey = (network.id || networkName).toLowerCase();
        logoIcon.textContent = icons[networkKey] || '⟠';
    }
    
    generateQRCode(wallet.address);
    openModal('receiveModal');
}

function viewOnExplorer() {
    const network = NetworkManager.getCurrentNetwork();
    if (network.explorer && wallet.address) {
        const url = `${network.explorer}/address/${wallet.address}`;
        window.open(url, '_blank');
    } else {
        showToast('info', t('info'), t('explorerNotConfigured'));
    }
}

// Función para recibir desde token detail
function showTokenReceive() {
    if (currentTokenDetail) {
        openReceiveModal(currentTokenDetail.contract.symbol);
        closeModal('tokenDetailModal');
    } else {
        openReceiveModal();
    }
}

// ========================================
// Render Functions
// ========================================

function renderTokensList() {
    const container = document.getElementById('tokensList');
    const currentNetwork = NetworkManager.getCurrentNetwork();
    const currentChainId = currentNetwork.chainId;
    
    // Filtrar por tipo ERC20 Y por red actual
    let erc20Contracts = wallet.contracts.filter(c => 
        c.type === 'ERC20' && 
        (c.chainId === currentChainId || !c.chainId) // Incluir si no tiene chainId (legacy)
    );
    
    // Ordenar por fecha de agregado (más reciente primero)
    erc20Contracts.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    
    if (erc20Contracts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>${t('noTokensIn')} ${currentNetwork.name}</p>
            </div>
        `;
        updateTabCounts();
        return;
    }
    
    container.innerHTML = '';
    for (const contract of erc20Contracts) {
        renderTokenItem(container, contract);
    }
    updateTabCounts();
}

async function renderTokenItem(container, contract) {
    const balance = await wallet.getTokenBalance(contract.address);
    
    // Formatear balance según decimales del contrato
    // Importante: contract.decimals puede ser 0, no usar || porque 0 es falsy
    const decimals = contract.decimals !== undefined ? contract.decimals : 18;
    const displayDecimals = Math.min(decimals, 6); // Máximo 6 decimales para display
    
    let formattedBalance;
    if (decimals === 0) {
        // Sin decimales, mostrar número entero
        formattedBalance = Math.floor(parseFloat(balance)).toLocaleString();
    } else {
        formattedBalance = parseFloat(balance).toFixed(displayDecimals);
    }
    
    // Verificar si es Owner - primero del dato guardado, luego del contrato
    let isOwner = contract.isOwner || false;
    
    // Si no tiene el dato, verificar con el contrato
    if (!isOwner && wallet.address) {
        try {
            const provider = wallet.provider;
            const tokenContract = new ethers.Contract(contract.address, ERC20_ABI, provider);
            const ownerAddress = await tokenContract.owner().catch(() => null);
            if (ownerAddress && ownerAddress.toLowerCase() === wallet.address.toLowerCase()) {
                isOwner = true;
                // Actualizar el contrato guardado
                contract.isOwner = true;
                wallet.saveContracts();
            }
        } catch (e) {
            // El contrato no tiene función owner, ignorar
        }
    }
    
    const ownerBadge = isOwner ? '<span class="token-owner-badge">OWNER</span>' : '';
    
    const item = document.createElement('div');
    item.className = 'token-item';
    item.setAttribute('data-contract', contract.address);
    item.addEventListener('click', () => openTokenDetail(contract));
    item.innerHTML = `
        <div class="token-info">
            <div class="token-icon">${contract.symbol.slice(0, 2).toUpperCase()}</div>
            <div class="token-details">
                <h4>${contract.name}${ownerBadge}</h4>
                <p>${wallet.formatAddress(contract.address)}</p>
            </div>
        </div>
        <div class="token-balance">
            <span class="amount">${formattedBalance}</span>
            <span class="symbol">${contract.symbol}</span>
        </div>
    `;
    
    container.appendChild(item);
}

async function renderNFTsList() {
    const container = document.getElementById('nftsList');
    const currentNetwork = NetworkManager.getCurrentNetwork();
    const currentChainId = currentNetwork.chainId;
    
    // Filtrar por tipo ERC721 Y por red actual
    let erc721Contracts = wallet.contracts.filter(c => 
        c.type === 'ERC721' && 
        (c.chainId === currentChainId || !c.chainId)
    );
    
    // Ordenar por fecha de agregado (más reciente primero)
    erc721Contracts.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    
    // Actualizar contador del tab
    let totalNFTs = 0;
    
    // Limpiar contenedor primero
    container.innerHTML = '';
    
    if (erc721Contracts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🖼️</span>
                <p>${t('noNFTsIn')} ${currentNetwork.name}</p>
            </div>
        `;
        updateTabCounts();
        return;
    }
    
    // Usar un Set para evitar duplicados por dirección
    const processedAddresses = new Set();
    
    for (const contract of erc721Contracts) {
        // Evitar duplicados
        if (processedAddresses.has(contract.address.toLowerCase())) {
            continue;
        }
        processedAddresses.add(contract.address.toLowerCase());
        
        const nftBalance = await wallet.getNFTBalance(contract.address);
        const nfts = await wallet.getNFTs(contract.address);
        totalNFTs += nfts.length;
        
        // Verificar si es Owner - primero del dato guardado, luego del contrato
        let isOwner = contract.isOwner || false;
        
        if (!isOwner && wallet.address) {
            try {
                const provider = wallet.provider;
                const nftContract = new ethers.Contract(contract.address, ERC721_ABI, provider);
                const ownerAddress = await nftContract.owner().catch(() => null);
                if (ownerAddress && ownerAddress.toLowerCase() === wallet.address.toLowerCase()) {
                    isOwner = true;
                    contract.isOwner = true;
                    wallet.saveContracts();
                }
            } catch (e) {
                // El contrato no tiene función owner
            }
        }
        
        const ownerBadge = isOwner ? '<span class="token-owner-badge">OWNER</span>' : '';
        
        // Crear acordeón para cada colección
        const collectionDiv = document.createElement('div');
        collectionDiv.className = 'nft-collection';
        collectionDiv.id = `collection-${contract.address}`;
        
        // Header del acordeón (clickeable para expandir/colapsar)
        const header = document.createElement('div');
        header.className = 'nft-collection-header';
        header.addEventListener('click', (e) => {
            if (!e.target.closest('.nft-collection-actions')) {
                toggleNFTCollection(contract.address);
            }
        });
        
        const explorerUrl = NETWORK.explorerUrlUrl + '/token/' + contract.address;
        
        header.innerHTML = `
            <div class="nft-collection-info">
                <div class="nft-collection-icon">${contract.symbol.substring(0, 2).toUpperCase()}</div>
                <div class="nft-collection-details">
                    <h4>${contract.name}${ownerBadge}</h4>
                    <p>${wallet.formatAddress(contract.address)}</p>
                </div>
            </div>
            <div class="nft-collection-meta">
                <span class="nft-count-badge">${nfts.length} NFT${nfts.length !== 1 ? 's' : ''}</span>
                <div class="nft-collection-actions">
                    <button data-click="openNFTCollectionMethods('${contract.address}')" title="Métodos">⚙️</button>
                    <button data-click="openExplorerLink('${explorerUrl}')" title="Explorador">🔗</button>
                    <button data-click="removeNFTCollection('${contract.address}')" title="Eliminar">🗑️</button>
                </div>
                <span class="nft-collection-toggle">▼</span>
            </div>
        `;
        collectionDiv.appendChild(header);
        
        // Contenido del acordeón (NFTs)
        const content = document.createElement('div');
        content.className = 'nft-collection-content';
        
        if (nfts.length === 0) {
            content.innerHTML = `
                <div class="empty-state" style="padding: 1rem 0;">
                    <span class="empty-icon">🖼️</span>
                    <p>No tienes NFTs de esta colección</p>
                </div>
            `;
        } else {
            const grid = document.createElement('div');
            grid.className = 'nft-items-grid';
            
            for (const nft of nfts) {
                const card = document.createElement('div');
                card.className = 'nft-item-card';
                card.onclick = () => openNFTDetail(contract, nft);
                
                let imageUrl = nft.image || '';
                if (imageUrl.startsWith('ipfs://')) {
                    imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                }
                
                const nftName = nft.name || nft.metadata?.name || `NFT`;
                
                card.innerHTML = `
                    ${imageUrl 
                        ? `<img src="${imageUrl}" alt="${nftName}" class="nft-item-image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>🎨</text></svg>'">`
                        : `<div class="nft-item-image" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea,#764ba2);font-size:2rem;">🎨</div>`
                    }
                    <div class="nft-item-info">
                        <div class="nft-item-name">${nftName}</div>
                        <div class="nft-item-id">#${nft.tokenId}</div>
                    </div>
                `;
                grid.appendChild(card);
            }
            content.appendChild(grid);
        }
        
        collectionDiv.appendChild(content);
        container.appendChild(collectionDiv);
    }
    
    updateTabCounts();
}

function toggleNFTCollection(address) {
    const collection = document.getElementById(`collection-${address}`);
    if (collection) {
        collection.classList.toggle('expanded');
    }
}

function updateTabCounts() {
    const currentNetwork = NetworkManager.getCurrentNetwork();
    const currentChainId = currentNetwork.chainId;
    
    // Contar tokens ERC20 de la red actual
    const erc20Count = wallet.contracts.filter(c => 
        c.type === 'ERC20' && (c.chainId === currentChainId || !c.chainId)
    ).length;
    document.getElementById('tokensCount').textContent = erc20Count;
    
    // Contar colecciones NFT de la red actual
    const erc721Count = wallet.contracts.filter(c => 
        c.type === 'ERC721' && (c.chainId === currentChainId || !c.chainId)
    ).length;
    document.getElementById('nftsCount').textContent = erc721Count;
    
    // Actualizar otros contratos también
    if (typeof otherContracts !== 'undefined') {
        const othersCount = otherContracts.filter(c => 
            c.chainId === currentChainId || !c.chainId
        ).length;
        const othersEl = document.getElementById('othersCount');
        if (othersEl) othersEl.textContent = othersCount;
    }
}

function switchAssetsTab(tabName) {
    // Remover active de todos los tabs
    document.querySelectorAll('.assets-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.assets-tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar el tab seleccionado
    document.querySelector(`.assets-tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`${tabName}Tab`)?.classList.add('active');
    
    // Si es la tab de otros, actualizar la lista con la red actual
    if (tabName === 'others' && typeof renderOthersList === 'function') {
        renderOthersList();
    }
}

function renderNFTItem(container, contract, nft) {
    const item = document.createElement('div');
    item.className = 'nft-item';
    item.onclick = () => openNFTDetail(contract, nft);
    
    let imageContent = '<div class="nft-placeholder">🎨</div>';
    
    if (nft.image) {
        let imageUrl = nft.image;
        // Convertir IPFS si es necesario
        if (imageUrl.startsWith('ipfs://')) {
            imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        imageContent = `<img src="${imageUrl}" alt="NFT" class="nft-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="nft-placeholder" style="display:none;">🎨</div>`;
    }
    
    const nftName = nft.name || nft.metadata?.name || `#${nft.tokenId}`;
    
    item.innerHTML = `
        ${imageContent}
        <div class="nft-info-overlay">
            <span class="nft-name">${nftName}</span>
            <span class="nft-token-id">ID: ${nft.tokenId}</span>
        </div>
    `;
    
    container.appendChild(item);
}

function showNFTDetails(contract, nft) {
    window.open(`${NETWORK.explorerUrl}/token/${contract.address}?a=${nft.tokenId}`, '_blank');
}

// ========================================
// NFT Detail Modal
// ========================================

function openNFTDetail(contract, nft) {
    currentNFTDetail = { contract, nft };
    
    // Resetear estados
    document.getElementById('nftTransferForm').style.display = 'none';
    document.getElementById('nftProcessing').style.display = 'none';
    document.getElementById('nftSuccess').style.display = 'none';
    document.querySelector('.nft-detail-content').style.display = 'flex';
    
    // Imagen
    const imageContainer = document.getElementById('nftDetailImage');
    if (nft.image) {
        let imageUrl = nft.image;
        if (imageUrl.startsWith('ipfs://')) {
            imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="NFT" onerror="this.parentElement.innerHTML='<div class=\\'nft-placeholder\\'>🎨</div>'">`;
    } else {
        imageContainer.innerHTML = '<div class="nft-placeholder">🎨</div>';
    }
    
    // Info básica
    document.getElementById('nftDetailName').textContent = nft.name || nft.metadata?.name || `#${nft.tokenId}`;
    document.getElementById('nftDetailCollection').textContent = contract.name;
    document.getElementById('nftDetailSymbol').textContent = contract.symbol;
    document.getElementById('nftDetailTokenId').textContent = nft.tokenId;
    document.getElementById('nftDetailContract').textContent = wallet.formatAddress(contract.address);
    
    // Metadata y Atributos
    const metadataSection = document.getElementById('nftMetadataSection');
    const metadataContent = document.getElementById('nftMetadataContent');
    
    metadataContent.innerHTML = '';
    let hasContent = false;
    
    if (nft.metadata) {
        // Mostrar descripción si existe
        if (nft.metadata.description) {
            hasContent = true;
            const descDiv = document.createElement('div');
            descDiv.className = 'nft-description';
            descDiv.innerHTML = `
                <span class="nft-meta-label">Descripción</span>
                <p>${nft.metadata.description}</p>
            `;
            metadataContent.appendChild(descDiv);
        }
        
        // Mostrar atributos si existen
        const attributes = nft.metadata.attributes || nft.metadata.properties || nft.metadata.traits;
        if (attributes && Array.isArray(attributes) && attributes.length > 0) {
            hasContent = true;
            const attrsDiv = document.createElement('div');
            attrsDiv.className = 'nft-attributes';
            attrsDiv.innerHTML = `<div class="nft-attributes-title">✨ Atributos</div>`;
            
            const attrsGrid = document.createElement('div');
            attrsGrid.className = 'nft-attributes-grid';
            
            for (const attr of attributes) {
                const traitType = attr.trait_type || attr.type || attr.name || 'Propiedad';
                const traitValue = attr.value !== undefined ? attr.value : '-';
                
                const attrDiv = document.createElement('div');
                attrDiv.className = 'nft-attribute';
                attrDiv.innerHTML = `
                    <div class="nft-attribute-type">${traitType}</div>
                    <div class="nft-attribute-value">${traitValue}</div>
                `;
                attrsGrid.appendChild(attrDiv);
            }
            
            attrsDiv.appendChild(attrsGrid);
            metadataContent.appendChild(attrsDiv);
        }
        
        // Mostrar otros campos (external_url, etc.)
        const excludeKeys = ['image', 'name', 'description', 'attributes', 'properties', 'traits'];
        for (const [key, value] of Object.entries(nft.metadata)) {
            if (!excludeKeys.includes(key) && value && typeof value !== 'object') {
                hasContent = true;
                const item = document.createElement('div');
                item.className = 'nft-metadata-item';
                
                let displayValue = value;
                if (typeof displayValue === 'string' && displayValue.length > 50) {
                    displayValue = displayValue.substring(0, 47) + '...';
                }
                
                item.innerHTML = `
                    <span class="label">${key}</span>
                    <span class="value">${displayValue}</span>
                `;
                metadataContent.appendChild(item);
            }
        }
    }
    
    metadataSection.style.display = hasContent ? 'block' : 'none';
    
    openModal('nftDetailModal');
}

function viewNFTInExplorer() {
    if (currentNFTDetail) {
        window.open(`${NETWORK.explorerUrl}/token/${currentNFTDetail.contract.address}?a=${currentNFTDetail.nft.tokenId}`, '_blank');
    }
}

function openNFTTransfer() {
    document.querySelector('.nft-detail-content').style.display = 'none';
    document.getElementById('nftTransferForm').style.display = 'block';
    
    // Preview
    const nft = currentNFTDetail.nft;
    document.getElementById('nftTransferName').textContent = nft.name || `NFT #${nft.tokenId}`;
    document.getElementById('nftTransferTokenId').textContent = `#${nft.tokenId}`;
    
    const previewImg = document.getElementById('nftTransferPreview');
    if (nft.image) {
        let imageUrl = nft.image;
        if (imageUrl.startsWith('ipfs://')) {
            imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        previewImg.src = imageUrl;
        previewImg.style.display = 'block';
    } else {
        previewImg.style.display = 'none';
    }
    
    document.getElementById('nftRecipientAddress').value = '';
}

function cancelNFTTransfer() {
    document.getElementById('nftTransferForm').style.display = 'none';
    document.querySelector('.nft-detail-content').style.display = 'flex';
}

async function confirmNFTTransfer() {
    const to = document.getElementById('nftRecipientAddress').value.trim();
    
    if (!wallet.isValidAddress(to)) {
        showToast('error', t('error'), t('errorInvalidAddress'));
        return;
    }
    
    const { contract, nft } = currentNFTDetail;
    
    // Solicitar firma
    requestSignature({
        type: `Transferir NFT ${contract.symbol}`,
        to: to,
        amount: `#${nft.tokenId}`,
        symbol: contract.symbol,
        gas: 'Variable'
    }, async (password) => {
        try {
            // Mostrar procesando
            document.getElementById('nftTransferForm').style.display = 'none';
            document.getElementById('nftProcessing').style.display = 'block';
            
            const result = await wallet.sendNFT(contract.address, to, nft.tokenId, password);
            
            // Mostrar éxito
            document.getElementById('nftProcessing').style.display = 'none';
            document.getElementById('nftSuccess').style.display = 'block';
            
            const txLink = document.getElementById('nftTxHash');
            txLink.textContent = wallet.formatAddress(result.hash);
            txLink.href = wallet.getExplorerTxUrl(result.hash);
            
            // Actualizar lista y actividad
            await updateAllBalances();
            renderActivityList();
            
        } catch (error) {
            document.getElementById('nftProcessing').style.display = 'none';
            document.querySelector('.nft-detail-content').style.display = 'flex';
            showToast('error', 'Error', error.message || 'Transacción fallida');
        }
    });
}

function closeNFTDetailModal() {
    closeModal('nftDetailModal');
    currentNFTDetail = null;
}

// ========================================
// Token Detail Modal
// ========================================

async function openTokenDetail(contract) {
    currentTokenDetail = { contract };
    
    // Resetear estados
    const transferForm = document.getElementById('tokenTransferForm');
    const processing = document.getElementById('tokenProcessing');
    const success = document.getElementById('tokenSuccess');
    
    if (transferForm) transferForm.style.display = 'none';
    if (processing) processing.style.display = 'none';
    if (success) success.style.display = 'none';
    
    // Obtener balance
    const balance = await wallet.getTokenBalance(contract.address);
    currentTokenDetail.balance = balance;
    
    // Formatear balance según decimales
    const decimals = contract.decimals || 0;
    const displayDecimals = Math.min(decimals, 6);
    const formattedBalance = decimals === 0 
        ? Math.floor(parseFloat(balance)).toString()
        : parseFloat(balance).toFixed(displayDecimals);
    
    // Info - Actualizar elementos
    const shortAddress = `${contract.address.slice(0, 6)}...${contract.address.slice(-4)}`;
    
    document.getElementById('tokenDetailBalance').textContent = formattedBalance;
    document.getElementById('tokenDetailSymbol').textContent = contract.symbol;
    document.getElementById('tokenDetailContract').textContent = contract.address;
    document.getElementById('tokenDetailContractShort').textContent = shortAddress;
    document.getElementById('tokenDetailName').textContent = contract.name;
    document.getElementById('tokenDetailDecimals').textContent = contract.decimals;
    
    // Link al explorador
    const network = NetworkManager.getCurrentNetwork();
    const explorerLink = document.getElementById('tokenExplorerLink');
    if (explorerLink) {
        explorerLink.href = `${network.explorerUrl}/token/${contract.address}`;
    }
    
    openModal('tokenDetailModal');
}

function viewTokenInExplorer() {
    if (currentTokenDetail) {
        const network = NetworkManager.getCurrentNetwork();
        const url = `${network.explorerUrl}/token/${currentTokenDetail.contract.address}`;
        window.open(url, '_blank');
    }
}

// Abrir el contrato en el gestor de contratos
function openTokenContract() {
    // Función deshabilitada - ContractsManager removido
    showToast('info', t('info'), t('functionNotAvailable'));
}

// Eliminar token de la lista
function removeCurrentToken() {
    if (!currentTokenDetail) return;
    
    const contract = currentTokenDetail.contract;
    
    showConfirmModal({
        icon: '🗑️',
        title: '¿Eliminar este token?',
        message: 'El token será removido de tu lista. Podrás agregarlo de nuevo más tarde.',
        itemIcon: contract.symbol.slice(0, 2).toUpperCase(),
        itemName: contract.name,
        itemDetail: contract.symbol,
        buttonText: 'Eliminar Token',
        onConfirm: () => {
            const address = contract.address.toLowerCase();
            
            // Eliminar de wallet.contracts (sistema principal)
            wallet.removeContract(address);
            
            // También eliminar del localStorage secundario
            let contracts = JSON.parse(localStorage.getItem('erc20_contracts') || '[]');
            contracts = contracts.filter(c => c.address.toLowerCase() !== address);
            localStorage.setItem('erc20_contracts', JSON.stringify(contracts));
            
            // Cerrar modales y actualizar lista
            closeModal('tokenDetailModal');
            renderTokensList();
            updateTabCounts();
            
            showToast('success', t('success'), `${contract.name} ha sido removido de tu lista`);
        }
    });
}

function openTokenTransfer() {
    // Ocultar contenido del modal de token
    const modal = document.getElementById('tokenDetailModal');
    const balanceCard = modal.querySelector('.balance-card');
    const extraActions = modal.querySelector('.token-extra-actions');
    
    if (balanceCard) balanceCard.style.display = 'none';
    if (extraActions) extraActions.style.display = 'none';
    document.getElementById('tokenTransferForm').style.display = 'block';
    
    const contract = currentTokenDetail.contract;
    const balance = currentTokenDetail.balance;
    
    document.getElementById('tokenTransferIcon').textContent = contract.symbol.slice(0, 2).toUpperCase();
    document.getElementById('tokenTransferName').textContent = contract.name;
    document.getElementById('tokenTransferBalance').textContent = parseFloat(balance).toFixed(6);
    document.getElementById('tokenTransferSymbol').textContent = contract.symbol;
    document.getElementById('tokenAvailableBalance').textContent = parseFloat(balance).toFixed(6);
    
    document.getElementById('tokenRecipientAddress').value = '';
    document.getElementById('tokenTransferAmount').value = '';
}

function cancelTokenTransfer() {
    document.getElementById('tokenTransferForm').style.display = 'none';
    
    // Mostrar contenido del modal de token
    const modal = document.getElementById('tokenDetailModal');
    const balanceCard = modal.querySelector('.balance-card');
    const extraActions = modal.querySelector('.token-extra-actions');
    
    if (balanceCard) balanceCard.style.display = '';
    if (extraActions) extraActions.style.display = '';
}

function setMaxTokenAmount() {
    document.getElementById('tokenTransferAmount').value = currentTokenDetail.balance;
}

async function confirmTokenTransfer() {
    const to = document.getElementById('tokenRecipientAddress').value.trim();
    const amount = document.getElementById('tokenTransferAmount').value;
    
    if (!wallet.isValidAddress(to)) {
        showToast('error', t('error'), t('errorInvalidAddress'));
        return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
        showToast('error', t('error'), t('errorInvalidAmount'));
        return;
    }
    
    const { contract } = currentTokenDetail;
    
    // Estimar gas
    let gasEstimate = null;
    try {
        gasEstimate = await wallet.estimateTokenGas(contract.address, to, amount);
    } catch (e) {
        console.warn('No se pudo estimar gas');
    }
    
    // Solicitar firma
    requestSignature({
        type: `Enviar ${contract.symbol}`,
        to: to,
        amount: amount,
        symbol: contract.symbol,
        gas: gasEstimate?.totalCost || 'Variable'
    }, async (password) => {
        try {
            // Mostrar procesando
            document.getElementById('tokenTransferForm').style.display = 'none';
            document.getElementById('tokenProcessing').style.display = 'block';
            
            const result = await wallet.sendToken(contract.address, to, amount, password);
            
            // Mostrar éxito
            document.getElementById('tokenProcessing').style.display = 'none';
            document.getElementById('tokenSuccess').style.display = 'block';
            
            const txLink = document.getElementById('tokenTxHash');
            txLink.textContent = wallet.formatAddress(result.hash);
            txLink.href = wallet.getExplorerTxUrl(result.hash);
            
            // Actualizar lista y actividad
            await updateAllBalances();
            renderActivityList();
            
        } catch (error) {
            document.getElementById('tokenProcessing').style.display = 'none';
            document.getElementById('tokenTransferForm').style.display = 'none';
            
            // Mostrar contenido del modal de token
            const modal = document.getElementById('tokenDetailModal');
            const balanceCard = modal.querySelector('.balance-card');
            const extraActions = modal.querySelector('.token-extra-actions');
            
            if (balanceCard) balanceCard.style.display = '';
            if (extraActions) extraActions.style.display = '';
            
            showToast('error', t('error'), error.message || t('errorTransactionFailed'));
        }
    });
}

function closeTokenDetailModal() {
    closeModal('tokenDetailModal');
    currentTokenDetail = null;
}

// ========================================
// Utility Functions
// ========================================

function copyToClipboard(text) {
    // Si es una dirección corta, obtener la completa
    if (currentNFTDetail && text.includes('...')) {
        text = currentNFTDetail.contract.address;
    } else if (currentTokenDetail && text.includes('...')) {
        text = currentTokenDetail.contract.address;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', t('copied'), t('addressCopied'));
    }).catch(() => {
        showToast('error', t('error'), 'No se pudo copiar');
    });
}

function renderActivityList() {
    const container = document.getElementById('activityList');
    const allActivityLink = document.getElementById('allActivityLink');
    const activities = wallet.getActivities();
    const network = NetworkManager.getCurrentNetwork();
    
    // Actualizar el link de Ver todo
    if (allActivityLink) {
        allActivityLink.href = wallet.getExplorerAddressUrl();
    }
    
    if (!activities || activities.length === 0) {
        // Deshabilitar Ver todo cuando no hay actividad
        if (allActivityLink) {
            allActivityLink.classList.add('disabled');
        }
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📋</span>
                <p>Sin actividad reciente</p>
            </div>
        `;
        return;
    }
    
    // Habilitar Ver todo cuando hay actividad
    if (allActivityLink) {
        allActivityLink.classList.remove('disabled');
    }
    
    container.innerHTML = '';
    
    // Mostrar máximo 50 actividades recientes
    const recentActivities = activities.slice(0, 50);
    
    for (const activity of recentActivities) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        let icon, badgeClass, amountPrefix, addressLabel, address, amountDisplay;
        
        // Determinar tipo de actividad
        switch(activity.type) {
            case 'contract_created':
                // Creación de contrato
                icon = activity.contractType === 'ERC721' ? '🎨' : activity.contractType === 'ERC20' ? '🪙' : '📄';
                badgeClass = 'badge-contract';
                amountDisplay = `<span class="activity-badge ${badgeClass}">${t('new')}</span> ${activity.contractType || t('contract')}`;
                addressLabel = t('contract');
                address = activity.contractAddress;
                break;
                
            case 'received':
                // Recepción de tokens/moneda nativa
                icon = activity.assetType === 'ERC721' ? '🖼️' : '📥';
                badgeClass = 'badge-received';
                amountPrefix = '+';
                addressLabel = t('from');
                address = activity.from;
                
                if (activity.assetType === 'ERC721') {
                    amountDisplay = `<span class="activity-badge ${badgeClass}">+1</span> ${activity.symbol || 'NFT'} #${activity.tokenId}`;
                } else {
                    const formattedAmount = parseFloat(activity.amount).toFixed(4);
                    amountDisplay = `<span class="activity-badge ${badgeClass}">${amountPrefix}${formattedAmount}</span> ${activity.symbol}`;
                }
                break;
                
            case 'sent':
            default:
                // Envío de tokens/moneda nativa
                icon = activity.assetType === 'ERC721' ? '🖼️' : '📤';
                badgeClass = 'badge-sent';
                amountPrefix = '-';
                addressLabel = t('to');
                address = activity.to;
                
                if (activity.assetType === 'ERC721') {
                    amountDisplay = `<span class="activity-badge ${badgeClass}">-1</span> ${activity.symbol || 'NFT'} #${activity.tokenId}`;
                } else {
                    const formattedAmount = parseFloat(activity.amount).toFixed(4);
                    amountDisplay = `<span class="activity-badge ${badgeClass}">${amountPrefix}${formattedAmount}</span> ${activity.symbol}`;
                }
                break;
        }
        
        // Formatear fecha
        const date = new Date(activity.timestamp);
        const timeAgo = getTimeAgo(date);
        
        // Link al explorador (solo si hay txHash)
        const explorerLink = activity.txHash 
            ? `<a href="${wallet.getExplorerTxUrl(activity.txHash)}" target="_blank" class="activity-link" title="${t('viewInExplorer')}">🔗</a>`
            : '';
        
        item.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-info">
                <div class="activity-main">
                    <span class="activity-amount">${amountDisplay}</span>
                </div>
                <div class="activity-details">
                    <span class="activity-address">${addressLabel}: ${wallet.formatAddress(address || 'Unknown')}</span>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            </div>
            ${explorerLink}
        `;
        
        container.appendChild(item);
    }
    
    // Agregar link para ver todo el historial
    const linkContainer = document.createElement('div');
    linkContainer.className = 'activity-footer';
    linkContainer.innerHTML = `
        <a href="${network.explorer}/address/${window.walletAddress}" target="_blank" class="btn-text">
            ${t('viewFullHistory')} ↗
        </a>
    `;
    container.appendChild(linkContainer);
}

// Función para calcular tiempo transcurrido
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return t('now');
    if (seconds < 3600) return t('minutesAgo', { n: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('hoursAgo', { n: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('daysAgo', { n: Math.floor(seconds / 86400) });
    
    return date.toLocaleDateString();
}

// ========================================
// Helper Functions
// ========================================

function sendTokenFromList(contractAddress) {
    openModal('sendModal');
    switchSendTab('token');
    document.getElementById('tokenSelect').value = contractAddress;
    
    const contract = wallet.contracts.find(c => c.address === contractAddress);
    if (contract) {
        document.getElementById('sendTokenSymbol').textContent = contract.symbol;
        updateMaxBalance('token', contractAddress);
    }
}

function removeToken(address) {
    const contract = wallet.contracts.find(c => c.address.toLowerCase() === address.toLowerCase());
    if (!contract) return;
    
    showConfirmModal({
        icon: '🗑️',
        title: '¿Eliminar este token?',
        message: 'El token será removido de tu lista. Podrás agregarlo de nuevo más tarde.',
        itemIcon: contract.symbol ? contract.symbol.slice(0, 2).toUpperCase() : 'TK',
        itemName: contract.name || 'Token',
        itemDetail: contract.symbol || '',
        buttonText: 'Eliminar Token',
        onConfirm: () => {
            wallet.removeContract(address);
            renderTokensList();
            showToast('success', t('success'), 'El token ha sido removido de tu lista');
        }
    });
}

function removeNFTCollection(address) {
    const contract = wallet.contracts.find(c => c.address.toLowerCase() === address.toLowerCase());
    if (!contract) return;
    
    showConfirmModal({
        icon: '🗑️',
        title: '¿Eliminar esta colección?',
        message: 'La colección NFT será removida de tu lista. Podrás agregarla de nuevo más tarde.',
        itemIcon: contract.symbol ? contract.symbol.slice(0, 2).toUpperCase() : 'NFT',
        itemName: contract.name || 'Colección NFT',
        itemDetail: contract.symbol || '',
        buttonText: 'Eliminar Colección',
        onConfirm: () => {
            wallet.removeContract(address);
            renderNFTsList();
            showToast('success', t('success'), 'La colección NFT ha sido removida');
        }
    });
}

// ========================================
// Educational Tips Rotation
// ========================================

let currentTipIndex = 0;

function showNextTip() {
    // Función legacy - elemento removido
}

function startTipRotation() {
    // Función legacy - elemento removido
}

// ========================================
// Update UI Data
// ========================================

async function updateAllBalances() {
    const nativeBalance = await wallet.getNativeBalance();
    document.getElementById('mainBalance').textContent = parseFloat(nativeBalance).toFixed(4);
    
    renderTokensList();
    renderNFTsList();
}

function updateAddressDisplay() {
    const shortAddress = wallet.formatAddress(wallet.address);
    document.getElementById('shortAddress').textContent = shortAddress;
    document.getElementById('addressLink').href = wallet.getExplorerAddressUrl();
    document.getElementById('allActivityLink').href = wallet.getExplorerAddressUrl();
}

// ========================================
// Lock/Unlock Wallet
// ========================================

function lockWallet() {
    // Terminar sesión
    if (typeof SessionManager !== 'undefined') {
        SessionManager.endSession();
    }
    
    // Notificar al background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
            chrome.runtime.sendMessage({ type: 'POPUP_LOCK' });
        } catch (e) {
            console.log('Not in extension context');
        }
    }
    
    wallet.stopAllEventListeners();
    updateListenerUI();
    document.getElementById('app').classList.add('hidden');
    
    // Limpiar campo de contraseña
    const unlockPwd = document.getElementById('unlockPassword');
    if (unlockPwd) unlockPwd.value = '';
    
    openModal('unlockModal');
    showToast('info', t('walletLocked'), t('enterPasswordToContinue'));
}

function resetWallet() {
    showConfirmModal({
        icon: '⚠️',
        title: t('deleteWalletTitle'),
        message: t('deleteWalletMsg'),
        buttonText: t('deleteWalletBtn'),
        onConfirm: () => {
            wallet.resetWallet();
            location.reload();
        }
    });
}

function showSettings() {
    // Actualizar info de red actual
    const currentNetwork = NetworkManager.getCurrentNetwork();
    const nameEl = document.getElementById('currentNetworkName');
    const chainEl = document.getElementById('currentChainId');
    
    if (nameEl) nameEl.textContent = currentNetwork.name;
    if (chainEl) chainEl.textContent = `Chain ID: ${currentNetwork.chainId}`;
    
    // Renderizar lista de redes
    renderNetworkList();
    
    // Cerrar todas las secciones
    document.querySelectorAll('#settingsModal .config-section').forEach(s => {
        s.classList.remove('open');
    });
    
    // Limpiar formulario de agregar red
    const inputs = ['newNetworkName', 'newNetworkChainId', 'newNetworkRpc', 'newNetworkExplorer', 'newNetworkSymbol'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    openModal('settingsModal');
}

function renderNetworkList() {
    const container = document.getElementById('networkList');
    const allNetworks = NetworkManager.getAllNetworks();
    const currentNetwork = NetworkManager.getCurrentNetwork();
    
    container.innerHTML = '';
    
    for (const [id, network] of Object.entries(allNetworks)) {
        const isActive = id === currentNetwork.id || 
                        (network.chainId === currentNetwork.chainId && network.rpcUrl === currentNetwork.rpcUrl);
        const isCustom = id.startsWith('custom_');
        
        const item = document.createElement('div');
        item.className = `network-item ${isActive ? 'active' : ''}`;
        item.onclick = (e) => {
            if (!e.target.classList.contains('btn-remove-network')) {
                selectNetwork(id);
            }
        };
        
        item.innerHTML = `
            <div class="network-item-info">
                <span class="network-item-name">${network.name}</span>
                <span class="network-item-details">${network.currency?.symbol || 'ETH'} · Chain ID: ${network.chainId}</span>
            </div>
            <div class="network-item-actions">
                ${isActive ? '<span class="network-item-check">✓</span>' : ''}
                ${isCustom ? `<button class="btn-remove-network" data-click="removeCustomNetwork('${id}')" title="Eliminar">🗑️</button>` : ''}
            </div>
        `;
        
        container.appendChild(item);
    }
}

async function selectNetwork(networkId) {
    const newNetwork = NetworkManager.setCurrentNetwork(networkId);
    
    if (newNetwork) {
        // Actualizar variable global
        NETWORK = newNetwork;
        
        // Actualizar toda la UI de red
        updateNetworkUI();
        updateFooterLinks();
        document.getElementById('currentNetworkName').textContent = newNetwork.name;
        document.getElementById('currentChainId').textContent = `Chain ID: ${newNetwork.chainId}`;
        
        // Reinicializar wallet con nueva red
        try {
            await wallet.init();
            await updateAllBalances();
            updateListenerUI();
            
            showToast('success', t('networkChanged'), `${t('connectedTo')} ${newNetwork.name}`);
        } catch (error) {
            showToast('error', t('error'), t('errorNetworkConnect'));
        }
        
        renderNetworkList();
    }
}

// Cargar datos de red actual en el formulario de configuración
function loadNetworkConfigForm() {
    const network = NetworkManager.getCurrentNetwork();
    const isCustom = network.id?.startsWith('custom_');
    
    document.getElementById('editNetworkName').value = network.name || '';
    document.getElementById('editNetworkRpc').value = network.rpcUrl || '';
    document.getElementById('editNetworkRpcFallback').value = network.rpcUrlFallback || '';
    document.getElementById('editNetworkWs').value = network.wsUrl || '';
    document.getElementById('editNetworkWsFallback').value = network.wsUrlFallback || '';
    document.getElementById('editNetworkChainId').value = network.chainId || '';
    document.getElementById('editNetworkExplorer').value = network.explorer || '';
    document.getElementById('editNetworkSymbol').value = network.currency?.symbol || '';
    
    // Mostrar/ocultar botón restaurar según si es red predefinida
    const btnReset = document.getElementById('btnResetNetwork');
    if (btnReset) {
        // Solo mostrar restaurar para redes predefinidas que hayan sido modificadas
        const modified = NetworkManager.getModifiedNetworks();
        btnReset.style.display = (!isCustom && modified[network.id]) ? 'block' : 'none';
    }
}

// Guardar configuración de red
async function saveNetworkConfig() {
    const currentNetwork = NetworkManager.getCurrentNetwork();
    const isCustom = currentNetwork.id?.startsWith('custom_');
    
    const name = document.getElementById('editNetworkName').value.trim();
    const rpcUrl = document.getElementById('editNetworkRpc').value.trim();
    const rpcUrlFallback = document.getElementById('editNetworkRpcFallback').value.trim();
    const wsUrl = document.getElementById('editNetworkWs').value.trim();
    const wsUrlFallback = document.getElementById('editNetworkWsFallback').value.trim();
    const explorer = document.getElementById('editNetworkExplorer').value.trim();
    const symbol = document.getElementById('editNetworkSymbol').value.trim();
    
    // Validar
    if (!name || !rpcUrl || !explorer) {
        showToast('error', t('error'), t('errorNetworkRequired'));
        return;
    }
    
    if (!rpcUrl.startsWith('http')) {
        showToast('error', t('error'), t('errorInvalidRpcUrl'));
        return;
    }
    
    // Validar WSS si se proporciona
    if (wsUrl && !wsUrl.startsWith('ws')) {
        showToast('error', t('error'), t('errorInvalidWssUrl'));
        return;
    }
    
    const modifications = {
        name,
        rpcUrl,
        explorer,
        currency: {
            ...currentNetwork.currency,
            symbol: symbol || currentNetwork.currency?.symbol
        }
    };
    
    // Agregar campos opcionales solo si tienen valor
    if (rpcUrlFallback) modifications.rpcUrlFallback = rpcUrlFallback;
    if (wsUrl) modifications.wsUrl = wsUrl;
    if (wsUrlFallback) modifications.wsUrlFallback = wsUrlFallback;
    
    if (isCustom) {
        // Para redes personalizadas, actualizar directamente
        const updatedNetwork = { ...currentNetwork, ...modifications };
        NetworkManager.saveCustomNetwork(updatedNetwork);
    } else {
        // Para redes predefinidas, guardar como modificación
        NetworkManager.saveModifiedNetwork(currentNetwork.id, modifications);
    }
    
    // Actualizar variable global
    NETWORK = NetworkManager.getCurrentNetwork();
    
    // Actualizar UI
    document.getElementById('currentNetworkName').textContent = NETWORK.name;
    updateNetworkUI();
    renderNetworkList();
    
    // Reconectar con la nueva configuración
    try {
        await wallet.init();
        showToast('success', t('saved'), 'Configuración de red actualizada');
    } catch (error) {
        showToast('warning', t('saved'), t('savedButReconnectError'));
    }
    
    // Actualizar botón restaurar
    loadNetworkConfigForm();
}

// Restaurar red predefinida a valores originales
async function resetCurrentNetworkToDefault() {
    const currentNetwork = NetworkManager.getCurrentNetwork();
    
    if (currentNetwork.id?.startsWith('custom_')) {
        showToast('info', t('info'), t('customNetworksNoRestore'));
        return;
    }
    
    const success = NetworkManager.resetNetworkToDefault(currentNetwork.id);
    
    if (success) {
        // Actualizar variable global
        NETWORK = NetworkManager.getCurrentNetwork();
        
        // Actualizar UI
        document.getElementById('currentNetworkName').textContent = NETWORK.name;
        updateNetworkUI();
        renderNetworkList();
        loadNetworkConfigForm();
        
        // Reconectar
        try {
            await wallet.init();
            showToast('success', t('restored'), t('networkRestoredDefault'));
        } catch (error) {
            showToast('warning', t('restored'), t('restoredButReconnectError'));
        }
    }
}

// Actualizar links del footer según la red y wallet
function updateFooterLinks() {
    const network = NetworkManager.getCurrentNetwork();
    const explorerLink = document.getElementById('footerExplorer');
    const faucetLink = document.getElementById('footerFaucet');
    
    if (explorerLink && network) {
        explorerLink.href = network.explorer || '#';
    }
    
    if (faucetLink && wallet.address) {
        faucetLink.href = `/faucet/?address=${wallet.address}`;
    }
}

function openAddNetworkForm() {
    document.getElementById('addNetworkForm').style.display = 'block';
    document.getElementById('btnAddNetwork').style.display = 'none';
    
    // Limpiar campos
    document.getElementById('newNetworkName').value = '';
    document.getElementById('newNetworkChainId').value = '';
    document.getElementById('newNetworkRpc').value = '';
    document.getElementById('newNetworkExplorer').value = '';
    document.getElementById('newNetworkSymbol').value = '';
}

function cancelAddNetwork() {
    document.getElementById('addNetworkForm').style.display = 'none';
    document.getElementById('btnAddNetwork').style.display = 'block';
}

async function saveNewCustomNetwork() {
    const name = document.getElementById('newNetworkName').value.trim();
    const chainId = parseInt(document.getElementById('newNetworkChainId').value);
    const rpcUrl = document.getElementById('newNetworkRpc').value.trim();
    const explorer = document.getElementById('newNetworkExplorer').value.trim();
    const symbol = document.getElementById('newNetworkSymbol').value.trim() || 'ETH';
    
    // Validar
    if (!name || !chainId || !rpcUrl || !explorer) {
        showToast('error', 'Error', 'Completa todos los campos requeridos');
        return;
    }
    
    const network = {
        id: NetworkManager.createNetworkId(name),
        name: name,
        chainId: chainId,
        rpcUrl: rpcUrl,
        explorer: explorer,
        currency: {
            name: symbol,
            symbol: symbol,
            decimals: 18
        }
    };
    
    const validation = NetworkManager.validateNetwork(network);
    if (!validation.valid) {
        showToast('error', 'Error', validation.error);
        return;
    }
    
    // Probar conexión
    try {
        showToast('info', t('info'), t('testingConnection'));
        const testProvider = new ethers.JsonRpcProvider(rpcUrl);
        await testProvider.getNetwork();
    } catch (error) {
        showToast('error', t('error'), t('errorRpcConnect'));
        return;
    }
    
    // Guardar
    NetworkManager.saveCustomNetwork(network);
    
    showToast('success', t('networkAdded'), `${name} ${t('addedCorrectly')}`);
    cancelAddNetwork();
    renderNetworkList();
}

function removeCustomNetwork(networkId) {
    const allNetworks = NetworkManager.getAllNetworks();
    const network = allNetworks.find(n => n.id === networkId);
    
    showConfirmModal({
        icon: '🌐',
        title: '¿Eliminar esta red?',
        message: 'La red personalizada será eliminada de tu lista.',
        itemIcon: '🔗',
        itemName: network ? network.name : networkId,
        itemDetail: network ? `Chain ID: ${network.chainId}` : '',
        buttonText: 'Eliminar Red',
        onConfirm: () => {
            const currentNetwork = NetworkManager.getCurrentNetwork();
            
            // Si es la red actual, cambiar a Rollux
            if (currentNetwork.id === networkId) {
                selectNetwork('rollux');
            }
            
            NetworkManager.removeCustomNetwork(networkId);
            renderNetworkList();
            showToast('info', 'Red eliminada', 'La red personalizada ha sido eliminada');
        }
    });
}

// ========================================
// Export Private Key
// ========================================

let exportedPrivateKey = null;

function showExportKeyForm() {
    document.getElementById('exportKeyForm').style.display = 'block';
    document.getElementById('privateKeyDisplay').style.display = 'none';
    document.getElementById('exportFileForm').style.display = 'none';
    document.getElementById('exportKeyPassword').value = '';
    exportedPrivateKey = null;
}

async function exportPrivateKey() {
    const password = document.getElementById('exportKeyPassword').value;
    
    if (!password) {
        showToast('error', t('error'), t('enterPassword'));
        return;
    }
    
    // Mostrar overlay mientras descifra
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.show('unlock', t('decryptingPrivateKey'));
    }
    
    // Dar tiempo para mostrar el overlay
    await new Promise(r => setTimeout(r, 100));
    
    try {
        const privateKey = wallet.decryptPrivateKey(password);
        exportedPrivateKey = privateKey;
        
        // Ocultar overlay
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.hide();
        }
        
        // Mostrar en el nuevo layout
        const keyPasswordStep = document.getElementById('keyPasswordStep');
        const keyDisplayStep = document.getElementById('keyDisplayStep');
        const keyVisible = document.getElementById('privateKeyVisible');
        const keyMasked = document.getElementById('privateKeyMasked');
        
        if (keyPasswordStep) keyPasswordStep.classList.add('hidden');
        if (keyDisplayStep) keyDisplayStep.classList.remove('hidden');
        if (keyVisible) {
            keyVisible.textContent = privateKey;
            keyVisible.classList.add('hidden');
        }
        if (keyMasked) keyMasked.classList.remove('hidden');
        
        showToast('success', 'Llave descifrada', 'Haz clic para revelar');
    } catch (error) {
        // Ocultar overlay
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.hide();
        }
        showToast('error', t('error'), t('wrongPassword'));
    }
}

function togglePrivateKeyVisibility() {
    const masked = document.getElementById('privateKeyMasked');
    const visible = document.getElementById('privateKeyVisible');
    
    if (!masked || !visible) return;
    
    if (visible.classList.contains('hidden')) {
        visible.classList.remove('hidden');
        masked.classList.add('hidden');
    } else {
        visible.classList.add('hidden');
        masked.classList.remove('hidden');
    }
}

function copyPrivateKey() {
    if (exportedPrivateKey) {
        navigator.clipboard.writeText(exportedPrivateKey).then(() => {
            showToast('success', 'Copiado', 'Llave privada copiada al portapapeles');
        }).catch(() => {
            showToast('error', 'Error', 'No se pudo copiar');
        });
    }
}

function hidePrivateKey() {
    document.getElementById('exportKeyForm').style.display = 'none';
    document.getElementById('privateKeyDisplay').style.display = 'none';
    document.getElementById('exportKeyPassword').value = '';
    exportedPrivateKey = null;
}

function showExportFileForm() {
    document.getElementById('exportKeyForm').style.display = 'none';
    document.getElementById('privateKeyDisplay').style.display = 'none';
    document.getElementById('exportFileForm').style.display = 'block';
    
    // Limpiar campos
    document.getElementById('exportFileWalletPassword').value = '';
    document.getElementById('exportFilePassword').value = '';
    document.getElementById('exportFilePasswordConfirm').value = '';
}

async function exportEncryptedFile() {
    const walletPassword = document.getElementById('exportFileWalletPassword').value;
    const useDifferentPwd = document.getElementById('useDifferentPassword')?.checked || false;
    const filePassword = useDifferentPwd ? document.getElementById('exportFilePassword').value : walletPassword;
    const filePasswordConfirm = useDifferentPwd ? document.getElementById('exportFilePasswordConfirm').value : walletPassword;
    const includeContracts = document.getElementById('exportIncludeContracts')?.checked || false;
    const includeNetworks = document.getElementById('exportIncludeNetworks')?.checked || false;
    
    if (!walletPassword) {
        showToast('error', t('error'), t('errorEnterWalletPassword'));
        return;
    }
    
    if (useDifferentPwd) {
        if (!filePassword || !filePasswordConfirm) {
            showToast('error', t('error'), t('errorFillFilePasswords'));
            return;
        }
        
        if (filePassword !== filePasswordConfirm) {
            showToast('error', t('error'), t('errorFilePasswordsDontMatch'));
            return;
        }
        
        if (filePassword.length < 8) {
            showToast('error', t('error'), t('errorPasswordMinLength'));
            return;
        }
    }
    
    try {
        // Mostrar overlay de generación de certificado
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.show('export', t('generatingCertificate'));
        }
        
        // Dar tiempo para que se muestre el overlay antes del cifrado pesado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const exportData = wallet.exportEncryptedWallet(walletPassword, filePassword, includeContracts, includeNetworks);
        
        // Crear y descargar archivo
        const blob = new Blob([exportData], { type: 'application/x-pem-file' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `0xaddress-wallet-${wallet.address.slice(0, 8)}.pem`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Ocultar overlay
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.hide();
        }
        
        // Mensaje de éxito
        showToast('success', t('certificateGenerated'), t('certificateGeneratedDesc'));
        
        // Limpiar y ocultar formulario
        document.getElementById('exportFileForm').style.display = 'none';
        document.getElementById('exportFileWalletPassword').value = '';
        if (document.getElementById('exportFilePassword')) {
            document.getElementById('exportFilePassword').value = '';
        }
        if (document.getElementById('exportFilePasswordConfirm')) {
            document.getElementById('exportFilePasswordConfirm').value = '';
        }
        
    } catch (error) {
        if (typeof CryptoOverlay !== 'undefined') {
            CryptoOverlay.hide();
        }
        showToast('error', t('error'), error.message || t('errorGeneratingCertificate'));
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

async function refreshAll() {
    showToast('info', 'Actualizando...', 'Obteniendo datos de la blockchain');
    
    // Refrescar balance nativo
    const nativeBalance = await wallet.getNativeBalance();
    document.getElementById('mainBalance').textContent = parseFloat(nativeBalance).toFixed(4);
    
    // Refrescar tokens
    await refreshTokens();
    
    // Refrescar NFTs
    await refreshNFTs();
    
    showToast('success', 'Actualizado', 'Datos actualizados correctamente');
}

async function refreshTokens() {
    const btn = document.getElementById('refreshTokensBtn');
    if (btn) {
        btn.classList.add('spinning');
    }
    
    try {
        await renderTokensList();
    } catch (error) {
        console.error('Error refrescando tokens:', error);
    }
    
    if (btn) {
        btn.classList.remove('spinning');
    }
}

async function refreshNFTs() {
    const btn = document.getElementById('refreshNFTsBtn');
    if (btn) {
        btn.classList.add('spinning');
    }
    
    try {
        await renderNFTsList();
    } catch (error) {
        console.error('Error refrescando NFTs:', error);
    }
    
    if (btn) {
        btn.classList.remove('spinning');
    }
}

// ========================================
// Network UI Updates
// ========================================

function updateNetworkUI() {
    const network = NetworkManager.getCurrentNetwork();
    const symbol = network.currency?.symbol || 'ETH';
    
    // Header
    const networkNameEl = document.getElementById('networkName');
    if (networkNameEl) networkNameEl.textContent = network.name;
    
    // Modal recibir
    const receiveNetworkName = document.getElementById('receiveNetworkName');
    if (receiveNetworkName) receiveNetworkName.textContent = network.name;
    
    // Tab nativo
    const nativeTabSymbol = document.getElementById('nativeTabSymbol');
    if (nativeTabSymbol) nativeTabSymbol.textContent = symbol;
    
    // Balance symbol
    const mainBalanceSymbol = document.getElementById('mainBalanceSymbol');
    if (mainBalanceSymbol) mainBalanceSymbol.textContent = symbol;
    
    // Send token symbol
    const sendTokenSymbol = document.getElementById('sendTokenSymbol');
    if (sendTokenSymbol && currentSendType === 'native') {
        sendTokenSymbol.textContent = symbol;
    }
}

// ========================================
// Listener Management
// ========================================

function toggleListeners() {
    if (wallet.isListening()) {
        wallet.stopAllEventListeners();
        showToast('info', 'Listeners desactivados', 'Ya no se escucharán eventos de tokens');
    } else {
        const count = wallet.startAllEventListeners();
        showToast('success', 'Listeners activados', `Escuchando ${count} contratos + SYS`);
    }
    updateListenerUI();
}

function updateListenerUI() {
    const toggle = document.getElementById('listenerToggle');
    const icon = document.getElementById('listenerIcon');
    const status = document.getElementById('listenerStatus');
    
    if (!toggle) return;
    
    const isActive = wallet.isListening();
    const listenerStatus = wallet.getListenersStatus();
    
    toggle.classList.remove('active', 'inactive');
    toggle.classList.add(isActive ? 'active' : 'inactive');
    
    icon.textContent = isActive ? '📡' : '📴';
    status.textContent = isActive ? `${listenerStatus.contractListeners + 1}` : 'OFF';
    
    toggle.title = isActive 
        ? `Escuchando: ${listenerStatus.contractListeners} tokens + SYS. Click para desactivar.`
        : 'Listeners inactivos. Click para activar.';
}

// ========================================
// NFT Collection Methods
// ========================================

function openNFTCollectionMethods(contractAddress) {
    const contract = wallet.contracts.find(c => c.address.toLowerCase() === contractAddress.toLowerCase());
    if (!contract) return;
    
    openContractMethodsModal(contractAddress, 'ERC721', ERC721_ABI);
}

// ========================================
// Educational Tips Toggle
// ========================================

let eduTipsEnabled = false;

function toggleEduTips() {
    eduTipsEnabled = !eduTipsEnabled;
    localStorage.setItem('oxaddress_edu_tips', eduTipsEnabled ? 'on' : 'off');
    updateEduTipsUI();
    
    if (eduTipsEnabled) {
        showRandomTip();
    }
}

function updateEduTipsUI() {
    const toggle = document.getElementById('eduTipsToggle');
    if (toggle) {
        toggle.textContent = eduTipsEnabled ? 'ON' : 'OFF';
        toggle.className = eduTipsEnabled ? 'menu-toggle on' : 'menu-toggle';
    }
}

function initEduTips() {
    const saved = localStorage.getItem('oxaddress_edu_tips');
    eduTipsEnabled = saved === 'on';
    updateEduTipsUI();
}

function showRandomTip() {
    if (!eduTipsEnabled) return;
    
    const tips = [
        'Las wallets no guardan tokens, solo las claves para acceder a ellos en la blockchain.',
        'Una clave privada es como una contraseña que nunca debes compartir.',
        'La dirección pública es como tu número de cuenta: puedes compartirla.',
        'Cada transacción en blockchain es inmutable y verificable.',
        'El gas es la tarifa que pagas a los validadores.',
        'DYOR: Do Your Own Research antes de interactuar con cualquier contrato.',
        'ERC20 = tokens fungibles, ERC721 = NFTs únicos.',
        'Siempre verifica la dirección antes de enviar una transacción.',
        'Not your keys, not your coins.'
    ];
    
    const tip = tips[Math.floor(Math.random() * tips.length)];
    showToast('info', '💡 Tip', tip, 8000);
}

// Inicializar tips al cargar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initEduTips, 1000);
});

// Helper function for opening explorer links
function openExplorerLink(url) {
    window.open(url, '_blank');
}

// Helper for copying token contract
function copyTokenContract() {
    const address = document.getElementById('tokenDetailContract').textContent;
    navigator.clipboard.writeText(address).then(() => {
        showToast('success', 'Copiado', 'Dirección del contrato copiada');
    });
}


// ========================================
// Mnemonic Modal Functions
// ========================================

function openMnemonicModal() {
    if (!wallet.hasMnemonic()) {
        showToast('warning', 'Sin mnemonic', 'Esta wallet no tiene frase de recuperación guardada');
        return;
    }
    
    // Reset state
    document.getElementById('mnemonicPassword').value = '';
    document.getElementById('mnemonicPasswordStep').classList.remove('hidden');
    document.getElementById('mnemonicDisplayStep').classList.add('hidden');
    document.getElementById('mnemonicWords').innerHTML = '';
    
    openModal('mnemonicModal');
}

async function revealMnemonic() {
    const password = document.getElementById('mnemonicPassword').value;
    if (!password) {
        showToast('error', t('error'), t('enterPassword'));
        return;
    }
    
    // Mostrar overlay mientras descifra
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.show('unlock', t('decryptingSeedPhrase'));
    }
    
    // Dar tiempo para mostrar el overlay
    await new Promise(r => setTimeout(r, 100));
    
    const mnemonic = wallet.getMnemonic(password);
    
    // Ocultar overlay
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.hide();
    }
    
    if (!mnemonic) {
        showToast('error', t('error'), t('wrongPassword'));
        document.getElementById('mnemonicPassword').value = '';
        return;
    }
    
    // Display mnemonic words
    const words = mnemonic.split(' ');
    const wordsHtml = words.map((word, i) => `
        <div class="mnemonic-word">
            <span class="mnemonic-word-index">${i + 1}</span>
            <span class="mnemonic-word-text">${word}</span>
        </div>
    `).join('');
    
    document.getElementById('mnemonicWords').innerHTML = wordsHtml;
    document.getElementById('mnemonicPasswordStep').classList.add('hidden');
    document.getElementById('mnemonicDisplayStep').classList.remove('hidden');
}

function copyMnemonic() {
    const words = document.querySelectorAll('.mnemonic-word-text');
    const mnemonic = Array.from(words).map(w => w.textContent).join(' ');
    
    navigator.clipboard.writeText(mnemonic).then(() => {
        showToast('success', 'Copiado', 'Frase copiada al portapapeles');
    });
}

function closeMnemonicModal() {
    // Clear sensitive data
    document.getElementById('mnemonicPassword').value = '';
    document.getElementById('mnemonicWords').innerHTML = '';
    document.getElementById('mnemonicPasswordStep').classList.remove('hidden');
    document.getElementById('mnemonicDisplayStep').classList.add('hidden');
    
    closeModal('mnemonicModal');
}

// ========================================
// Promo Banners Functions (Carrusel automático)
// ========================================

let currentBannerIndex = 0;
let bannerInterval = null;
let closedBanners = [];

function initBanners() {
    const container = document.getElementById('promoBanners');
    if (!container) return;
    
    // Cargar banners cerrados del storage
    try {
        const saved = localStorage.getItem('0xaddress_closed_banners');
        if (saved) closedBanners = JSON.parse(saved);
    } catch(e) {
        closedBanners = [];
    }
    
    // Ocultar banners ya cerrados
    closedBanners.forEach(index => {
        const banner = document.getElementById(`banner${index}`);
        if (banner) banner.style.display = 'none';
    });
    
    // Contar banners visibles
    const visibleCount = getVisibleBannersCount();
    if (visibleCount === 0) {
        container.style.display = 'none';
        return;
    }
    
    // Reset
    currentBannerIndex = 0;
    showBannerAtIndex(0);
    updateDots();
    
    // Iniciar rotación automática
    startAutoRotation();
}

function getVisibleBannersCount() {
    let count = 0;
    for (let i = 0; i < 4; i++) {
        const banner = document.getElementById(`banner${i}`);
        if (banner && banner.style.display !== 'none') {
            count++;
        }
    }
    return count;
}

function getVisibleBannerIndices() {
    const indices = [];
    for (let i = 0; i < 4; i++) {
        const banner = document.getElementById(`banner${i}`);
        if (banner && banner.style.display !== 'none') {
            indices.push(i);
        }
    }
    return indices;
}

function showBannerAtIndex(visibleIndex) {
    const indices = getVisibleBannerIndices();
    
    // Ocultar todos los banners
    for (let i = 0; i < 4; i++) {
        const banner = document.getElementById(`banner${i}`);
        if (banner) banner.classList.remove('active');
    }
    
    // Mostrar el banner en la posición indicada
    if (indices[visibleIndex] !== undefined) {
        const banner = document.getElementById(`banner${indices[visibleIndex]}`);
        if (banner) banner.classList.add('active');
    }
}

function startAutoRotation() {
    // Limpiar intervalo anterior si existe
    if (bannerInterval) {
        clearInterval(bannerInterval);
    }
    
    // Crear nuevo intervalo - rotar cada 4 segundos
    bannerInterval = setInterval(function() {
        const visibleCount = getVisibleBannersCount();
        if (visibleCount <= 1) return;
        
        currentBannerIndex = (currentBannerIndex + 1) % visibleCount;
        showBannerAtIndex(currentBannerIndex);
        updateDots();
    }, 4000);
}

function stopAutoRotation() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }
}

function goToBanner(index) {
    const indices = getVisibleBannerIndices();
    const visibleIndex = indices.indexOf(index);
    
    if (visibleIndex !== -1) {
        currentBannerIndex = visibleIndex;
        showBannerAtIndex(currentBannerIndex);
        updateDots();
        
        // Reiniciar rotación
        startAutoRotation();
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.banner-dot');
    const indices = getVisibleBannerIndices();
    
    dots.forEach((dot, i) => {
        if (i < indices.length) {
            dot.style.display = 'inline-block';
            if (i === currentBannerIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        } else {
            dot.style.display = 'none';
        }
    });
}

function closeBanner(index) {
    const banner = document.getElementById(`banner${index}`);
    if (!banner) return;
    
    // Animar cierre
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        banner.style.display = 'none';
        
        // Guardar en localStorage
        if (!closedBanners.includes(index)) {
            closedBanners.push(index);
            localStorage.setItem('0xaddress_closed_banners', JSON.stringify(closedBanners));
        }
        
        // Verificar si quedan banners
        const visibleCount = getVisibleBannersCount();
        if (visibleCount === 0) {
            const container = document.getElementById('promoBanners');
            if (container) container.style.display = 'none';
            stopAutoRotation();
        } else {
            currentBannerIndex = 0;
            showBannerAtIndex(0);
            updateDots();
        }
    }, 300);
}

// Función de compatibilidad
function initCarousel() {
    initBanners();
}

function closeTipsCarousel() {
    const container = document.getElementById('promoBanners');
    if (container) {
        container.style.display = 'none';
        stopAutoRotation();
    }
}

// ========================================
// Security Modal Functions
// ========================================

function showSecurityModal() {
    // Reset all sections to closed
    document.querySelectorAll('.config-section').forEach(section => {
        section.classList.remove('open');
    });
    
    // Reset all content to password step
    resetSecuritySections();
    
    openModal('privateKeyModal');
}

function resetSecuritySections() {
    // Reset Seed Phrase section
    const seedPwd = document.getElementById('seedPassword');
    const seedPasswordStep = document.getElementById('seedPasswordStep');
    const seedDisplayStep = document.getElementById('seedDisplayStep');
    const seedWordsGrid = document.getElementById('seedWordsGrid');
    
    if (seedPwd) seedPwd.value = '';
    if (seedPasswordStep) seedPasswordStep.classList.remove('hidden');
    if (seedDisplayStep) seedDisplayStep.classList.add('hidden');
    if (seedWordsGrid) seedWordsGrid.innerHTML = '';
    
    // Reset Private Key section
    const keyPwd = document.getElementById('exportKeyPassword');
    const keyPasswordStep = document.getElementById('keyPasswordStep');
    const keyDisplayStep = document.getElementById('keyDisplayStep');
    
    if (keyPwd) keyPwd.value = '';
    if (keyPasswordStep) keyPasswordStep.classList.remove('hidden');
    if (keyDisplayStep) keyDisplayStep.classList.add('hidden');
    exportedPrivateKey = null;
    
    // Reset Certificate section
    const filePwd = document.getElementById('exportFileWalletPassword');
    const diffPwd = document.getElementById('exportFilePassword');
    const diffPwdConfirm = document.getElementById('exportFilePasswordConfirm');
    const useDiffCheckbox = document.getElementById('useDifferentPassword');
    const diffFields = document.getElementById('differentPasswordFields');
    
    if (filePwd) filePwd.value = '';
    if (diffPwd) diffPwd.value = '';
    if (diffPwdConfirm) diffPwdConfirm.value = '';
    if (useDiffCheckbox) useDiffCheckbox.checked = false;
    if (diffFields) diffFields.classList.add('hidden');
}

// Función genérica para toggle de secciones de configuración
function toggleConfigSection(section) {
    const sectionMap = {
        // Seguridad
        'seedPhrase': 'seedPhraseSection',
        'privateKey': 'privateKeySection',
        'certificate': 'certificateSection',
        // Redes
        'currentNetwork': 'currentNetworkSection',
        'selectNetwork': 'selectNetworkSection',
        'configNetwork': 'configNetworkSection',
        'addNetwork': 'addNetworkSection',
        // Preferencias
        'appearance': 'appearanceSection',
        'pbkdf2': 'pbkdf2Section',
        'password': 'passwordSection'
    };
    
    const sectionEl = document.getElementById(sectionMap[section]);
    if (!sectionEl) return;
    
    const wasOpen = sectionEl.classList.contains('open');
    const parentModal = sectionEl.closest('.config-modal');
    
    // Cerrar todas las secciones del mismo modal y resetear contenido
    if (parentModal) {
        parentModal.querySelectorAll('.config-section').forEach(s => {
            if (s.classList.contains('open')) {
                s.classList.remove('open');
                // Resetear el contenido de secciones de seguridad que se cierran
                if (s.id === 'seedPhraseSection' || s.id === 'privateKeySection' || s.id === 'certificateSection') {
                    resetSectionContent(s.id);
                }
            }
        });
    }
    
    // Si no estaba abierta, abrirla
    if (!wasOpen) {
        sectionEl.classList.add('open');
        
        // Si es configNetwork, cargar los datos de la red actual
        if (section === 'configNetwork') {
            loadNetworkConfigForm();
        }
    }
}

// Compatibilidad con nombre anterior
function toggleSecuritySection(section) {
    toggleConfigSection(section);
}

function resetSectionContent(sectionId) {
    if (sectionId === 'seedPhraseSection') {
        const seedPwd = document.getElementById('seedPassword');
        const seedPasswordStep = document.getElementById('seedPasswordStep');
        const seedDisplayStep = document.getElementById('seedDisplayStep');
        const seedWordsGrid = document.getElementById('seedWordsGrid');
        
        if (seedPwd) seedPwd.value = '';
        if (seedPasswordStep) seedPasswordStep.classList.remove('hidden');
        if (seedDisplayStep) seedDisplayStep.classList.add('hidden');
        if (seedWordsGrid) seedWordsGrid.innerHTML = '';
    } else if (sectionId === 'privateKeySection') {
        const keyPwd = document.getElementById('exportKeyPassword');
        const keyPasswordStep = document.getElementById('keyPasswordStep');
        const keyDisplayStep = document.getElementById('keyDisplayStep');
        
        if (keyPwd) keyPwd.value = '';
        if (keyPasswordStep) keyPasswordStep.classList.remove('hidden');
        if (keyDisplayStep) keyDisplayStep.classList.add('hidden');
        exportedPrivateKey = null;
    } else if (sectionId === 'certificateSection') {
        // Reset Certificate section
        const filePwd = document.getElementById('exportFileWalletPassword');
        const diffPwd = document.getElementById('exportFilePassword');
        const diffPwdConfirm = document.getElementById('exportFilePasswordConfirm');
        const useDiffCheckbox = document.getElementById('useDifferentPassword');
        const diffFields = document.getElementById('differentPasswordFields');
        
        if (filePwd) filePwd.value = '';
        if (diffPwd) diffPwd.value = '';
        if (diffPwdConfirm) diffPwdConfirm.value = '';
        if (useDiffCheckbox) useDiffCheckbox.checked = false;
        if (diffFields) diffFields.classList.add('hidden');
    }
}

async function revealSeedPhrase() {
    const password = document.getElementById('seedPassword').value;
    if (!password) {
        showToast('error', t('error'), t('enterPassword'));
        return;
    }
    
    // Mostrar overlay mientras descifra
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.show('unlock', t('decryptingSeedPhrase'));
    }
    
    await new Promise(r => setTimeout(r, 100));
    
    const mnemonic = wallet.getMnemonic(password);
    
    if (typeof CryptoOverlay !== 'undefined') {
        CryptoOverlay.hide();
    }
    
    if (!mnemonic) {
        showToast('error', t('error'), t('wrongPassword'));
        document.getElementById('seedPassword').value = '';
        return;
    }
    
    // Display seed words
    const words = mnemonic.split(' ');
    const wordsHtml = words.map((word, i) => `
        <div class="seed-word">
            <span class="seed-word-index">${i + 1}</span>
            <span class="seed-word-text">${word}</span>
        </div>
    `).join('');
    
    document.getElementById('seedWordsGrid').innerHTML = wordsHtml;
    document.getElementById('seedPasswordStep').classList.add('hidden');
    document.getElementById('seedDisplayStep').classList.remove('hidden');
}

function copySeedPhrase() {
    const words = document.querySelectorAll('#seedWordsGrid .seed-word-text');
    const mnemonic = Array.from(words).map(w => w.textContent).join(' ');
    
    navigator.clipboard.writeText(mnemonic).then(() => {
        showToast('success', 'Copiado', 'Frase copiada al portapapeles');
    });
}

function goToExportSection() {
    // Cerrar sección actual
    document.getElementById('seedPhraseSection')?.classList.remove('open');
    resetSectionContent('seedPhraseSection');
    
    // Abrir sección de certificado
    document.getElementById('certificateSection')?.classList.add('open');
}

// Mantener compatibilidad con funciones anteriores
function showPrivateKeySettings() {
    showSecurityModal();
}

// ========================================
// Password Requirements Validation
// ========================================

function validatePasswordRequirements() {
    const password = document.getElementById('setupPassword').value;
    const requirements = document.getElementById('passwordRequirements');
    const confirmGroup = document.getElementById('confirmPasswordGroup');
    
    // Definir requisitos
    const checks = {
        reqLength: password.length >= 8,
        reqUppercase: /[A-Z]/.test(password),
        reqLowercase: /[a-z]/.test(password),
        reqNumber: /[0-9]/.test(password),
        reqSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    // Actualizar visual de cada requisito
    let allValid = true;
    Object.keys(checks).forEach(reqId => {
        const el = document.getElementById(reqId);
        if (el) {
            const iconEl = el.querySelector('.req-icon');
            if (checks[reqId]) {
                el.classList.add('valid');
                if (iconEl) iconEl.textContent = '✓';
            } else {
                el.classList.remove('valid');
                if (iconEl) iconEl.textContent = '○';
                allValid = false;
            }
        }
    });
    
    // Si todos son válidos, ocultar checklist y mostrar confirmar
    if (allValid) {
        requirements.classList.add('all-valid');
        if (confirmGroup) confirmGroup.classList.remove('hidden');
    } else {
        requirements.classList.remove('all-valid');
        if (confirmGroup) confirmGroup.classList.add('hidden');
    }
}

// ========================================
// Tips Carousel Functions (Legacy - Mantener compatibilidad)
// ========================================

let carouselIndex = 0;
let carouselInterval = null;

function initCarousel() {
    const carousel = document.getElementById('tipsCarousel');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    });
    
    setTimeout(() => startCarouselAutoplay(), 1000);
}

function startCarouselAutoplay() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarouselAutoplay() {
    if (carouselInterval) clearInterval(carouselInterval);
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    carouselIndex = (carouselIndex + 1) % slides.length;
    updateCarouselDisplay();
}

function prevSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    carouselIndex = (carouselIndex - 1 + slides.length) % slides.length;
    updateCarouselDisplay();
}

function goToSlide(index) {
    carouselIndex = index;
    updateCarouselDisplay();
    stopCarouselAutoplay();
    startCarouselAutoplay();
}

function updateCarouselDisplay() {
    document.querySelectorAll('.carousel-slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === carouselIndex);
    });
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === carouselIndex);
    });
}

function closeTipsCarousel() {
    const carousel = document.getElementById('tipsCarousel');
    if (carousel) {
        carousel.classList.add('hidden');
        stopCarouselAutoplay();
    }
}

// ========================================
// Account Selector UI
// ========================================

function renderAccountSelector() {
    if (typeof accountManager === 'undefined') return;
    
    const accounts = accountManager.getAllAccounts();
    const active = accountManager.getActiveAccount();
    
    if (!active || accounts.length === 0) return;
    
    const selector = document.getElementById('accountSelector');
    if (!selector) return;
    
    // Render button
    const btn = selector.querySelector('.account-selector-btn');
    if (btn) {
        btn.innerHTML = `
            <div class="account-avatar">${active.address.slice(2, 4).toUpperCase()}</div>
            <div class="account-info">
                <div class="account-label">${active.label || 'Cuenta'}</div>
                <div class="account-address-short">${active.address.slice(0, 6)}...${active.address.slice(-4)}</div>
            </div>
            <span class="account-dropdown-arrow">▼</span>
        `;
    }
    
    // Render dropdown
    const dropdown = selector.querySelector('.account-dropdown');
    if (dropdown) {
        let html = '';
        
        accounts.forEach((acc, i) => {
            const isActive = acc.address.toLowerCase() === active.address.toLowerCase();
            html += `
                <div class="account-dropdown-item ${isActive ? 'active' : ''}" 
                     data-click="selectAccount(${i})">
                    <div class="account-avatar">${acc.address.slice(2, 4).toUpperCase()}</div>
                    <div class="account-info">
                        <div class="account-label">${acc.label}</div>
                        <div class="account-address-short">${acc.address.slice(0, 6)}...${acc.address.slice(-4)}</div>
                    </div>
                    <span class="check-icon">${isActive ? '✓' : ''}</span>
                </div>
            `;
        });
        
        html += `
            <div class="account-dropdown-divider"></div>
            <div class="account-dropdown-action" data-click="openDeriveAccountModal()">
                ➕ Derivar Nueva Cuenta
            </div>
            <div class="account-dropdown-action" data-click="openImportAccountModal()">
                📥 Importar Cuenta
            </div>
        `;
        
        dropdown.innerHTML = html;
    }
}

function toggleAccountDropdown() {
    const dropdown = document.querySelector('.account-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

function closeAccountDropdown() {
    const dropdown = document.querySelector('.account-dropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

async function selectAccount(index) {
    if (typeof accountManager === 'undefined') return;
    
    const oldAccount = accountManager.getActiveAccount();
    const newAccount = accountManager.setActiveAccount(index);
    
    if (newAccount && newAccount.address !== oldAccount?.address) {
        // Actualizar UI
        wallet.address = newAccount.address;
        localStorage.setItem(CONFIG.storage.address, newAccount.address);
        
        renderAccountSelector();
        closeAccountDropdown();
        
        // Actualizar balances
        await updateAllBalances();
        updateAddressDisplay();
        
        // Notificar al background para dApps conectadas
        try {
            await chrome.runtime.sendMessage({
                type: 'ACCOUNT_CHANGED',
                payload: { 
                    oldAddress: oldAccount?.address,
                    newAddress: newAccount.address 
                }
            });
            console.log('🔄 Account changed notification sent');
        } catch (e) {
            console.error('Error notifying account change:', e);
        }
        
        showToast('success', 'Cuenta cambiada', newAccount.label);
    }
    
    closeAccountDropdown();
}

function openDeriveAccountModal() {
    closeAccountDropdown();
    // Por ahora mostrar mensaje, implementar modal después
    showToast('info', 'Derivar cuenta', 'Próximamente disponible');
}

function openImportAccountModal() {
    closeAccountDropdown();
    // Por ahora mostrar mensaje, implementar modal después
    showToast('info', 'Importar cuenta', 'Próximamente disponible');
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    const selector = document.getElementById('accountSelector');
    if (selector && !selector.contains(e.target)) {
        closeAccountDropdown();
    }
});

// Inicializar carrusel cuando se abre setupModal
document.addEventListener('DOMContentLoaded', () => {
    // Observar cuando setupModal se hace visible
    const setupModal = document.getElementById('setupModal');
    if (setupModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (setupModal.classList.contains('active')) {
                        initCarousel();
                    }
                }
            });
        });
        observer.observe(setupModal, { attributes: true });
    }
});

// ========================================
// Export Password Fields Toggle
// ========================================

function toggleExportPasswordFields() {
    const checkbox = document.getElementById('useDifferentPassword');
    const fields = document.getElementById('differentPasswordFields');
    
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.classList.remove('hidden');
        } else {
            fields.classList.add('hidden');
        }
    }
}
