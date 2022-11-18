import React, { FC, useMemo, useContext, useEffect, useCallback, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
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
    GlowWalletAdapter,
    FractalWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { FractalProvider } from '@fractalwagmi/react-sdk';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
    WalletConnectButton,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { useAuth } from './index';

const network = WalletAdapterNetwork.Mainnet;
const wallets = [
    new FractalWalletAdapter(),
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
];
const endpoint = 'https://solana-api.projectserum.com';

// require('@solana/wallet-adapter-react-ui/styles.css');

const WalletsConnector = (props) => {
    const { publicKey, connect, connected, wallet } = useWallet();
    
    let connectCaption = 'Select wallet';
    if (wallet && wallet.adapter.name) {
        connectCaption = `Use ${wallet.adapter.name}`;
    }

    useEffect(() => {
        if (!publicKey) return;
        props.onConnect(publicKey);
    }, [ publicKey ])
    return (<WalletModalProvider>
        <WalletMultiButton className='menu-button'>{connectCaption}</WalletMultiButton>
        <WalletDisconnectButton className='menu-button'>Disconnect</WalletDisconnectButton>
    </WalletModalProvider>);
}

export const WalletsAuth = (props) => {
    const { auth } = useAuth();
    
    const onConnect = (publicKey) => {
        auth(publicKey);
    }

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletsConnector onConnect={onConnect}/>
            </WalletProvider>
        </ConnectionProvider>
    );
};

