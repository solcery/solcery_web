import React, { useRef, useMemo, useContext, useCallback, useEffect, useState } from 'react';
import { useGameApi } from './gameApi';
import { useParams } from 'react-router-dom';
import { useAuth } from './auth';
import { GameProvider } from './game';
import { Game } from '../game';
import { io } from 'socket.io-client';
import { PublicKey } from '@solana/web3.js';

const PlayerContext = React.createContext(undefined);

export const PlayerProvider = (props) => {
    let { projectId } = useParams();
    const { gameApi, gameId } = useGameApi();
    const { publicKey } = useAuth();

    const ws = useRef();
    const [ nfts, setNfts ] = useState(undefined);
    const [ status, setStatus ] = useState(undefined);
    const game = useRef();
    const [ ingame, setIngame ] = useState(false);
    const storedGameUpdates = useRef([]);

    const onMatchUpdate = async (data) => {
        if (data.started) {
            let version = data.version;
            let res = await gameApi.getGameBuild(version);
            let myPlayerIndex = data.players.find(p => p.id === publicKey.toBase58()).index;
            data.content = res.content;
            data.unityBuild = res.unityBuild;
            data.onAction = onAction;
            data.playerIndex = myPlayerIndex;
            game.current = new Game(data);
            if (storedGameUpdates.current.length > 0) {
                game.current.updateLog(storedGameUpdates.current)
            }
            setIngame(true);
            return;
        }
        if (data.actionLog) {
            if (!game.current) {
                storedGameUpdates.current = data.actionLog;
                return;
            }
            game.current.updateLog(data.actionLog);
        }
    }

    const disconnect = (reason) => {
        setStatus();
        setIngame(false);
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

    const onAction = (action) => {
        if (!ws) throw 'No WebSocket';
        ws.current.emit('message', {
            type: 'action',
            data: action,
        });
    }

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
        if (!status) return;
        if (status.code !== 'ingame' && game) {
            delete game.current;
            setIngame(false);
        }
    }, [ status ])

    useEffect(() => {
        if (!game) return;
        for (let update of storedGameUpdates.current) {
            game.update(update);
        }
        storedGameUpdates.current = [];
    }, [ game ])

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

    let value = {
        publicKey
    };
    if (status) Object.assign(value, {
        status,
        nfts,
        playerRequest,
    })

    return (<PlayerContext.Provider value={value}>
        <GameProvider game={ingame && game.current}>
            { props.children }
        </GameProvider>
    </PlayerContext.Provider>);
}

export function usePlayer() {
    const { publicKey, status, nfts, playerRequest } = useContext(PlayerContext);
    return { publicKey, status, nfts, playerRequest }
}
