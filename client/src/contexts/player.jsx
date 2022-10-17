import React, { useRef, useMemo, useContext, useCallback, useEffect, useState } from 'react';
import { useGameApi } from './gameApi';
import { useParams } from 'react-router-dom';
import { useAuth } from './auth';
import { GameProvider } from './game';
import { Game } from '../game';
// import WebSocket from 'ws';

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
        let parsed = JSON.parse(message.data);
        if (parsed.type === 'playerStatus') {
            setStatus(parsed.data)
        }
        if (parsed.type === 'gameStart') {
            onGameStart(parsed.data);
        }
        if (parsed.type === 'gameAction') {
            onGameAction(parsed.data);
        }
    };

    const playerRequest = useCallback((data) => {
        if (!status) return;
        if (!ws) return;
        ws.send(JSON.stringify(data));
    }, [ ws, status ])

    const onAction = (action) => {
        if (!ws) throw 'No WebSocket';
        ws.send(JSON.stringify({
            type: 'action',
            data: action,
        }));
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
            connectToServer('ws://localhost:7000/ws').then(setWs);
            return;
        };
        setStatus(undefined)
        ws.onmessage = onMessage;
        let challenge = {
            type: 'challenge',
            data: {
                server: `game_${projectId}`,
                pubkey: publicKey,
            }
        }
        ws.send(JSON.stringify(challenge))
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
