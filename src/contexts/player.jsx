import React, { useRef, useMemo, useContext, useCallback, useEffect, useState } from 'react';
import { useGameApi } from './gameApi';
import { useParams } from 'react-router-dom';
import { useAuth } from './auth';
import { GameProvider } from './game';
import { Game } from '../game';
import { io } from 'socket.io-client';

const PlayerContext = React.createContext(undefined);
// const publicKey = new PublicKey(''); // TODO: CHEAT

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

    const onGameStart = async (data) => {
        let version = data.version;
        let res = await gameApi.getGameVersion(version);
        let players = data.players;
        let myPlayerIndex = data.players.find(p => p.id = publicKey.toBase58()).index;
        data.content = res.content;
        data.unityBuild = res.unityBuild;
        data.onAction = onAction;
        data.playerIndex = myPlayerIndex;
        game.current = new Game(data);
        setIngame(true);
    }

    const onGameAction = (data) => {
        if (!game.current) {
            throw new Error('err');
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
        if (ws.current) return;
         
        ws.current = io(process.env.REACT_APP_WS_URL, {
          reconnectionDelayMax: 10000,
        });
        ws.current.on('message', onMessage);
        setStatus(undefined);
        let challenge = {
            type: 'challenge',
            data: {
                server: `game_${projectId}`,
                pubkey: publicKey,
            }
        }
        ws.current.emit('message', challenge)
    }, [ publicKey ])

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
