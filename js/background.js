// ============================================
// 0xAddress - Background Service Worker
// Session persistente + Popup automático
// ============================================

// Estado global
let walletState = {
  isLocked: true,
  address: null,
  chainId: '0x23a', // Default: Rollux
  connectedSites: {},
  // Sesión persistente
  sessionKey: null,  // Llave privada en memoria
  sessionExpiry: null // Expira en 5 horas
};

const SESSION_DURATION = 5 * 60 * 60 * 1000; // 5 horas en ms

// Solicitudes pendientes
const pendingRequests = new Map();
let requestCounter = 0;
let popupWindowId = null;
let stateLoaded = false;

// ========================================
// Inicialización
// ========================================
chrome.runtime.onInstalled.addListener(() => {
  console.log('🚀 0xAddress installed');
  loadState();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 0xAddress started');
  loadState();
});

// Cargar estado inmediatamente al cargar el script
loadState();

async function loadState() {
  if (stateLoaded) return;
  
  try {
    const data = await chrome.storage.local.get([
      '0xaddress_address',
      '0xaddress_network',
      '0xaddress_chainId',
      '0xaddress_connected_sites',
      '0xaddress_encrypted_key',
      '0xaddress_session_key',
      '0xaddress_session_expiry'
    ]);
    
    walletState.address = data['0xaddress_address'] || null;
    
    // Priorizar chainId guardado directamente, si no usar el de network
    if (data['0xaddress_chainId']) {
      walletState.chainId = data['0xaddress_chainId'];
    } else {
      walletState.chainId = getChainIdHex(data['0xaddress_network'] || 'rollux');
    }
    
    walletState.connectedSites = data['0xaddress_connected_sites'] || {};
    
    // Restaurar sesión si no ha expirado
    const sessionExpiry = data['0xaddress_session_expiry'];
    if (sessionExpiry && Date.now() < sessionExpiry && data['0xaddress_session_key']) {
      walletState.sessionKey = data['0xaddress_session_key'];
      walletState.sessionExpiry = sessionExpiry;
      walletState.isLocked = false;
      console.log('🔓 Session restored, expires in', Math.round((sessionExpiry - Date.now()) / 60000), 'minutes');
    } else {
      walletState.isLocked = true;
      // Limpiar sesión expirada
      await chrome.storage.local.remove(['0xaddress_session_key', '0xaddress_session_expiry']);
    }
    
    stateLoaded = true;
    console.log('📦 State loaded:', { 
      address: walletState.address?.slice(0, 10),
      chainId: walletState.chainId,
      isLocked: walletState.isLocked,
      connectedSites: Object.keys(walletState.connectedSites).length
    });
  } catch (e) {
    console.error('Error loading state:', e);
    stateLoaded = true;
  }
}

// ========================================
// Manejo de mensajes
// ========================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch(error => {
      const errorMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('❌ Error:', errorMsg, error);
      sendResponse({ error: { code: -32603, message: errorMsg } });
    });
  return true;
});

async function handleMessage(message, sender) {
  const { type, payload } = message;
  
  switch (type) {
    case 'GET_STATE':
      return getPublicState(sender.tab?.url);

    case 'RPC_REQUEST':
      return handleRpcRequest(payload, sender);

    case 'POPUP_UNLOCK':
      return handleUnlock(payload);

    case 'POPUP_LOCK':
      return handleLock();

    case 'POPUP_GET_STATE':
      return getPopupState();

    case 'POPUP_GET_PENDING':
      return getPendingRequests();

    case 'POPUP_APPROVE_REQUEST':
      return approveRequest(payload);

    case 'POPUP_REJECT_REQUEST':
      return rejectRequest(payload);

    case 'POPUP_UPDATE_NETWORK':
      return updateNetwork(payload);

    case 'POPUP_DISCONNECT_SITE':
      return disconnectSite(payload);

    case 'POPUP_GET_SESSION':
      return getSession();

    case 'POPUP_SAVE_SESSION':
      return saveSession(payload);

    case 'ACCOUNT_CHANGED':
      return handleAccountChanged(payload);

    case 'POPUP_RESET':
      return handleReset();

    default:
      return { error: 'Unknown message type' };
  }
}

