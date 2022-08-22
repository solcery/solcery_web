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
import { useCookies } from 'react-cookie';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// require('@solana/wallet-adapter-react-ui/styles.css');

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

const PlayerContext = React.createContext(undefined);

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

    const getWalletNfts = async (connection, publicKey) => {
        let mints = await connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })
        const metaplex = new Metaplex(connection);
        let nftDatas = await metaplex
            .nfts()
            .findAllByMintList({ mints })
            .run();
        let res = [];
        for (let nftData of nftDatas) {
            if (nftData) {
                res.push(nftData.mintAddress.toBase58())
            }
        }
        return res;
    }

    useEffect(() => {
        if (!wallet) return;
        if (!publicKey) return;
        if (cookies.veryrealnfts) {
            let mints = cookies.veryrealnfts.split(',');
            setNfts(mints);
            return;
        }
        getWalletNfts(connection, publicKey).then(setNfts)
    }, [ cookies, connected, publicKey, connection ])

    useEffect(() => {
        if (!gameApi) return;
        if (!publicKey) return;
        if (!nfts) return;
        gameApi.setSession(publicKey.toBase58());
        setReady(true);
    }, [ nfts, gameApi, publicKey ])

    return (<PlayerContext.Provider value ={{ publicKey: ready ? publicKey : undefined, nfts, ConnectionComponent }}>
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, nfts, ConnectionComponent } = useContext(PlayerContext);
    return { publicKey, nfts, ConnectionComponent };
}


