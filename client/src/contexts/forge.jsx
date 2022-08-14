import React, { useContext, useEffect, useCallback, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react/lib/cjs';
import { PublicKey } from '@solana/web3.js';
import { Metaplex } from "@metaplex-foundation/js";
import { SolceryAPIConnection } from '../api';
import { useGameApi } from './gameApi';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

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

const ForgeContext = React.createContext(undefined);

export const ForgeProvider = (props) => {
    const { connection } = useConnection();
    const [ forgeApi, setForgeApi ] = useState();
    const [ forge, setForge ] = useState();

    useEffect(() => {
        if (!connection) return;
        let api = new SolceryAPIConnection('nfts', { modules: [ 'template' ]});
        setForgeApi(api);
    }, [ connection ]);

    useEffect(() => {
        if (!forgeApi) return;
        const getNfts = async (mints, contentVersion) => { // TODO: optimize requests
            const metaplex = new Metaplex(connection);
            mints = mints.map(stringMintPubkey => new PublicKey(stringMintPubkey));
            const nftDatas = await metaplex
                .nfts()
                .findAllByMintList(mints)
                .run();
            let res = [];
            let collections = await forgeApi.template.getAllObjects({ template: 'collections' })
            if (contentVersion) {
                let supportedCollections = contentVersion.content.web.collections
                let collectionFilter = Object.values(supportedCollections).map(col => col.collection);
                collections = collections.filter(col => collectionFilter.includes(col._id));
            }
            for (let nft of nftDatas) {
                let collection = checkNftForAllCollections(nft, collections);
                if (!collection) continue;
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
            return loadedNfts;
        }
        setForge({
            getNfts
        })
    }, [ forgeApi ])

    return (<ForgeContext.Provider value ={{ forge }}>
        { props.children }
    </ForgeContext.Provider>);
}

export function useForge() {
    const { forge } = useContext(ForgeContext);
    return { forge };
}