// ========================================
// Sesión persistente
// ========================================
async function handleUnlock(payload) {
  const { address, privateKey, expiryTimestamp } = payload;
  
  walletState.isLocked = false;
  walletState.address = address;
  
  // Guardar sesión con el tiempo configurado por el usuario
  if (privateKey) {
    walletState.sessionKey = privateKey;
    // Usar el timestamp del popup o calcular uno por defecto (1 hora)
    walletState.sessionExpiry = expiryTimestamp || (Date.now() + 60 * 60 * 1000);
    
    await chrome.storage.local.set({
      '0xaddress_session_key': privateKey,
      '0xaddress_session_expiry': walletState.sessionExpiry
    });
    
    console.log('🔓 Session created, expires in 5 hours');
  }
  
  broadcastStateChange();
  return { success: true };
}

async function handleLock() {
  walletState.isLocked = true;
  walletState.sessionKey = null;
  walletState.sessionExpiry = null;
  
  await chrome.storage.local.remove(['0xaddress_session_key', '0xaddress_session_expiry']);
  
  console.log('🔒 Wallet locked, session cleared');
  broadcastStateChange();
  return { success: true };
}

async function handleReset() {
  // Limpiar TODO el estado
  walletState.isLocked = true;
  walletState.address = null;
  walletState.sessionKey = null;
  walletState.sessionExpiry = null;
  walletState.connectedSites = {};
  
  // Limpiar chrome.storage.local
  await chrome.storage.local.remove([
    '0xaddress_address',
    '0xaddress_session_key',
    '0xaddress_session_expiry',
    '0xaddress_connected_sites',
    '0xaddress_encrypted_key'
  ]);
  
  console.log('🗑️ Wallet RESET - all data cleared from background');
  
  // Notificar a todas las tabs que la wallet fue reseteada
  broadcastStateChange();
  
  return { success: true };
}

function getSession() {
  // Verificar si la sesión sigue válida
  if (walletState.sessionKey && walletState.sessionExpiry && Date.now() < walletState.sessionExpiry) {
    return {
      hasSession: true,
      privateKey: walletState.sessionKey,
      expiresIn: Math.round((walletState.sessionExpiry - Date.now()) / 60000) // minutos
    };
  }
  return { hasSession: false };
}

async function saveSession(payload) {
  const { privateKey } = payload;
  if (privateKey) {
    walletState.sessionKey = privateKey;
    walletState.sessionExpiry = Date.now() + SESSION_DURATION;
    
    await chrome.storage.local.set({
      '0xaddress_session_key': privateKey,
      '0xaddress_session_expiry': walletState.sessionExpiry
    });
    
    return { success: true };
  }
  return { success: false };
}

async function handleAccountChanged(payload) {
  const { oldAddress, newAddress } = payload;
  
  // Actualizar dirección en walletState
  walletState.address = newAddress;
  
  // Guardar nueva dirección
  await chrome.storage.local.set({ '0xaddress_address': newAddress });
  
  // Notificar a todas las páginas conectadas
  broadcastEvent('accountsChanged', [newAddress]);
  
  console.log('🔄 Account changed from', oldAddress?.slice(0, 8), 'to', newAddress?.slice(0, 8));
  
  return { success: true };
}

// ========================================
// Estado
// ========================================
function getPopupState() {
  return {
    isLocked: walletState.isLocked,
    address: walletState.address,
    chainId: walletState.chainId,
    connectedSites: walletState.connectedSites,
    pendingCount: pendingRequests.size,
    hasSession: !!(walletState.sessionKey && walletState.sessionExpiry && Date.now() < walletState.sessionExpiry)
  };
}

