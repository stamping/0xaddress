// ============================================
// 0xAddress - Otros Contratos y Métodos
// ============================================

// Storage key
const OTHER_CONTRACTS_KEY = 'oxaddress_other_contracts';

// Estado
let otherContracts = [];
let currentOtherContract = null;
let currentMethodsContract = null;
let eventListener = null;

// ========================================
// Inicialización
// ========================================

function loadOtherContracts() {
    try {
        const saved = localStorage.getItem(OTHER_CONTRACTS_KEY);
        otherContracts = saved ? JSON.parse(saved) : [];
        updateOthersCount();
        renderOthersList();
    } catch (e) {
        console.error('Error loading other contracts:', e);
        otherContracts = [];
    }
}

function saveOtherContracts() {
    try {
        localStorage.setItem(OTHER_CONTRACTS_KEY, JSON.stringify(otherContracts));
        updateOthersCount();
    } catch (e) {
        console.error('Error saving other contracts:', e);
    }
}

function updateOthersCount() {
    const countEl = document.getElementById('othersCount');
    if (countEl) {
        countEl.textContent = otherContracts.length;
    }
}

// ========================================
// Renderizar Lista
// ========================================

function renderOthersList() {
    const container = document.getElementById('othersList');
    if (!container) return;
    
    const currentNetwork = NetworkManager.getCurrentNetwork();
    const currentChainId = currentNetwork.chainId;
    
    // Filtrar por red actual
    const filteredContracts = otherContracts.filter(c => 
        c.chainId === currentChainId || !c.chainId
    );

    if (filteredContracts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📄</span>
                <p>${t('noContractsIn')} ${currentNetwork.name}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredContracts.map((contract) => {
        const index = otherContracts.indexOf(contract);
        return `
        <div class="other-contract-item" data-click="openOtherContractDetail(${index})">
            <div class="icon">📄</div>
            <div class="info">
                <div class="name">${escapeHtml(contract.name || 'Contrato')}</div>
                <div class="address">${contract.address.slice(0, 8)}...${contract.address.slice(-6)}</div>
            </div>
            <span class="badge">${escapeHtml(contract.label || 'CUSTOM')}</span>
        </div>
    `}).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Agregar Contrato
// ========================================

async function addOtherContract(address, label, abiUrl) {
    try {
        if (!ethers.isAddress(address)) {
            throw new Error('Dirección inválida');
        }
        
        const currentNetwork = NetworkManager.getCurrentNetwork();
        const chainId = currentNetwork.chainId;

        const exists = otherContracts.find(c => 
            c.address.toLowerCase() === address.toLowerCase() &&
            (c.chainId === chainId || !c.chainId)
        );
        if (exists) {
            throw new Error('Este contrato ya está agregado en esta red');
        }

        const contractData = {
            address: address.toLowerCase(),
            label: (label || 'CUSTOM').toUpperCase().slice(0, 10),
            abiUrl: abiUrl || null,
            abi: null,
            name: null,
            hasOwner: false,
            hasBalance: false,
            addedAt: Date.now(),
            chainId: chainId
        };

        if (abiUrl) {
            try {
                contractData.abi = await fetchABI(abiUrl);
            } catch (e) {
                console.warn('Could not fetch ABI:', e);
            }
        }

        const provider = new ethers.JsonRpcProvider(currentNetwork.rpcUrl);
        
        try {
            const nameContract = new ethers.Contract(address, ['function name() view returns (string)'], provider);
            contractData.name = await nameContract.name();
        } catch (e) {
            contractData.name = `Contrato ${label || ''}`.trim();
        }

        try {
            const ownerContract = new ethers.Contract(address, ['function owner() view returns (address)'], provider);
            const owner = await ownerContract.owner();
            contractData.hasOwner = true;
            contractData.owner = owner;
        } catch (e) {
            contractData.hasOwner = false;
        }

        otherContracts.push(contractData);
        saveOtherContracts();
        renderOthersList();

        return contractData;
    } catch (error) {
        throw error;
    }
}

async function fetchABI(url) {
    if (url.startsWith('ipfs://')) {
        url = `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch ABI');
    
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data.abi) return data.abi;
    
    throw new Error('Invalid ABI format');
}

// ========================================
// Detalle de Contrato Otro
// ========================================

async function openOtherContractDetail(index) {
    currentOtherContract = otherContracts[index];
    if (!currentOtherContract) return;

    document.getElementById('otherContractName').textContent = currentOtherContract.name || 'Contrato';
    document.getElementById('otherContractLabel').textContent = currentOtherContract.label || 'CUSTOM';
    document.getElementById('otherContractAddress').textContent = 
        currentOtherContract.address.slice(0, 10) + '...' + currentOtherContract.address.slice(-8);
    
    const ownerRow = document.getElementById('otherContractOwnerRow');
    if (currentOtherContract.hasOwner && currentOtherContract.owner) {
        ownerRow.style.display = 'flex';
        document.getElementById('otherContractOwner').textContent = 
            currentOtherContract.owner.slice(0, 8) + '...' + currentOtherContract.owner.slice(-6);
        
        const isOwner = currentOtherContract.owner.toLowerCase() === wallet.address.toLowerCase();
        const badge = document.getElementById('otherContractIsOwner');
        badge.textContent = isOwner ? 'TÚ' : '';
        badge.className = isOwner ? 'badge owner' : 'badge';
    } else {
        ownerRow.style.display = 'none';
    }
    
    const balanceRow = document.getElementById('otherContractBalanceRow');
    balanceRow.style.display = 'none';
    
    openModal('otherContractDetailModal');
}

function removeOtherContract() {
    if (!currentOtherContract) return;
    
    const index = otherContracts.findIndex(c => c.address === currentOtherContract.address);
    if (index > -1) {
        otherContracts.splice(index, 1);
        saveOtherContracts();
        renderOthersList();
        closeModal('otherContractDetailModal');
    }
}

function viewOtherInExplorer() {
    if (!currentOtherContract) return;
    window.open(`${NETWORK.explorerUrl}/address/${currentOtherContract.address}`, '_blank');
}

function openContractMethodsForOther() {
    if (!currentOtherContract) return;
    closeModal('otherContractDetailModal');
    openContractMethodsModal(currentOtherContract.address, currentOtherContract.label, currentOtherContract.abi);
}

// ========================================
// Modal de Métodos (ERC20, ERC721, OTROS)
// ========================================

function openContractMethods() {
    if (!currentTokenDetail) return;
    closeModal('tokenDetailModal');
    openContractMethodsModal(
        currentTokenDetail.contract.address, 
        'ERC20',
        ERC20_ABI
    );
}

function openNFTContractMethods() {
    if (!currentNFTDetail) return;
    const contractAddress = currentNFTDetail.contract.address;
    closeModal('nftDetailModal');
    openContractMethodsModal(contractAddress, 'ERC721', ERC721_ABI);
}

function openContractMethodsModal(address, type, customAbi = null) {
    currentMethodsContract = {
        address,
        type,
        abi: customAbi || getStandardABI(type)
    };
    
    document.getElementById('methodsContractType').textContent = type;
    document.getElementById('methodsContractAddress').textContent = 
        address.slice(0, 8) + '...' + address.slice(-6);
    
    loadContractMethods();
    switchMethodsTab('read');
    
    openModal('contractMethodsModal');
}

function getStandardABI(type) {
    if (type === 'ERC20' && typeof ERC20_ABI !== 'undefined') return ERC20_ABI;
    if (type === 'ERC721' && typeof ERC721_ABI !== 'undefined') return ERC721_ABI;
    return [];
}

function loadContractMethods() {
    const readList = document.getElementById('readMethodsList');
    const writeList = document.getElementById('writeMethodsList');
    const eventsList = document.getElementById('eventsList');
    
    if (!currentMethodsContract?.abi?.length) {
        readList.innerHTML = '<p class="empty-text">No hay ABI</p>';
        writeList.innerHTML = '<p class="empty-text">No hay ABI</p>';
        eventsList.innerHTML = '<p class="empty-text">No hay eventos</p>';
        return;
    }

    const abi = currentMethodsContract.abi;
    
    const readMethods = abi.filter(item => 
        item.type === 'function' && 
        (item.stateMutability === 'view' || item.stateMutability === 'pure')
    );
    
    const writeMethods = abi.filter(item => 
        item.type === 'function' && 
        item.stateMutability !== 'view' && 
        item.stateMutability !== 'pure'
    );
    
    const events = abi.filter(item => item.type === 'event');
    
    readList.innerHTML = readMethods.length ? 
        readMethods.map((m, i) => renderMethodItem(m, 'read', i)).join('') :
        '<p class="empty-text">No hay métodos de lectura</p>';
        
    writeList.innerHTML = writeMethods.length ?
        writeMethods.map((m, i) => renderMethodItem(m, 'write', i)).join('') :
        '<p class="empty-text">No hay métodos de escritura</p>';
    
    eventsList.innerHTML = events.length ?
        events.map(e => `<div class="event-name-item">📡 ${e.name}</div>`).join('') :
        '<p class="empty-text">No hay eventos</p>';
    
    currentMethodsContract.events = events;
}

function renderMethodItem(method, type, index) {
    const inputs = method.inputs || [];
    const methodId = `m_${type}_${index}`;
    
    const inputsHtml = inputs.map((input, i) => `
        <div class="method-input-row">
            <label>${input.name || `arg${i}`}</label>
            <input type="text" id="${methodId}_i${i}" placeholder="${input.type}">
        </div>
    `).join('');
    
    return `
        <div class="method-card" id="${methodId}">
            <div class="method-card-header" data-click="toggleMethod('${methodId}')">
                <span class="method-fn">${method.name}()</span>
                <span class="method-badge">${type === 'read' ? 'view' : 'write'}</span>
            </div>
            <div class="method-card-body">
                ${inputs.length ? `<div class="method-params">${inputsHtml}</div>` : ''}
                <button class="btn-primary btn-sm" id="${methodId}_btn" data-click="runMethod('${method.name}', '${type}', '${methodId}', ${inputs.length})">
                    ${type === 'read' ? '📖 Leer' : '✏️ Ejecutar'}
                </button>
                <div class="method-output" id="${methodId}_out"></div>
            </div>
        </div>
    `;
}

function toggleMethod(methodId) {
    document.getElementById(methodId)?.classList.toggle('open');
}

function switchMethodsTab(tabName) {
    document.querySelectorAll('.methods-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.methods-tab-content').forEach(t => t.classList.remove('active'));
    
    document.querySelector(`.methods-tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`${tabName}MethodsTab`)?.classList.add('active');
}

// ========================================
// Ejecutar Método
// ========================================

async function runMethod(methodName, type, methodId, inputCount) {
    if (!currentMethodsContract) return;
    
    const btn = document.getElementById(`${methodId}_btn`);
    const output = document.getElementById(`${methodId}_out`);
    
    const params = [];
    for (let i = 0; i < inputCount; i++) {
        const inp = document.getElementById(`${methodId}_i${i}`);
        params.push(inp?.value?.trim() || '');
    }
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳...';
    btn.disabled = true;
    output.innerHTML = '';
    output.className = 'method-output';
    
    try {
        const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrl);
        let result;
        
        if (type === 'read') {
            const contract = new ethers.Contract(currentMethodsContract.address, currentMethodsContract.abi, provider);
            result = await contract[methodName](...params);
        } else {
            const password = prompt('Contraseña:');
            if (!password || !wallet.verifyPassword(password)) {
                throw new Error('Contraseña incorrecta');
            }
            
            const privateKey = wallet.getPrivateKey(password);
            const signer = new ethers.Wallet(privateKey, provider);
            const contract = new ethers.Contract(currentMethodsContract.address, currentMethodsContract.abi, signer);
            
            output.innerHTML = '📤 Enviando TX...';
            const tx = await contract[methodName](...params);
            output.innerHTML = `📤 TX: ${tx.hash.slice(0, 14)}...\n⏳ Esperando...`;
            
            const receipt = await tx.wait();
            result = `✅ Bloque: ${receipt.blockNumber}`;
        }
        
        // Formatear resultado
        if (typeof result === 'bigint') {
            result = result.toString();
        } else if (typeof result === 'object' && result !== null) {
            result = JSON.stringify(result, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2);
        }
        
        output.innerHTML = result;
        output.classList.add('success');
        
    } catch (error) {
        output.innerHTML = `❌ ${error.message || error}`;
        output.classList.add('error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ========================================
// Event Listening
// ========================================

function startEventListening() {
    if (!currentMethodsContract?.events?.length) {
        showToast('info', 'Info', 'No hay eventos');
        return;
    }
    
    try {
        const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrl);
        const contract = new ethers.Contract(currentMethodsContract.address, currentMethodsContract.abi, provider);
        
        currentMethodsContract.events.forEach(event => {
            contract.on(event.name, (...args) => addEventLog(event.name, args));
        });
        
        eventListener = contract;
        
        document.getElementById('startListeningBtn').style.display = 'none';
        document.getElementById('stopListeningBtn').style.display = 'inline-flex';
    } catch (e) {
        console.error('Event error:', e);
    }
}

function stopEventListening() {
    if (eventListener) {
        eventListener.removeAllListeners();
        eventListener = null;
    }
    document.getElementById('startListeningBtn').style.display = 'inline-flex';
    document.getElementById('stopListeningBtn').style.display = 'none';
}

function addEventLog(eventName, args) {
    const container = document.getElementById('eventLogsList');
    const empty = container.querySelector('.empty-text');
    if (empty) empty.remove();
    
    const logItem = document.createElement('div');
    logItem.className = 'event-log-item';
    logItem.innerHTML = `
        <strong>${eventName}</strong> <span class="time">${new Date().toLocaleTimeString()}</span>
        <div class="data">${JSON.stringify(args.slice(0, -1), (k, v) => typeof v === 'bigint' ? v.toString() : v)}</div>
    `;
    container.insertBefore(logItem, container.firstChild);
}

function clearEventLogs() {
    document.getElementById('eventLogsList').innerHTML = '<p class="empty-text">Sin eventos</p>';
}

function refreshOthers() {
    renderOthersList();
}

document.addEventListener('DOMContentLoaded', () => setTimeout(loadOtherContracts, 500));
