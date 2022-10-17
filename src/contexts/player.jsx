import React, { useRef, useMemo, useContext, useCallback, useEffect, useState } from 'react';
import { useGameApi } from './gameApi';
import { useParams } from 'react-router-dom';
import { useAuth } from './auth';
import { GameProvider } from './game';
import { Game } from '../game';
import { io } from 'socket.io-client';

const PlayerContext = React.createContext(undefined);
// const publicKey = new PublicKey(''); // TODO: CHEAT

async function connectToServer(url) { // TODO: move to independent class
    let connected = false;
    var ws = new WebSocket(url);
    return new Promise((resolve, reject) => {
        // setTimeout(function() {
        //     if (!connected) reject('Socket timeout: Failed to handshake');
        // }, 5000);
        ws.onopen = () => {
            connected = true;
            resolve(ws);
        }
    });
}

export const PlayerProvider = (props) => {
    let { projectId } = useParams();
    const { gameApi, gameId } = useGameApi();
    const { publicKey } = useAuth();

    const [ ws, setWs ] = useState();
    const [ nfts, setNfts ] = useState(undefined);
    const [ status, setStatus ] = useState(undefined);
    const game = useRef();
    const [ ingame, setIngame ] = useState(false);
    const storedGameUpdates = useRef([]);

    const onGameStart = async (data) => {
        let version = data.version;
        let res = await gameApi.call('game.getGameVersion', { gameId, version });
        data.content = res.content;
        data.unityBuild = res.unityBuild;
        data.onAction = onAction;
        data.playerPubkey = publicKey.toBase58();
        game.current = new Game(data);
        setIngame(true);
    }

    const onGameAction = (data) => {
        if (!game.current) {
            throw new Error('err')
            // storedGameUpdates.current.push(data);
            return;
        }
        game.current.updateLog(data.actionLog);
    }

    const onMessage = (message) => {
        if (message.type === 'playerStatus') {
            setStatus(message.data)
        }
        if (message.type === 'gameStart') {
            onGameStart(message.data);
        }
        if (message.type === 'gameAction') {
            onGameAction(message.data);
        }
    };

    const playerRequest = useCallback((data) => {
        if (!status) return;
        if (!ws) return;
        ws.emit('message', data);
    }, [ ws, status ])

    const onAction = (action) => {
        if (!ws) throw 'No WebSocket';
        ws.emit('message', {
            type: 'action',
            data: action,
        });
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
        if (!publicKey) return;
        if (!ws) {
            const socket = io('ws://solcery-server.herokuapp.com', {
              reconnectionDelayMax: 10000,
            });
            socket.on('message', onMessage)
            setWs(socket);
            return
        };
        setStatus(undefined);
        let challenge = {
            type: 'challenge',
            data: {
                server: `game_${projectId}`,
                pubkey: publicKey,
            }
        }
        ws.emit('message', challenge)
    }, [ publicKey, ws ])

    let value = status ? {
        publicKey,
        status,
        nfts: [],
        playerRequest,
    } : {};

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