function getPublicState(url) {
  let origin = null;
  try {
    origin = url ? new URL(url).origin : null;
  } catch (e) {}
  
  const isConnected = origin && walletState.connectedSites[origin];
  
  return {
    chainId: walletState.chainId,
    selectedAddress: (!walletState.isLocked && isConnected) ? walletState.address : null,
    isConnected: !walletState.isLocked && !!isConnected
  };
}

function getPendingRequests() {
  const requests = [];
  pendingRequests.forEach((req, id) => {
    requests.push({
      id,
      method: req.method,
      params: req.params,
      origin: req.origin,
      favicon: req.favicon,
      title: req.title,
      timestamp: req.timestamp,
      networkParams: req.networkParams // Incluir params de red para switch/add
    });
  });
  return { requests };
}

// ========================================
// Manejo de RPC
// ========================================
async function handleRpcRequest(payload, sender) {
  const { id: inpageRequestId, method, params, origin, favicon, title } = payload;
  const tabId = sender?.tab?.id;

  console.log('🔗 RPC:', method, 'from', origin, 'tabId:', tabId, 'inpageId:', inpageRequestId);

  const publicMethods = [
    'eth_chainId', 'net_version', 'eth_blockNumber',
    'eth_getBlockByNumber', 'eth_getBlockByHash',
    'eth_getTransactionByHash', 'eth_getTransactionReceipt',
    'eth_call', 'eth_estimateGas', 'eth_gasPrice',
    'eth_getBalance', 'eth_getCode', 'eth_getStorageAt',
    'eth_getTransactionCount', 'eth_getLogs'
  ];

  try {
    if (publicMethods.includes(method)) {
      return { result: await handlePublicMethod(method, params) };
    }

    if (method === 'eth_accounts') {
      if (!walletState.isLocked && walletState.connectedSites[origin] && walletState.address) {
        return { result: [walletState.address] };
      }
      return { result: [] };
    }

    if (method === 'eth_requestAccounts') {
      if (!walletState.isLocked && walletState.connectedSites[origin]) {
        return { result: [walletState.address] };
      }
      
      // Evitar solicitudes duplicadas del mismo origen
      const existingRequest = Array.from(pendingRequests.values()).find(
        req => req.method === 'eth_requestAccounts' && req.origin === origin
      );
      
      if (existingRequest) {
        console.log('⏳ eth_requestAccounts already pending for:', origin);
        // Devolver pending para esta también
        return { pending: true };
      }
      
      return createPendingRequest({ method, params, origin, favicon, title }, tabId, inpageRequestId);
    }

    if (['personal_sign', 'eth_sign', 'eth_signTypedData', 'eth_signTypedData_v4', 'eth_sendTransaction'].includes(method)) {
      if (!walletState.connectedSites[origin]) {
        return { error: { code: 4100, message: 'Not connected. Call eth_requestAccounts first.' } };
      }
      return createPendingRequest({ method, params, origin, favicon, title }, tabId, inpageRequestId);
    }

    if (method === 'wallet_switchEthereumChain') {
      const chainId = params[0]?.chainId;
      if (!chainId) {
        return { error: { code: -32602, message: 'Invalid params: chainId required' } };
      }
      
      const chainIdDecimal = parseInt(chainId, 16);
      
      // Buscar info de la red
      let networkId = findNetworkByChainId(chainIdDecimal);
      if (!networkId) {
        networkId = await findNetworkByChainIdAsync(chainIdDecimal);
      }
      
      // Si la red no existe, devolver error 4902
      if (!networkId) {
        return { error: { code: 4902, message: 'Unrecognized chain ID. Try adding the chain using wallet_addEthereumChain first.' } };
      }
      
      // Siempre pedir confirmación al usuario para cambiar de red
      return createPendingRequest({ 
        method, 
        params, 
        origin, 
        favicon, 
        title,
        networkParams: {
          chainId: chainIdDecimal,
          chainIdHex: chainId,
          networkId: networkId,
          name: getNetworkName(networkId) || `Chain ${chainIdDecimal}`
        }
      }, tabId, inpageRequestId);
    }

    if (method === 'wallet_addEthereumChain') {
      const chainParams = params[0];
      
      if (!chainParams || !chainParams.chainId) {
        return { error: { code: -32602, message: 'Invalid params: chainId required' } };
      }
      
      const chainIdDecimal = parseInt(chainParams.chainId, 16);
      
      // Verificar si la red ya existe
      let existingNetworkId = findNetworkByChainId(chainIdDecimal);
      if (!existingNetworkId) {
        existingNetworkId = await findNetworkByChainIdAsync(chainIdDecimal);
      }
      
      // Validar parámetros requeridos para nueva red
      if (!existingNetworkId && (!chainParams.chainName || !chainParams.rpcUrls || !chainParams.rpcUrls[0])) {
        return { error: { code: -32602, message: 'Invalid params: chainName and rpcUrls required' } };
      }
      
      // Siempre pedir confirmación al usuario
      return createPendingRequest({ 
        method, 
        params, 
        origin, 
        favicon, 
        title,
        networkParams: {
          chainId: chainIdDecimal,
          chainIdHex: chainParams.chainId,
          name: chainParams.chainName || getNetworkName(existingNetworkId) || `Chain ${chainIdDecimal}`,
          rpcUrl: chainParams.rpcUrls?.[0] || '',
          explorer: chainParams.blockExplorerUrls?.[0] || '',
          currency: {
            name: chainParams.nativeCurrency?.name || 'ETH',
            symbol: chainParams.nativeCurrency?.symbol || 'ETH',
            decimals: chainParams.nativeCurrency?.decimals || 18
          },
          isExisting: !!existingNetworkId,
          existingNetworkId: existingNetworkId
        }
      }, tabId, inpageRequestId);
    }

    return { error: { code: -32601, message: `Method not supported: ${method}` } };
    
  } catch (error) {
    return { error: { code: -32603, message: error.message } };
  }
}

