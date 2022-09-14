import React, { FC, useMemo, useContext, useEffect, useCallback, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react/lib/cjs';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    BraveWalletAdapter,
    NightlyWalletAdapter,
    SolletWalletAdapter,
    BitKeepWalletAdapter,
    CoinbaseWalletAdapter,
    Coin98WalletAdapter,
    ExodusWalletAdapter,
    SlopeWalletAdapter,
    SafePalWalletAdapter,
    GlowWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { useGameApi } from './gameApi';
import { useCookies } from 'react-cookie';

// require('@solana/wallet-adapter-react-ui/styles.css');

export const PlayerProvider: FC = (props) => {
    const network = WalletAdapterNetwork.Mainnet;

    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // const endpoint = 'https://ssc-dao.genesysgo.net';
    const endpoint = 'https://solana-api.projectserum.com';

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new BraveWalletAdapter(),
        new NightlyWalletAdapter(),
        new GlowWalletAdapter(),
        new SolletWalletAdapter(),
        new BitKeepWalletAdapter(),
        new Coin98WalletAdapter(),
        new CoinbaseWalletAdapter(),
        new ExodusWalletAdapter(),
        new SlopeWalletAdapter(),
        new SafePalWalletAdapter(),
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

const PlayerContext = React.createContext(undefined);
// const publicKey = new PublicKey('');

const PlayerProfileProvider = (props) => {
    const [ cookies ] = useCookies('veryrealnfts');
    const { gameApi } = useGameApi();
    const { connected, publicKey, wallet } = useWallet();
    const { connection } = useConnection();

    const [ ready, setReady ] = useState(false);
    const [ nfts, setNfts ] = useState();
    const [ ConnectionComponent, setConnectionComponent ] = useState(<WalletModalProvider>
        <WalletMultiButton/>
        <WalletDisconnectButton />
    </WalletModalProvider>);

    useEffect(() => {
        if (!gameApi) return;
        if (!publicKey) return;
        gameApi.forge.getPlayerNfts({ publicKey: publicKey.toBase58()}).then(res => {
            setNfts(res)
        });
        gameApi.setSession(publicKey.toBase58());
        setReady(true);
    }, [ gameApi, publicKey ])

    return (<PlayerContext.Provider value ={{ publicKey: ready ? publicKey : undefined, nfts, ConnectionComponent }}>
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, nfts, ConnectionComponent } = useContext(PlayerContext);
    return { publicKey, nfts, ConnectionComponent };
}


