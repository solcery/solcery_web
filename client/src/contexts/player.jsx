import React, { FC, useMemo, useContext, useEffect, useCallback, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react/lib/cjs';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';

import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { useGameApi } from './gameApi';

require('@solana/wallet-adapter-react-ui/styles.css');

export const PlayerProvider: FC = (props) => {
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
    ],
    [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <PlayerProfileProvider>
                    {props.children}
                </PlayerProfileProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const fakeNfsMints = [
    '4TenYQgk45RcLPy4E2uYoJS4rJ3EsBqaqb4vVsDPzUmW', // DeGod
    '8yy7YwVY6Gz4RxokbJMbZEEDRCkxGTrToanMZRV3VjrK', // DegenApe
    '9rFm8jpyyGETFhmdMVSRr4fRMhLx54jihzSzSd2J5zUm', // Boryouku Dragon
    '5WEZMkjR8Bc9nYHqegHYTWC7d7RE863LEyqmvgwJ2AfQ', // Boryouku Baby Dragon
    '4DgQBQ5csjCMrkwCSh7ULmCJwuKTAPE6V49x37i9hPNV', // SMB
    '933VGb2fXiTK3Wa2L5eHe4ty92LRYdiazrebk7Cd6oor', // SolGod
    '8d8LPkDPd7E2smvTnVXaWmDMUJ15DCJuRXZNZaGEJV8o', // OkayBear
]

const PlayerContext = React.createContext(undefined);

const PlayerProfileProvider = (props) => {
    const { gameApi } = useGameApi();
    const { connected, publicKey, wallet } = useWallet();
    const { connection } = useConnection();

    const [ ready, setReady ] = useState(false);
    const [ nfts, setNfts ] = useState();

    useEffect(() => {
        if (!wallet) return;
        // let mints = fakeNfsMints.map(stringMintPubkey => new PublicKey(stringMintPubkey));
        setNfts(fakeNfsMints);
    }, [ connected, publicKey, connection ])

    useEffect(() => {
        if (!gameApi) return;
        if (!publicKey) return;
        if (!nfts) return;
        gameApi.setSession(publicKey.toBase58());
        setReady(true);
    }, [ nfts, gameApi, publicKey ])

    if (!connected || !ready) return (<>
        <WalletModalProvider>
            <WalletMultiButton />
            <WalletDisconnectButton />
        </WalletModalProvider>
    </>);

    return (<PlayerContext.Provider value ={{ publicKey, nfts }}>
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, nfts } = useContext(PlayerContext);
    return { publicKey, nfts };
}


