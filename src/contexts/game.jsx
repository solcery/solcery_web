import React, { useContext, useEffect, useState, useCallback } from 'react';

const GameContext = React.createContext(undefined);

export const GameProvider = (props) => {
    const [ actionLog, setActionLog ] = useState();
    let game = props.game;

    const onGameLogUpdate = (log) => {
        setActionLog([...log]);
    }

    useEffect(() => {
        if (!game) return;
        if (game.onUpdate) return;
        game.onLogUpdate = onGameLogUpdate;
        setActionLog(game.actionLog);
    }, [ game ])

    return (<GameContext.Provider value={{ game, actionLog }}>
        { props.children }
    </GameContext.Provider>);
}

export function useGame() {
    const { game, actionLog } = useContext(GameContext);
    return { game, actionLog }
}