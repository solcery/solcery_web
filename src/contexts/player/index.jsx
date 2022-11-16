import React, { useRef, useMemo, useContext, useCallback, useEffect, useState } from 'react';
import { useGameApi } from '../gameApi';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { io } from 'socket.io-client';
import { PublicKey } from '@solana/web3.js';

import './style.scss'

const PlayerContext = React.createContext(undefined);

const Auth = (props) => {
    const { status, publicKey } = usePlayer();
    const { AuthComponent } = useAuth();
    if (publicKey && status) return;
    return <div className='auth'>
        <div className='auth-header'>
            Login
        </div>
        {publicKey && <div className='auth-body'>
            <p>Logged as {publicKey.toBase58().substring(0, 10) + '...'}</p>
            <p>Establishing connection with server</p>
        </div>}
        {!publicKey && <div className='auth-body'>
                <AuthComponent/>
        </div>}
    </div>
}


export const PlayerProvider = (props) => {
    let { projectId } = useParams();
    const { gameApi, gameId } = useGameApi();
    const { publicKey, AuthComponent } = useAuth();

    const ws = useRef();
    const [ nfts, setNfts ] = useState(undefined);
    const [ status, setStatus ] = useState(undefined);
    const [ match, setMatch ] = useState(undefined);

    const onMatchUpdate = async (data) => {
        if (!data.id) return;
        if (!match || match.id !== data.id) {
            setMatch(data);
            return;
        }
        setMatch(Object.assign({}, match, data));
    }

    const disconnect = (reason) => {
        setStatus();
    }

    const onDisconnect = (reason) => {
        if (reason === 'transport close') {
            disconnect();
        }
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
                ws.current.emit('disconnect');
            }
            disconnect();
            return;
        };
        ws.current = io(process.env.REACT_APP_WS_URL, {
          reconnectionDelayMax: 10000,
        });
        ws.current.on('message', onMessage);
        ws.current.on('disconnect', onDisconnect);
        ws.current.on('connect', () => challenge(publicKey));
        ws.current.on('reconnect', () => challenge(publicKey));
    }, [ publicKey ])

    return (<PlayerContext.Provider value={{ publicKey, status, nfts, playerRequest, match }}>
        {(!publicKey || !status) && <div className='blackout'>
            <Auth/>
        </div>}
        { props.children }
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, status, nfts, playerRequest, match } = useContext(PlayerContext);
    return { publicKey, status, nfts, playerRequest, match }
}
