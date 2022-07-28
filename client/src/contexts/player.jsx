import React, { FC, useMemo, useContext, useEffect, useState } from 'react';
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
import { SageAPIConnection } from '../api';

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

const collections = [
    {
        name: 'SolGods',
        creators: [ 'ALNcW6QDNf7H4iNiTM3FD16LZ4zMGyEeCYQiE1AbCoXk' ],
        symbol: 'SOLGods'
    },
    {
        name: 'DegenApes',
        creators: [ 'DC2mkgwhy56w3viNtHDjJQmc7SGu2QX785bS4aexojwX' ],
        symbol: 'DAPE',
        vc: 'DSwfRF1jhhu6HpSuzaig1G19kzP73PfLZBPLofkw6fLD',
    },
    {
        name: 'Boryoku Dragonz',
        creators: [ 'DRGNjvBvnXNiQz9dTppGk1tAsVxtJsvhEmojEfBU3ezf' ],
        symbol: 'BORYOKU',
    },
    {
        name: 'Boryoku Baby Dragonz',
        creators: [ 'NAJ1KA8tTUssP7HcVkUqS7sTaKEpgqhTDxW8GCjkVCe' ],
        symbol: 'BORYOKU',
    },
    {
        name: 'SMB',
        creators: [ '9uBX3ASjxWvNBAD1xjbVaKA74mWGZys3RGSF7DdeDD3F' ],
        symbol: 'SMB',
        vc: 'SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND',
    },
    {
        name: 'Okay Bears',
        creators: [ '3xVDoLaecZwXXtN59o6T3Gfxwjcgf8Hc9RfoqBn995P9' ],
        symbol: 'okay_bears',
    },
    {
        name: 'DeGods',
        creators: [ '9MynErYQ5Qi6obp4YwwdoDmXkZ1hYVtPUqYmJJ3rZ9Kn', 'AxFuniPo7RaDgPH6Gizf4GZmLQFc4M5ipckeeZfkrPNn' ],
        symbol: 'DGOD',
        vc: '6XxjKYFbcndh2gDcsUrmZgVEsoDxXMnfsaGY6fpTJzNr',
    },
]

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
    const { connection } = useConnection();

    const sageApi = new SageAPIConnection('nfts');

    const loadNfts = async(mints) => {
        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(wallet))
            .use(bundlrStorage());

        const nftDatas = await metaplex
            .nfts()
            .findAllByMintList(mints)
            .run();

        let collections = await sageApi.project.getContent({ objects: true })
        collections = collections.objects

        let res = []
        for (let nft of nftDatas) {
            let collection = checkNftForAllCollections(nft, collections);
            if (!collection) return undefined;
            res.push({ nft, collection });
        }
        setNfts(res);
    }

    useEffect(() => {
        if (!connection || !publicKey) return;
        //fake nfts
        let fakeMints = fakeNfsMints.map(stringMintPubkey => new PublicKey(stringMintPubkey))
        loadNfts(fakeMints);
    }, [ connected, publicKey, connection ])

    useEffect(() => {
        console.log(nfts)
    }, [ nfts ])

    if (!connected) return (<>
        <WalletModalProvider>
            <WalletMultiButton />
            <WalletDisconnectButton />
        </WalletModalProvider>
    </>);

    return (<PlayerContext.Provider value ={{ publicKey }}>
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, nfts } = useContext(PlayerContext);
    return { publicKey, nfts };
}


