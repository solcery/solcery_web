import React, { useContext, useState, useRef } from 'react';

import { WalletsAuth } from './wallets';
import { FractalAuth } from './fractal';

const AuthContext = React.createContext(undefined);

export const AuthProvider = (props) => {
    const [ publicKey, setPublicKey ] = useState(undefined);
    const onDisconnect = useRef(undefined);
    const auth = (key, onDisconnectCallback) => {
        setPublicKey(key);
        onDisconnect.current = onDisconnectCallback;
    }

    const disconnect = () => {
        console.log('disconnect')
        setPublicKey(undefined);
        if (onDisconnect.current) {
            onDisconnect.current();
            onDisconnect.current = undefined;
        }
    }

    let AuthComponent = WalletsAuth;
    // if (player.authType === 'fractal') {
    //     AuthComponent = FractalAuth;
    // }  
    // if (player.authType === 'wallets') {
    //     AuthComponent = WalletsAuth;
    // } 

    const value = {
        publicKey,
        auth,
        disconnect,
        AuthComponent,
    }
    return (<AuthContext.Provider value={value}>
        { props.children }
    </AuthContext.Provider>);
}

export function useAuth() {
    const { publicKey, auth, disconnect, AuthComponent } = useContext(AuthContext);
    return { publicKey, auth, disconnect, AuthComponent };
}
