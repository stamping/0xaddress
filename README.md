# 🔐 0xAddress Wallet - Chrome Extension

Tu Wallet Web3 educativa en menos de 30 segundos,  funciona como extensión de Chrome, similar a MetaMask. 

0xAddress es una wallet compatible con Ethereum (EVM) completamente open source. No confíes tus llaves privadas a terceros. Crea la tuya, personalízala y mantén el control total.

> ¿Tu primera wallet fue para "practicar"? — Miles de usuarios crean su primera wallet en MetaMask, guardan la seed phrase en un .txt o screenshot, y años después esa misma wallet tiene fondos reales. El problema: esas 12 palabras ya están comprometidas. Con 0xAddress aprendes sin ese riesgo.

## ✨ Características

- ✅ **Inyección de Provider**: Las dApps pueden conectarse usando `window.oxaddress`
- ✅ **EIP-6963**: Compatible con el estándar multi-wallet discovery
- ✅ **Multi-red**: Soporte para Rollux, Ethereum, Polygon, BSC, Arbitrum, y más
- ✅ **Tokens ERC20 y NFTs ERC721**: Gestión completa
- ✅ **Firma de transacciones**: Personal sign, EIP-712, y transacciones
- ✅ **Bilingüe**: Español e Inglés

## 🚀 Instalación

### Opción 1: Modo desarrollador (recomendado para pruebas)

