// ============================================
// 0xAddress - Event Handlers
// Procesa data-click, data-change para cumplir CSP
// ============================================

(function() {
    'use strict';

    // ========================================
    // Parser de expresiones simples
    // ========================================
    function parseAndExecute(expression, event) {
        if (!expression) return;
        
        // Limpiar expresión
        expression = expression.trim();
        
        // Soportar múltiples expresiones separadas por ;
        const expressions = expression.split(';').map(e => e.trim()).filter(e => e);
        
        for (const expr of expressions) {
            executeSingleExpression(expr, event);
        }
    }
    
    function executeSingleExpression(expression, event) {
        if (!expression) return;
        
        // Caso: funcion() o funcion(args)
        const match = expression.match(/^(\w+)\s*\((.*)\)$/);
        
        if (match) {
            const fnName = match[1];
            const argsStr = match[2].trim();
            
            // Obtener función global
            const fn = window[fnName];
            if (typeof fn !== 'function') {
                console.warn('Function not found:', fnName);
                return;
            }
            
            // Parsear argumentos
            let args = [];
            if (argsStr) {
                // Caso especial: event
                if (argsStr === 'event' || argsStr === 'e') {
                    args = [event];
                } 
                // Caso: 'string'
                else if (argsStr.startsWith("'") || argsStr.startsWith('"')) {
                    // Parsear argumentos string
                    args = parseArgs(argsStr, event);
                }
                // Caso: múltiples argumentos
                else {
                    args = parseArgs(argsStr, event);
                }
            }
            
            // Ejecutar
            try {
                fn.apply(window, args);
            } catch (err) {
                console.error('Error executing', fnName, ':', err);
            }
        } else {
            // Caso: solo nombre de función sin paréntesis
            const fn = window[expression];
            if (typeof fn === 'function') {
                fn(event);
            }
        }
    }

    function parseArgs(argsStr, event) {
        const args = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        let depth = 0;
        
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            
            if (!inString && (char === '"' || char === "'")) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar) {
                inString = false;
                args.push(current);
                current = '';
                // Skip comma after string
                while (argsStr[i + 1] === ' ' || argsStr[i + 1] === ',') i++;
                continue;
            } else if (inString) {
                current += char;
            } else if (char === ',' && depth === 0) {
                if (current.trim()) {
                    args.push(evaluateArg(current.trim(), event));
                }
                current = '';
            } else if (char === '(' || char === '[' || char === '{') {
                depth++;
                current += char;
            } else if (char === ')' || char === ']' || char === '}') {
                depth--;
                current += char;
            } else if (char !== ' ' || current) {
                current += char;
            }
        }
        
        if (current.trim()) {
            args.push(evaluateArg(current.trim(), event));
        }
        
        return args;
    }

    function evaluateArg(arg, event) {
        // event o e
        if (arg === 'event' || arg === 'e') return event;
        // this
        if (arg === 'this') return event.target;
        // null
        if (arg === 'null') return null;
        // undefined
        if (arg === 'undefined') return undefined;
        // true/false
        if (arg === 'true') return true;
        if (arg === 'false') return false;
        // Número
        if (!isNaN(arg)) return Number(arg);
        // String ya procesado
        return arg;
    }

    // ========================================
    // Procesar elementos con data-* handlers
    // ========================================
    function processHandlers(root = document) {
        // data-click
        root.querySelectorAll('[data-click]').forEach(el => {
            if (el._clickHandlerSet) return;
            el._clickHandlerSet = true;
            
            const handler = el.getAttribute('data-click');
            el.addEventListener('click', (e) => {
                parseAndExecute(handler, e);
            });
        });

        // data-change
        root.querySelectorAll('[data-change]').forEach(el => {
            if (el._changeHandlerSet) return;
            el._changeHandlerSet = true;
            
            const handler = el.getAttribute('data-change');
            el.addEventListener('change', (e) => {
                parseAndExecute(handler, e);
            });
        });

        // data-input
        root.querySelectorAll('[data-input]').forEach(el => {
            if (el._inputHandlerSet) return;
            el._inputHandlerSet = true;
            
            const handler = el.getAttribute('data-input');
            el.addEventListener('input', (e) => {
                parseAndExecute(handler, e);
            });
        });

        // data-blur
        root.querySelectorAll('[data-blur]').forEach(el => {
            if (el._blurHandlerSet) return;
            el._blurHandlerSet = true;
            
            const handler = el.getAttribute('data-blur');
            el.addEventListener('blur', (e) => {
                parseAndExecute(handler, e);
            });
        });

        // data-submit
        root.querySelectorAll('[data-submit]').forEach(el => {
            if (el._submitHandlerSet) return;
            el._submitHandlerSet = true;
            
            const handler = el.getAttribute('data-submit');
            el.addEventListener('submit', (e) => {
                e.preventDefault();
                parseAndExecute(handler, e);
            });
        });
    }

    // ========================================
    // Inicializar
    // ========================================
    function init() {
        processHandlers();

        // Observer para contenido dinámico
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        processHandlers(node);
                        if (node.querySelectorAll) {
                            processHandlers(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Event handlers initialized (CSP compliant)');
    }

    // Ejecutar cuando DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

