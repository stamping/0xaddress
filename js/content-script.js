// ============================================
// 0xAddress - Content Script
// Puente entre la página web y el background
// ============================================

(() => {
  'use strict';

  // Mapa de solicitudes pendientes
  const pendingRequests = new Map();

  // ========================================
  // Inyectar el provider en la página
  // ========================================
  function injectScript() {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('js/inpage.js');
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);
    } catch (error) {
      console.error('0xAddress: Error injecting script:', error);
    }
  }

  // Inyectar lo antes posible
  injectScript();

  // ========================================
  // Comunicación: Página <-> Content <-> Background
  // ========================================
  
  // Escuchar mensajes de la página (inpage.js)
  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.source !== 'oxaddress-inpage') return;

    const { type, payload } = event.data;

    switch (type) {
      case 'OXADDRESS_INIT':
        // Solicitar estado actual al background
        try {
          const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
          sendToPage('OXADDRESS_STATE', state);
        } catch (e) {
          console.warn('0xAddress: Could not get state:', e);
        }
        break;

      case 'OXADDRESS_REQUEST':
        handleRpcRequest(payload);
        break;
    }
  });

  async function handleRpcRequest(payload) {
    const { id, method } = payload;
    
    // Guardar la solicitud pendiente
    pendingRequests.set(id, { method, timestamp: Date.now() });
    
    try {
      // Agregar info de la página para contexto
      const requestPayload = {
        ...payload,
        origin: window.location.origin,
        favicon: getFavicon(),
        title: document.title
      };
      
      // Enviar al background y esperar respuesta
      const response = await chrome.runtime.sendMessage({
        type: 'RPC_REQUEST',
        payload: requestPayload
      });
      
      // Si la respuesta es "pending", esperar respuesta asíncrona
      if (response && response.pending) {
        // La respuesta llegará por OXADDRESS_ASYNC_RESPONSE
        return;
      }
      
      // Limpiar solicitud pendiente
      pendingRequests.delete(id);
      
      // Enviar respuesta a la página
      if (response) {
        sendToPage('OXADDRESS_RESPONSE', {
          id: id,
          result: response.result,
          error: response.error
        });
      }
    } catch (error) {
      // Si el error es por canal cerrado, la respuesta vendrá por mensaje
      if (error.message && error.message.includes('message channel closed')) {
        // La respuesta vendrá por OXADDRESS_ASYNC_RESPONSE
        return;
      }
      
      // Otro tipo de error
      pendingRequests.delete(id);
      sendToPage('OXADDRESS_RESPONSE', {
        id: id,
        error: { code: -32603, message: error.message || 'Internal error' }
      });
    }
  }

  // Escuchar mensajes del background (eventos y respuestas asíncronas)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OXADDRESS_EVENT') {
      sendToPage('OXADDRESS_EVENT', message.payload);
    }
    
    if (message.type === 'STATE_CHANGED') {
      sendToPage('OXADDRESS_STATE', message.payload);
    }
    
    // Respuesta asíncrona para solicitudes que requieren aprobación
    if (message.type === 'OXADDRESS_ASYNC_RESPONSE') {
      const { id, result, error } = message.payload;
      pendingRequests.delete(id);
      sendToPage('OXADDRESS_RESPONSE', { id, result, error });
    }
    
    sendResponse({ received: true });
    return true;
  });

  // ========================================
  // Helpers
  // ========================================
  function sendToPage(type, payload) {
    window.postMessage({ type, payload, source: 'oxaddress-content' }, '*');
  }

  function getFavicon() {
    const link = document.querySelector('link[rel~="icon"]');
    return link ? link.href : `${window.location.origin}/favicon.ico`;
  }

  console.log('🔗 0xAddress content script loaded');
})();
