import React, { useRef, useMemo, useContext, useCallback, useEffect, useState } from 'react';
import { useGameApi } from '../gameApi';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { io } from 'socket.io-client';
import { PublicKey } from '@solana/web3.js';
import { Blackout } from '../../components/blackout';
import { MenuButton } from '../../components/menuButton';
import { BigLoader } from '../../components/bigLoader';

import './style.scss'

const PlayerContext = React.createContext(undefined);

const Auth = (props) => {
    const { AuthComponent } = useAuth();
    return <Blackout
        header='Welcome to Soulcery!'
        message='Please log in with you preferred wallet'
    >
        <AuthComponent/>
    </Blackout>;
}

const Connect = () => {
    const { disconnect } = useAuth();
    return <Blackout header='No connection with server'>
        <BigLoader caption='Connecting...'/>
        <MenuButton onClick={disconnect}>Log out</MenuButton>
    </Blackout>
}


export const PlayerProvider = (props) => {
    let { projectId } = useParams();
    const { gameApi, gameId } = useGameApi();
    const { publicKey, AuthComponent } = useAuth();

    const ws = useRef();
    const [ nfts, setNfts ] = useState(undefined);
    const [ status, setStatus ] = useState(undefined);
    const [ match, setMatch ] = useState(undefined);
    const matchData = useRef();

    const onMatchUpdate = (data) => {
        if (!data.id) return;
        if (!matchData.current || (matchData.current.id !== data.id)) {
            matchData.current = data;
            setMatch({ ...matchData.current });
            return;
        }
        Object.assign(matchData.current, data);
        setMatch({ ...matchData.current });
    };

    const disconnect = (reason) => {
        setStatus();
    }

    const onDisconnect = (reason) => {
        disconnect();
        if (reason === "io server disconnect") {
            setTimeout(() => {
                ws.current.connect();
            }, 2000);
        }
    }

    const onConnect = () => {
        challenge(publicKey)
    }

    const onReconnect = () => {
        challenge(publicKey)
    }

    const onException = (data) => {
    }

    const onMessage = (message) => {
        if (message.type === 'playerStatus') {
            setStatus(message.data)
        }
        if (message.type === 'matchUpdate') {
            onMatchUpdate(message.data);
        }
        if (message.type === 'nfts') {
            setNfts(message.data);
        }
    };

    const playerRequest = useCallback((data) => {
        if (!status) return;
        if (!ws.current) return;
        ws.current.emit('message', data);
    }, [ status ])

    const challenge = (publicKey) => {
        let challenge = {
            type: 'challenge',
            data: {
                server: gameId,
                pubkey: publicKey,
            }
        }
        ws.current.emit('message', challenge)
    }

    useEffect(() => {
        setStatus();
        if (!publicKey) {
            if (ws.current) {
                ws.current.disconnect();
                ws.current = undefined;
            }
            disconnect();
            return;
        };
        ws.current = io(process.env.REACT_APP_WS_URL, {
          reconnectionDelayMax: 10000,
        });
        ws.current.on('message', onMessage);
        ws.current.on('disconnect', onDisconnect);
        ws.current.on('connect', onConnect);
        ws.current.on('reconnect', onReconnect);
        ws.current.on('exception', onException);
    }, [ publicKey ])

    return (<PlayerContext.Provider value={{ publicKey, status, nfts, playerRequest, match }}>
        {!publicKey && <Auth/>}
        {publicKey && !status && <Connect/>}
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, status, nfts, playerRequest, match } = useContext(PlayerContext);
    return { publicKey, status, nfts, playerRequest, match }
}
