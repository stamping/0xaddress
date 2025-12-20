// ============================================
// 0xAddress - Injected Provider (EIP-1193)
// Se inyecta en window.oxaddress
// ============================================

(() => {
  'use strict';

  // Evitar doble inyección
  if (window.oxaddress) return;

  // ========================================
  // EventEmitter simple
  // ========================================
  class EventEmitter {
    constructor() {
      this._events = {};
    }

    on(event, listener) {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(listener);
      return this;
    }

    off(event, listener) {
      if (!this._events[event]) return this;
      this._events[event] = this._events[event].filter(l => l !== listener);
      return this;
    }

    emit(event, ...args) {
      if (!this._events[event]) return false;
      this._events[event].forEach(listener => listener(...args));
      return true;
    }

    removeAllListeners(event) {
      if (event) {
        delete this._events[event];
      } else {
        this._events = {};
      }
      return this;
    }
  }

  // ========================================
  // Provider EIP-1193
  // ========================================
  class OxAddressProvider extends EventEmitter {
    constructor() {
      super();
      this._requestId = 0;
      this._pendingRequests = new Map();
      this._pendingAccountsRequest = null; // Deduplicación de eth_requestAccounts
      this._isConnected = false;
      this._chainId = null;
      this._selectedAddress = null;
      
      // Escuchar mensajes del content script
      window.addEventListener('message', this._handleMessage.bind(this));
      
      // Solicitar estado inicial
      this._postMessage({ type: 'OXADDRESS_INIT' });
    }

    // ========================================
    // Propiedades públicas (compatibilidad)
    // ========================================
    get isOxAddress() { return true; }
    get is0xAddress() { return true; }
    get isMetaMask() { return false; } // No pretendemos ser MetaMask
    get chainId() { return this._chainId; }
    get selectedAddress() { return this._selectedAddress; }
    get networkVersion() { 
      return this._chainId ? parseInt(this._chainId, 16).toString() : null; 
    }

    // ========================================
    // Método principal EIP-1193
    // ========================================
    async request({ method, params = [] }) {
      // Deduplicación para eth_requestAccounts
      if (method === 'eth_requestAccounts') {
        if (this._pendingAccountsRequest) {
          console.log('⏳ eth_requestAccounts already pending, waiting...');
          return this._pendingAccountsRequest;
        }
        
        this._pendingAccountsRequest = this._doRequest({ method, params });
        
        try {
          const result = await this._pendingAccountsRequest;
          return result;
        } finally {
          this._pendingAccountsRequest = null;
        }
      }
      
      return this._doRequest({ method, params });
    }
    
    async _doRequest({ method, params = [] }) {
      return new Promise((resolve, reject) => {
        const id = ++this._requestId;
        
        this._pendingRequests.set(id, { resolve, reject, method });
        
        this._postMessage({
          type: 'OXADDRESS_REQUEST',
          payload: { id, method, params }
        });

        // Timeout de 5 minutos para transacciones
        const timeout = method.includes('send') || method.includes('sign') ? 300000 : 60000;
        
        setTimeout(() => {
          if (this._pendingRequests.has(id)) {
            this._pendingRequests.delete(id);
            reject(new Error('Request timeout'));
          }
        }, timeout);
      });
    }

    // ========================================
    // Métodos legacy (compatibilidad)
    // ========================================
    async enable() {
      return this.request({ method: 'eth_requestAccounts' });
    }

    send(methodOrPayload, paramsOrCallback) {
      // Formato antiguo: send(method, params)
      if (typeof methodOrPayload === 'string') {
        return this.request({ method: methodOrPayload, params: paramsOrCallback });
      }
      
      // Formato callback: send(payload, callback)
      if (typeof paramsOrCallback === 'function') {
        this.request(methodOrPayload)
          .then(result => paramsOrCallback(null, { result }))
          .catch(error => paramsOrCallback(error, null));
        return;
      }
      
      // Formato síncrono (no recomendado)
      return this.request(methodOrPayload);
    }

    sendAsync(payload, callback) {
      this.request(payload)
        .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
        .catch(error => callback(error, null));
    }

    // ========================================
    // Comunicación con content script
    // ========================================
    _postMessage(data) {
      window.postMessage({ ...data, source: 'oxaddress-inpage' }, '*');
    }

    _handleMessage(event) {
      if (event.source !== window) return;
      if (!event.data || event.data.source !== 'oxaddress-content') return;

      const { type, payload } = event.data;

      switch (type) {
        case 'OXADDRESS_STATE':
          this._handleStateUpdate(payload);
          break;
          
        case 'OXADDRESS_RESPONSE':
          this._handleResponse(payload);
          break;
          
        case 'OXADDRESS_EVENT':
          this._handleEvent(payload);
          break;
      }
    }

    _handleStateUpdate(state) {
      const chainChanged = this._chainId !== state.chainId;
      const accountsChanged = this._selectedAddress !== state.selectedAddress;
      
      this._chainId = state.chainId;
      this._selectedAddress = state.selectedAddress;
      this._isConnected = state.isConnected;

      if (chainChanged && this._chainId) {
        this.emit('chainChanged', this._chainId);
      }

      if (accountsChanged) {
        const accounts = this._selectedAddress ? [this._selectedAddress] : [];
        this.emit('accountsChanged', accounts);
      }

      if (state.isConnected && !this._isConnected) {
        this.emit('connect', { chainId: this._chainId });
      }
    }

    _handleResponse(payload) {
      const { id, result, error } = payload;
      const pending = this._pendingRequests.get(id);
      
      if (!pending) return;
      
      this._pendingRequests.delete(id);
      
      if (error) {
        const err = new Error(error.message || 'Unknown error');
        err.code = error.code || 4001;
        pending.reject(err);
      } else {
        pending.resolve(result);
      }
    }

    _handleEvent(payload) {
      const { event, data } = payload;
      this.emit(event, data);
    }

    // ========================================
    // Métodos de estado
    // ========================================
    isConnected() {
      return this._isConnected;
    }
  }

  // ========================================
  // Crear e inyectar provider
  // ========================================
  const provider = new OxAddressProvider();
  
  // Exponer en window.oxaddress
  window.oxaddress = provider;

  // ========================================
  // EIP-6963: Multi-wallet discovery
  // ========================================
  const info = {
    uuid: '0xaddress-wallet-uuid-v1',
    name: '0xAddress',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iMjQiIGZpbGw9IiMxYTFhMmUiLz4KPHRleHQgeD0iNjQiIHk9Ijc1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MHg8L3RleHQ+Cjwvc3ZnPg==',
    rdns: 'com.0xaddress.wallet'
  };

  // Anunciar provider para dApps modernas
  const announceProvider = () => {
    window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({ info, provider })
    }));
  };

  // Escuchar solicitudes de descubrimiento
  window.addEventListener('eip6963:requestProvider', announceProvider);
  
  // Anunciar inmediatamente
  announceProvider();

  // Log de inicialización
  console.log('🔐 0xAddress Wallet injected (window.oxaddress)');
})();