1. Descomprime el archivo `ext.zip` desde [https://0xaddress.com/e/ext.zip](https://0xaddress.com/e/ext.zip) o descargala desde aquí.
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el **"Modo desarrollador"** (esquina superior derecha)
4. Haz clic en **"Cargar descomprimida"**
5. Selecciona la carpeta `ext`
6. ¡Listo! El icono aparecerá en tu barra de extensiones

### Opción 2: Chrome Web Store (próximamente)

La extensión estará disponible en Chrome Web Store una vez aprobada.

## 📖 Uso para Desarrolladores (dApps)

> **0xaddress dApp Playground** ( Prueba las funciones RPC de MetaMask y 0xAddress): [0xaddress.com/dev/](https://0xaddress.com/dev/)

### Detectar la wallet

```javascript
// Verificar si 0xAddress está instalada
if (window.oxaddress) {
    console.log('0xAddress detectada!');
}

// O usar EIP-6963 para detectar múltiples wallets
window.addEventListener('eip6963:announceProvider', (event) => {
    const { info, provider } = event.detail;
    if (info.rdns === 'com.0xaddress.wallet') {
        console.log('0xAddress encontrada via EIP-6963');
    }
});

// Solicitar descubrimiento
window.dispatchEvent(new Event('eip6963:requestProvider'));
```

### Conectar a la wallet

```javascript
async function connectWallet() {
    try {
        const accounts = await window.oxaddress.request({
            method: 'eth_requestAccounts'
        });
        console.log('Conectado:', accounts[0]);
        return accounts[0];
    } catch (error) {
        console.error('Usuario rechazó la conexión:', error);
    }
}
```

### Obtener información de la red

```javascript
// Chain ID actual
const chainId = await window.oxaddress.request({ method: 'eth_chainId' });
console.log('Chain ID:', chainId); // Ej: "0x23a" para Rollux

// Escuchar cambios de red
window.oxaddress.on('chainChanged', (chainId) => {
    console.log('Red cambiada a:', chainId);
    window.location.reload(); // Recomendado recargar
});
```

### Enviar una transacción

```javascript
async function sendTransaction() {
    const txHash = await window.oxaddress.request({
        method: 'eth_sendTransaction',
        params: [{
            from: accounts[0],
            to: '0x...destino',
            value: '0x' + (0.1 * 1e18).toString(16), // 0.1 ETH en hex
            data: '0x' // Opcional: calldata para contratos
        }]
    });
    console.log('TX enviada:', txHash);
}
```

### Firmar un mensaje (Personal Sign)

```javascript
async function signMessage(message) {
    const signature = await window.oxaddress.request({
        method: 'personal_sign',
        params: [message, accounts[0]]
    });
    return signature;
}
```

### Firmar datos tipados (EIP-712)

```javascript
async function signTypedData() {
    const typedData = {
        domain: {
            name: 'Mi dApp',
            version: '1',
            chainId: 570,
            verifyingContract: '0x...'
        },
        types: {
            Person: [
                { name: 'name', type: 'string' },
                { name: 'wallet', type: 'address' }
            ]
        },
        message: {
            name: 'Juan',
            wallet: '0x...'
        },
        primaryType: 'Person'
    };

    const signature = await window.oxaddress.request({
        method: 'eth_signTypedData_v4',
        params: [accounts[0], JSON.stringify(typedData)]
    });
    return signature;
}
```

### Escuchar eventos

```javascript
// Cuenta cambiada
window.oxaddress.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
        console.log('Wallet desconectada');
    } else {
        console.log('Cuenta activa:', accounts[0]);
    }
});

// Red cambiada
window.oxaddress.on('chainChanged', (chainId) => {
    console.log('Nueva red:', chainId);
});

// Conexión/desconexión
window.oxaddress.on('connect', ({ chainId }) => {
    console.log('Conectado a:', chainId);
});

window.oxaddress.on('disconnect', (error) => {
    console.log('Desconectado:', error);
});
```

## 🔗 Redes Soportadas

| Red | Chain ID (hex) | Chain ID (dec) |
|-----|---------------|----------------|
| Rollux | 0x23a | 570 |
| Syscoin NEVM | 0x39 | 57 |
| Ethereum | 0x1 | 1 |
| Polygon | 0x89 | 137 |
| BNB Chain | 0x38 | 56 |
| Arbitrum | 0xa4b1 | 42161 |
| Optimism | 0xa | 10 |
| Avalanche | 0xa86a | 43114 |
| Base | 0x2105 | 8453 |
| Sepolia (testnet) | 0xaa36a7 | 11155111 |

## 📁 Estructura del proyecto

```
0xaddress-extension/
├── manifest.json          # Configuración de la extensión
├── popup.html             # UI principal
├── css/
│   └── styles.css         # Estilos
├── js/
│   ├── background.js      # Service Worker
│   ├── content-script.js  # Script de contenido
│   ├── inpage.js          # Provider inyectado (window.oxaddress)
│   ├── popup-bridge.js    # Puente popup<->background
│   ├── wallet.js          # Lógica de wallet
│   ├── config.js          # Configuración de redes
│   ├── i18n.js            # Traducciones
│   ├── ui.js              # Funciones de UI
│   ├── app.js             # App principal
│   └── contracts.js       # Gestión de contratos
├── abis/
│   ├── erc20.js           # ABI ERC20
│   └── erc721.js          # ABI ERC721
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## ⚠️ Notas importantes

1. **Namespace único**: Usamos `window.oxaddress` en lugar de `window.ethereum` para evitar conflictos con MetaMask
2. **No pisamos MetaMask**: Si el usuario tiene ambas extensiones, ambas funcionan independientemente
3. **EIP-6963**: Las dApps modernas detectarán ambas wallets y el usuario podrá elegir

## 🔒 Seguridad

- Las claves privadas se cifran con AES-256 usando CryptoJS
- Nunca se envían claves al background service worker
- Todas las firmas se ejecutan en el popup con la clave descifrada temporalmente
- Compatible con hardware wallets (próximamente)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, abre un issue o PR en el repositorio.

## 📄 Licencia

MIT - Creado por [Stamping.io](https://stamping.io)

---

💡 **Tip**: Para desarrollo local de dApps, puedes usar `console.log(window.oxaddress)` para inspeccionar el provider.
--
## ✨ Info
- Sitio web: [0xaddress.com](https://0xaddress.com)
- dApp Playground ( Prueba las funciones RPC de MetaMask y 0xAddress): [0xaddress.com/dev](https://0xaddress.com/dev)
- Descargar código de extensión: [0xaddress.com/extension](https://0xaddress.com/e/ext.zip)