async function handlePublicMethod(method, params) {
  if (method === 'eth_chainId') return walletState.chainId;
  if (method === 'net_version') return parseInt(walletState.chainId, 16).toString();

  const rpcUrl = getRpcUrl();
  const chainIdDecimal = parseInt(walletState.chainId, 16);
  console.log('🌐 RPC call:', method);
  console.log('   URL:', rpcUrl);
  console.log('   ChainId:', walletState.chainId, '(' + chainIdDecimal + ')');
  console.log('   Params:', JSON.stringify(params).slice(0, 200));
  
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const data = await response.json();
  
  console.log('🌐 RPC response:', method);
  console.log('   Result:', JSON.stringify(data.result).slice(0, 100));
  if (data.error) console.log('   Error:', data.error);
  
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// ========================================
// Solicitudes Pendientes
// ========================================
function createPendingRequest(request, tabId, inpageRequestId) {
  const reqId = `req_${++requestCounter}_${Date.now()}`;
  
  pendingRequests.set(reqId, {
    ...request,
    timestamp: Date.now(),
    tabId: tabId,
    inpageRequestId: inpageRequestId
  });

  console.log('📋 Pending request:', reqId, request.method, 'tabId:', tabId, 'inpageId:', inpageRequestId);
  console.log('📋 Total pending:', pendingRequests.size);

  // Abrir popup automáticamente
  openPopupForApproval();
  
  // Devolver un objeto especial que indica "pendiente"
  return { pending: true, requestId: reqId };
}

async function openPopupForApproval() {
  try {
    // Actualizar badge
    const pendingCount = pendingRequests.size;
    await chrome.action.setBadgeText({ text: pendingCount.toString() });
    await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    
    // Si ya hay un popup abierto, enfocar
    if (popupWindowId !== null) {
      try {
        await chrome.windows.update(popupWindowId, { focused: true });
        console.log('📱 Focused existing popup');
        return;
      } catch (e) {
        popupWindowId = null;
      }
    }

    // Obtener la ventana actual para posicionar
    let left = 100;
    let top = 100;
    
    try {
      const currentWindow = await chrome.windows.getCurrent();
      // Posicionar en esquina superior derecha de la ventana actual
      left = Math.max(0, currentWindow.left + currentWindow.width - 375);
      top = Math.max(0, currentWindow.top);
    } catch (e) {
      // Usar valores por defecto si falla
    }

    // Crear ventana popup (como MetaMask)
    const popup = await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html?pending=true'),
      type: 'popup',
      width: 375,
      height: 625,
      left: left,
      top: top,
      focused: true
    });

    popupWindowId = popup.id;
    console.log('📱 Popup window opened:', popup.id);

    // Limpiar cuando se cierre
    chrome.windows.onRemoved.addListener(function onClosed(windowId) {
      if (windowId === popupWindowId) {
        popupWindowId = null;
        updateBadge();
        chrome.windows.onRemoved.removeListener(onClosed);
      }
    });

  } catch (e) {
    console.error('Failed to open popup:', e);
  }
}

