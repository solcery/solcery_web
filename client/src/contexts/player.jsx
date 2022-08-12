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
import { SolceryAPIConnection } from '../api';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const Player: FC = (props) => {
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <PlayerProvider>
                    {props.children}
                </PlayerProvider>
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

const checkNftForAllCollections = (nft, collections) => {
    for (let collection of collections) {
        if (checkNftForCollection(nft, collection)) return collection;
    }
}


const checkNftForCollection = (nft, collection) => {
    let collectionFields = collection.fields
    if (collectionFields.symbol !== nft.symbol) return false;
    let verifiedCreators = nft.creators.filter(creator => creator.verified);
    for (let creator of verifiedCreators) {
        if (!collectionFields.creators.includes(creator.address.toBase58())) return false;
    }
    if (collectionFields.vc) {
        if (!nft.collection) return false;
        if (!nft.collection.verified) return false;
        if (nft.collection.key.toBase58() !== collectionFields.vc) return false;
    }
    return true;
}

const PlayerContext = React.createContext(undefined);


const PlayerProvider = (props) => {
    const { connected, publicKey, wallet } = useWallet();
    const [ nfts, setNfts ] = useState();
    const [ nftMints, setNftMints ] = useState();
    const { connection } = useConnection();

    const sageApi = new SolceryAPIConnection('nfts', { modules: [ 'template' ]});

    const loadNfts = async () => {
        if (!wallet) return;
        let mints = fakeNfsMints.map(stringMintPubkey => new PublicKey(stringMintPubkey))

        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(wallet))
            .use(bundlrStorage());

        const nftDatas = await metaplex
            .nfts()
            .findAllByMintList(mints)
            .run();

        let collections = await sageApi.template.getAllObjects({ template: 'collections' })

        let res = [];
        for (let nft of nftDatas) {
            let collection = checkNftForAllCollections(nft, collections);
            if (!collection) return undefined;
            res.push({ nft, collection });
        }
        let loadedNfts = await Promise.all(res.map(async ({ nft, collection }) => ({
            collection,
            nft: await metaplex.nfts().loadNft(nft).run(),
        })));
        loadedNfts = loadedNfts.map(({ nft, collection }) => ({
            collection: collection._id,
            name: nft.name,
            image: nft.json.image, 
            mint: nft.mint.address.toBase58(),
        }));
        setNfts(loadedNfts);
    }

    useEffect(() => {
        if (!connection || !publicKey) return;
        //fake nfts
    }, [ connected, publicKey, connection ])

    if (!connected) return (<>
        <WalletModalProvider>
            <WalletMultiButton />
            <WalletDisconnectButton />
        </WalletModalProvider>
    </>);

    return (<PlayerContext.Provider value ={{ publicKey, nfts, loadNfts }}>
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, nfts, loadNfts } = useContext(PlayerContext);
    return { publicKey, nfts, loadNfts };
}


