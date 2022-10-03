import React, { FC, useMemo, useContext, useEffect, useCallback, useState } from 'react';
import { FractalProvider } from '@fractalwagmi/react-sdk';
import { useAuth } from './index';
import { PublicKey } from '@solana/web3.js';

import {
    Scope,
    SignInWithFractal,
    User,
    FractalSDKError,
    useUserWallet,
    useUser,
    useSignOut,
} from '@fractalwagmi/react-sdk';

const FractalConnector = (props) => {
    const wallet = useUserWallet();
    const { signOut } = useSignOut();
    useEffect(() => {
        if (!wallet.data) return;
        let publicKey = new PublicKey(wallet.data.solanaPublicKeys[0]);
        props.onConnect(publicKey, signOut);
    }, [ wallet ])
    return;
}

const LoginButton = (props) => {
    const buttonProps = {
        style: {
            display: 'flex',
            margin: 'auto',
        },
    }
    return (<SignInWithFractal
        buttonProps={buttonProps}
        onError={(err) => {
            console.error(err.getUserFacingErrorMessage());
        }}
    />);
}

export const FractalAuth = (props) => {
    const { auth } = useAuth();
    const onConnect = (publicKey, signOut) => {
        auth(publicKey, signOut);
    }
    return (<FractalProvider clientId="DPgZkN8FRDJsYmVUfWzRgrexE83OlDUVOAkgcAsl48g">
        <LoginButton/>
        <FractalConnector onConnect={onConnect}/>
    </FractalProvider>);
};