function getActionName(method) {
  switch (method) {
    case 'eth_requestAccounts': return 'conectar';
    case 'personal_sign': 
    case 'eth_sign': return 'firmar un mensaje';
    case 'eth_signTypedData':
    case 'eth_signTypedData_v4': return 'firmar datos';
    case 'eth_sendTransaction': return 'enviar una transacción';
    default: return 'una acción';
  }
}

async function approveRequest(payload) {
  const { requestId, result } = payload;
  
  const request = pendingRequests.get(requestId);
  
  if (!request) {
    console.error('❌ Request not found:', requestId);
    return { error: 'Request not found' };
  }

  console.log('✅ Approving:', requestId, request.method);

  let responseResult = null;
  let responseError = null;

  try {
    if (request.method === 'eth_requestAccounts') {
      walletState.connectedSites[request.origin] = {
        name: request.title,
        favicon: request.favicon,
        connectedAt: Date.now()
      };
      await chrome.storage.local.set({ 
        '0xaddress_connected_sites': walletState.connectedSites 
      });
      responseResult = [walletState.address];
    } else if (request.method === 'wallet_switchEthereumChain') {
      // Cambiar de red
      const networkParams = request.networkParams;
      console.log('🔄 Switch network params:', networkParams);
      
      if (networkParams && networkParams.networkId) {
        // Actualizar estado
        walletState.chainId = networkParams.chainIdHex;
        
        // Guardar en storage
        await chrome.storage.local.set({ 
          '0xaddress_network': networkParams.networkId,
          '0xaddress_chainId': networkParams.chainIdHex
        });
        
        console.log('🔄 Switched to network:', networkParams.networkId, networkParams.chainIdHex);
        
        // Broadcast a todas las tabs
        broadcastEvent('chainChanged', networkParams.chainIdHex);
        broadcastStateChange();
      } else {
        console.error('❌ Missing networkParams for switch');
      }
      
      responseResult = null;
    } else if (request.method === 'wallet_addEthereumChain') {
      const networkParams = request.networkParams;
      if (networkParams) {
        // Si la red ya existe, solo cambiar a ella
        if (networkParams.isExisting && networkParams.existingNetworkId) {
          walletState.chainId = networkParams.chainIdHex;
          await chrome.storage.local.set({ 
            '0xaddress_network': networkParams.existingNetworkId,
            '0xaddress_chainId': networkParams.chainIdHex
          });
          console.log('🔄 Switched to existing network:', networkParams.existingNetworkId);
        } else {
          // Guardar la nueva red en storage
          const customNetworks = await getCustomNetworks();
          const networkId = `custom_${networkParams.chainId}`;
          
          customNetworks[networkId] = {
            name: networkParams.name,
            chainId: networkParams.chainId,
            rpcUrl: networkParams.rpcUrl,
            explorer: networkParams.explorer || '',
            currency: networkParams.currency || { symbol: 'ETH', decimals: 18 },
            isCustom: true
          };
          
          await chrome.storage.local.set({
            '0xaddress_custom_networks': customNetworks,
            '0xaddress_network': networkId,
            '0xaddress_chainId': networkParams.chainIdHex
          });
          
          walletState.chainId = networkParams.chainIdHex;
          console.log('🌐 Network added:', networkParams.name);
        }
        
        broadcastEvent('chainChanged', networkParams.chainIdHex);
      }
      responseResult = null;
    } else {
      responseResult = result;
    }
  } catch (error) {
    console.error('❌ Error in approveRequest:', error);
    responseError = { code: -32603, message: error.message };
  }

  // Enviar respuesta al content-script de la tab
  if (request.tabId && request.inpageRequestId !== undefined) {
    try {
      await chrome.tabs.sendMessage(request.tabId, {
        type: 'OXADDRESS_ASYNC_RESPONSE',
        payload: {
          id: request.inpageRequestId,
          result: responseResult,
          error: responseError
        }
      });
    } catch (e) {
      console.error('❌ Failed to send async response:', e);
    }
  }

  pendingRequests.delete(requestId);
  
  // Actualizar badge
  updateBadge();
  
  return { success: true };
}

