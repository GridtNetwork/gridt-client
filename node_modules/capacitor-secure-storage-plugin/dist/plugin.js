var capacitorSecureStoragePlugin = (function (exports, core) {
    'use strict';

    const SecureStoragePlugin = core.registerPlugin('SecureStoragePlugin', {
        web: () => Promise.resolve().then(function () { return web; }).then(m => new m.SecureStoragePluginWeb()),
    });

    class SecureStoragePluginWeb extends core.WebPlugin {
        constructor() {
            super(...arguments);
            this.PREFIX = 'cap_sec_';
            this.addPrefix = (key) => this.PREFIX + key;
            this.removePrefix = (key) => key.replace(this.PREFIX, '');
        }
        get(options) {
            const value = localStorage.getItem(this.addPrefix(options.key));
            return value !== null
                ? Promise.resolve({
                    value: atob(value),
                })
                : Promise.reject('Item with given key does not exist');
        }
        set(options) {
            localStorage.setItem(this.addPrefix(options.key), btoa(options.value));
            return Promise.resolve({ value: true });
        }
        remove(options) {
            if (localStorage.getItem(this.addPrefix(options.key))) {
                localStorage.removeItem(this.addPrefix(options.key));
                return Promise.resolve({ value: true });
            }
            else {
                return Promise.reject('Item with given key does not exist');
            }
        }
        clear() {
            for (const key in localStorage) {
                if (key.indexOf(this.PREFIX) === 0) {
                    localStorage.removeItem(key);
                }
            }
            return Promise.resolve({ value: true });
        }
        keys() {
            const keys = Object.keys(localStorage)
                .filter(k => k.indexOf(this.PREFIX) === 0)
                .map(this.removePrefix);
            return Promise.resolve({ value: keys });
        }
        getPlatform() {
            return Promise.resolve({ value: 'web' });
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SecureStoragePluginWeb: SecureStoragePluginWeb
    });

    exports.SecureStoragePlugin = SecureStoragePlugin;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
