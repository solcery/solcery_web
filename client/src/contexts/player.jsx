import React, { FC, useMemo, useContext, useEffect, useState } from 'react';
import { useGameApi } from './gameApi';
import { useAuth } from './auth';

const PlayerContext = React.createContext(undefined);
// const publicKey = new PublicKey(''); // TODO: CHEAT

export const PlayerProvider = (props) => {
    const { gameApi } = useGameApi();
    const { publicKey } = useAuth();

    const [ connected, setConnected ] = useState(false);
    const [ nfts, setNfts ] = useState(undefined);

    useEffect(() => {
        if (!gameApi) return;
        if (!publicKey) {
            if (connected) {
                setNfts(undefined);
                setConnected(false);
            }
            return;
        };
        gameApi.forge.getPlayerNfts({ publicKey: publicKey.toBase58()}).then(res => {
            setNfts(res)
        });
        gameApi.setSession(publicKey.toBase58());
        setConnected(true);
    }, [ connected, gameApi, publicKey ])

    let value = { 
        publicKey: connected ? publicKey : undefined, 
        nfts 
    }

    return (<PlayerContext.Provider value={value}>
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, nfts } = useContext(PlayerContext);
    return { publicKey, nfts };
}