async function getCustomNetworks() {
  const data = await chrome.storage.local.get('0xaddress_custom_networks');
  return data['0xaddress_custom_networks'] || {};
}

async function rejectRequest(payload) {
  const { requestId } = payload;
  const request = pendingRequests.get(requestId);
  
  if (request) {
    console.log('❌ Rejecting:', requestId);
    
    // Enviar respuesta de error al content-script de la tab
    if (request.tabId && request.inpageRequestId !== undefined) {
      try {
        await chrome.tabs.sendMessage(request.tabId, {
          type: 'OXADDRESS_ASYNC_RESPONSE',
          payload: {
            id: request.inpageRequestId,
            result: null,
            error: { code: 4001, message: 'User rejected the request' }
          }
        });
      } catch (e) {
        console.error('❌ Failed to send rejection:', e);
      }
    }
    
    pendingRequests.delete(requestId);
  }
  
  // Actualizar badge
  updateBadge();
  
  return { success: true };
}

async function updateBadge() {
  const count = pendingRequests.size;
  if (count > 0) {
    await chrome.action.setBadgeText({ text: count.toString() });
    await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

// ========================================
// Network & Sites
// ========================================
async function updateNetwork(payload) {
  if (payload.chainId) {
    walletState.chainId = payload.chainId;
  } else if (payload.networkId) {
    walletState.chainId = getChainIdHex(payload.networkId);
    await chrome.storage.local.set({ '0xaddress_network': payload.networkId });
  }
  broadcastEvent('chainChanged', walletState.chainId);
  return { success: true };
}

async function disconnectSite(payload) {
  delete walletState.connectedSites[payload.origin];
  await chrome.storage.local.set({ 
    '0xaddress_connected_sites': walletState.connectedSites 
  });
  return { success: true };
}

// ========================================
// Helpers
// ========================================
function getRpcUrl() {
  const chainId = parseInt(walletState.chainId, 16);
  const rpcs = {
    570: 'https://rpc.rollux.com',
    57: 'https://rpc.syscoin.org',
    1: 'https://eth.llamarpc.com',
    137: 'https://polygon-rpc.com',
    56: 'https://bsc-dataseed.binance.org',
    42161: 'https://arb1.arbitrum.io/rpc',
    10: 'https://mainnet.optimism.io',
    8453: 'https://mainnet.base.org',
    43114: 'https://api.avax.network/ext/bc/C/rpc',
    1868: 'https://rpc.soneium.org',
    250: 'https://rpc.ftm.tools',
    25: 'https://evm.cronos.org',
    59144: 'https://rpc.linea.build',
    324: 'https://mainnet.era.zksync.io',
    5000: 'https://rpc.mantle.xyz',
    42220: 'https://forno.celo.org',
    100: 'https://rpc.gnosischain.com',
    534352: 'https://rpc.scroll.io',
    81457: 'https://rpc.blast.io',
    11155111: 'https://rpc.sepolia.org'
  };
  return rpcs[chainId] || 'https://rpc.rollux.com';
}

function getChainIdHex(networkId) {
  const ids = {
    rollux: '0x23a', syscoin: '0x39', ethereum: '0x1',
    polygon: '0x89', bsc: '0x38', arbitrum: '0xa4b1',
    optimism: '0xa', base: '0x2105', avalanche: '0xa86a',
    soneium: '0x74c', fantom: '0xfa', cronos: '0x19',
    linea: '0xe708', zksync: '0x144', mantle: '0x1388',
    celo: '0xa4ec', gnosis: '0x64', scroll: '0x82750',
    blast: '0x13e31', sepolia: '0xaa36a7'
  };
  return ids[networkId] || '0x23a';
}

function getNetworkName(networkId) {
  const names = {
    rollux: 'Rollux',
    syscoin: 'Syscoin NEVM',
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    bsc: 'BNB Chain',
    arbitrum: 'Arbitrum One',
    optimism: 'Optimism',
    avalanche: 'Avalanche',
    base: 'Base',
    soneium: 'Soneium',
    fantom: 'Fantom',
    cronos: 'Cronos',
    linea: 'Linea',
    zksync: 'zkSync Era',
    mantle: 'Mantle',
    celo: 'Celo',
    gnosis: 'Gnosis',
    scroll: 'Scroll',
    blast: 'Blast',
    sepolia: 'Sepolia'
  };
  return names[networkId] || null;
}

async function findNetworkByChainIdAsync(chainIdDecimal) {
  // Buscar en redes predefinidas
  const knownNetworks = {
    570: 'rollux',
    57: 'syscoin', 
    1: 'ethereum',
    137: 'polygon',
    56: 'bsc',
    42161: 'arbitrum',
    10: 'optimism',
    43114: 'avalanche',
    8453: 'base',
    1868: 'soneium',
    250: 'fantom',
    25: 'cronos',
    59144: 'linea',
    324: 'zksync',
    5000: 'mantle',
    42220: 'celo',
    100: 'gnosis',
    534352: 'scroll',
    81457: 'blast',
    11155111: 'sepolia'
  };
  
  if (knownNetworks[chainIdDecimal]) {
    return knownNetworks[chainIdDecimal];
  }
  
  // Buscar en redes personalizadas
  const customNetworks = await getCustomNetworks();
  for (const [id, network] of Object.entries(customNetworks)) {
    if (network.chainId === chainIdDecimal) {
      return id;
    }
  }
  
  return null;
}

function findNetworkByChainId(chainIdDecimal) {
  // Versión síncrona solo para redes conocidas
  const knownNetworks = {
    570: 'rollux',
    57: 'syscoin', 
    1: 'ethereum',
    137: 'polygon',
    56: 'bsc',
    42161: 'arbitrum',
    10: 'optimism',
    43114: 'avalanche',
    8453: 'base',
    1868: 'soneium',
    250: 'fantom',
    25: 'cronos',
    59144: 'linea',
    324: 'zksync',
    5000: 'mantle',
    42220: 'celo',
    100: 'gnosis',
    534352: 'scroll',
    81457: 'blast',
    11155111: 'sepolia'
  };
  
  return knownNetworks[chainIdDecimal] || null;
}

function isKnownChain(chainId) {
  const chainIdDecimal = parseInt(chainId, 16);
  return findNetworkByChainId(chainIdDecimal) !== null;
}

function broadcastStateChange() {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'STATE_CHANGED',
          payload: getPublicState(tab.url)
        }).catch(() => {});
      }
    });
  });
}

function broadcastEvent(event, data) {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'OXADDRESS_EVENT',
          payload: { event, data }
        }).catch(() => {});
      }
    });
  });
}

console.log('🔐 0xAddress Background ready');
