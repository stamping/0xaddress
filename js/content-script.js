// ============================================
// 0xAddress - Content Script
// Puente entre la página web y el background
// ============================================

(() => {
  'use strict';

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
        const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
        sendToPage('OXADDRESS_STATE', state);
        break;

      case 'OXADDRESS_REQUEST':
        try {
          // Agregar info de la página para contexto
          const requestPayload = {
            ...payload,
            origin: window.location.origin,
            favicon: getFavicon(),
            title: document.title
          };
          
          const response = await chrome.runtime.sendMessage({
            type: 'RPC_REQUEST',
            payload: requestPayload
          });
          
          sendToPage('OXADDRESS_RESPONSE', {
            id: payload.id,
            result: response.result,
            error: response.error
          });
        } catch (error) {
          sendToPage('OXADDRESS_RESPONSE', {
            id: payload.id,
            error: { code: 4001, message: error.message }
          });
        }
        break;
    }
  });

  // Escuchar mensajes del background (eventos)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OXADDRESS_EVENT') {
      sendToPage('OXADDRESS_EVENT', message.payload);
    }
    
    if (message.type === 'STATE_CHANGED') {
      sendToPage('OXADDRESS_STATE', message.payload);
    }
    
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
