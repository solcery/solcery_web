import EventEmitter from 'eventemitter3';
import { PublicKey } from '@solana/web3.js';
const wallet_adapter_base_1 = require('@solana/wallet-adapter-base');

export class FractalWalletAdapter extends EventEmitter {
    constructor(config = {}) {
        super();
        this.name = 'Fractal';
        this.url = 'https://fractal.is';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjM0IiB3aWR0aD0iMzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTE9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1MzRiYjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NTFiZjkiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9Ii41IiB4Mj0iLjUiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii44MiIvPjwvbGluZWFyR3JhZGllbnQ+PGNpcmNsZSBjeD0iMTciIGN5PSIxNyIgZmlsbD0idXJsKCNhKSIgcj0iMTciLz48cGF0aCBkPSJtMjkuMTcwMiAxNy4yMDcxaC0yLjk5NjljMC02LjEwNzQtNC45NjgzLTExLjA1ODE3LTExLjA5NzUtMTEuMDU4MTctNi4wNTMyNSAwLTEwLjk3NDYzIDQuODI5NTctMTEuMDk1MDggMTAuODMyMzctLjEyNDYxIDYuMjA1IDUuNzE3NTIgMTEuNTkzMiAxMS45NDUzOCAxMS41OTMyaC43ODM0YzUuNDkwNiAwIDEyLjg0OTctNC4yODI5IDEzLjk5OTUtOS41MDEzLjIxMjMtLjk2MTktLjU1MDItMS44NjYxLTEuNTM4OC0xLjg2NjF6bS0xOC41NDc5LjI3MjFjMCAuODE2Ny0uNjcwMzggMS40ODQ3LTEuNDkwMDEgMS40ODQ3LS44MTk2NCAwLTEuNDg5OTgtLjY2ODMtMS40ODk5OC0xLjQ4NDd2LTIuNDAxOWMwLS44MTY3LjY3MDM0LTEuNDg0NyAxLjQ4OTk4LTEuNDg0Ny44MTk2MyAwIDEuNDkwMDEuNjY4IDEuNDkwMDEgMS40ODQ3em01LjE3MzggMGMwIC44MTY3LS42NzAzIDEuNDg0Ny0xLjQ4OTkgMS40ODQ3LS44MTk3IDAtMS40OS0uNjY4My0xLjQ5LTEuNDg0N3YtMi40MDE5YzAtLjgxNjcuNjcwNi0xLjQ4NDcgMS40OS0xLjQ4NDcuODE5NiAwIDEuNDg5OS42NjggMS40ODk5IDEuNDg0N3oiIGZpbGw9InVybCgjYikiLz48L3N2Zz4K';
        this._disconnected = () => {
            // const wallet = this._wallet;
            // if (wallet) {
            //     wallet.off('disconnect', this._disconnected);
            //     this._wallet = null;
            //     this._publicKey = null;
            //     this.emit('error', new wallet_adapter_base_1.WalletDisconnectedError());
            //     this.emit('disconnect');
            // }
        };
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this.emit('readyStateChange', true);
        if (this._readyState !== wallet_adapter_base_1.WalletReadyState.Unsupported) {
            (0, wallet_adapter_base_1.scopePollingDetectionStrategy)(() => {
                var _a;
                this._readyState = wallet_adapter_base_1.WalletReadyState.Installed;
                this.emit('readyStateChange', this._readyState);
                console.log('true')
                return true;
            });
        }
    }
    get publicKey() {
        return this._publicKey;
    }
    get connecting() {
        return this._connecting;
    }
    get connected() {
        var _a;
        return !!((_a = this._wallet) === null || _a === void 0 ? void 0 : _a.isConnected);
    }
    get readyState() {
        return this._readyState;
    }
    connect() {
        if (this.connected || this.connecting)
            return;
        if (this._readyState !== wallet_adapter_base_1.WalletReadyState.Installed)
            throw new wallet_adapter_base_1.WalletNotReadyError();
        // this._connecting = true;
        // let publicKey;

        // try {
        //     publicKey = new web3_js_1.PublicKey(wallet.publicKey.toBytes());
        // }
        // catch (error) {
        //     throw new wallet_adapter_base_1.WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
        // }


        // wallet.on('disconnect', this._disconnected);
        // this._wallet = wallet;
        // this._publicKey = publicKey;
        // this.emit('connect', publicKey);
        this._connecting = true;
        this._publicKey = new PublicKey('TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
        this.emit('connect', this._publicKey);
        this._connecting = false;


        // return __awaiter(this, void 0, void 0, function* () {
        //     try {
        //         if (this.connected || this.connecting)
        //             return;
        //         if (this._readyState !== wallet_adapter_base_1.WalletReadyState.Installed)
        //             throw new wallet_adapter_base_1.WalletNotReadyError();
        //         this._connecting = true;
        //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //         const wallet = window.solana;
        //         if (!wallet.isConnected) {
        //             // NOTE: If you are contributing a wallet adapter, **DO NOT COPY** this.
        //             // The Phantom adapter code has hacks because the Promise returned by `wallet.connect()` is not rejected if the user closes the window.
        //             // If your adapter fulfills the Promise correctly, you don't need events, or the hacky override of the private `_handleDisconnect` API.
        //             //
        //             // HACK: Phantom doesn't reject or emit an event if the popup is closed
        //             const handleDisconnect = wallet._handleDisconnect;
        //             try {
        //                 yield new Promise((resolve, reject) => {
        //                     const connect = () => {
        //                         wallet.off('connect', connect);
        //                         resolve();
        //                     };
        //                     wallet._handleDisconnect = (...args) => {
        //                         wallet.off('connect', connect);
        //                         reject(new wallet_adapter_base_1.WalletWindowClosedError());
        //                         return handleDisconnect.apply(wallet, args);
        //                     };
        //                     wallet.on('connect', connect);
        //                     wallet.connect().catch((reason) => {
        //                         wallet.off('connect', connect);
        //                         reject(reason);
        //                     });
        //                 });
        //             }
        //             catch (error) {
        //                 if (error instanceof wallet_adapter_base_1.WalletError)
        //                     throw error;
        //                 throw new wallet_adapter_base_1.WalletConnectionError(error === null || error === void 0 ? void 0 : error.message, error);
        //             }
        //             finally {
        //                 wallet._handleDisconnect = handleDisconnect;
        //             }
        //         }
        //         if (!wallet.publicKey)
        //             throw new wallet_adapter_base_1.WalletAccountError();
        //         let publicKey;
        //         try {
        //             publicKey = new web3_js_1.PublicKey(wallet.publicKey.toBytes());
        //         }
        //         catch (error) {
        //             throw new wallet_adapter_base_1.WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
        //         }
        //         wallet.on('disconnect', this._disconnected);
        //         this._wallet = wallet;
        //         this._publicKey = publicKey;
        //         this.emit('connect', publicKey);
        //     }
        //     catch (error) {
        //         this.emit('error', error);
        //         throw error;
        //     }
        //     finally {
        //         this._connecting = false;
        //     }
        // });
    }
    disconnect() {
        this.emit('disconnect')
        // return __awaiter(this, void 0, void 0, function* () {
        //     const wallet = this._wallet;
        //     if (wallet) {
        //         wallet.off('disconnect', this._disconnected);
        //         this._wallet = null;
        //         this._publicKey = null;
        //         try {
        //             yield wallet.disconnect();
        //         }
        //         catch (error) {
        //             this.emit('error', new wallet_adapter_base_1.WalletDisconnectionError(error === null || error === void 0 ? void 0 : error.message, error));
        //         }
        //     }
        //     this.emit('disconnect');
        // });
    }
    sendTransaction(transaction, connection, options = {}) {
        // return __awaiter(this, void 0, void 0, function* () {
        //     try {
        //         const wallet = this._wallet;
        //         if (!wallet)
        //             throw new wallet_adapter_base_1.WalletNotConnectedError();
        //         try {
        //             transaction = yield this.prepareTransaction(transaction, connection);
        //             const { signers } = options, sendOptions = __rest(options, ["signers"]);
        //             (signers === null || signers === void 0 ? void 0 : signers.length) && transaction.partialSign(...signers);
        //             const { signature } = yield wallet.signAndSendTransaction(transaction, sendOptions);
        //             return signature;
        //         }
        //         catch (error) {
        //             if (error instanceof wallet_adapter_base_1.WalletError)
        //                 throw error;
        //             throw new wallet_adapter_base_1.WalletSendTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
        //         }
        //     }
        //     catch (error) {
        //         this.emit('error', error);
        //         throw error;
        //     }
        // });
    }
    signTransaction(transaction) {
        // return __awaiter(this, void 0, void 0, function* () {
        //     try {
        //         const wallet = this._wallet;
        //         if (!wallet)
        //             throw new wallet_adapter_base_1.WalletNotConnectedError();
        //         try {
        //             return (yield wallet.signTransaction(transaction)) || transaction;
        //         }
        //         catch (error) {
        //             throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
        //         }
        //     }
        //     catch (error) {
        //         this.emit('error', error);
        //         throw error;
        //     }
        // });
    }
    signAllTransactions(transactions) {
        // return __awaiter(this, void 0, void 0, function* () {
        //     try {
        //         const wallet = this._wallet;
        //         if (!wallet)
        //             throw new wallet_adapter_base_1.WalletNotConnectedError();
        //         try {
        //             return (yield wallet.signAllTransactions(transactions)) || transactions;
        //         }
        //         catch (error) {
        //             throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
        //         }
        //     }
        //     catch (error) {
        //         this.emit('error', error);
        //         throw error;
        //     }
        // });
    }
    signMessage(message) {
        // return __awaiter(this, void 0, void 0, function* () {
        //     try {
        //         const wallet = this._wallet;
        //         if (!wallet)
        //             throw new wallet_adapter_base_1.WalletNotConnectedError();
        //         try {
        //             const { signature } = yield wallet.signMessage(message);
        //             return signature;
        //         }
        //         catch (error) {
        //             throw new wallet_adapter_base_1.WalletSignMessageError(error === null || error === void 0 ? void 0 : error.message, error);
        //         }
        //     }
        //     catch (error) {
        //         this.emit('error', error);
        //         throw error;
        //     }
        // });
    }
}