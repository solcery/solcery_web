import React, { useContext, useEffect, useState, useCallback } from 'react';

const BrickContext = React.createContext(undefined);

export function BrickProvider(props) { // TODO

	const { brick, signature } = props;

	return <BrickContext.Provider value={{ brick, signature }}>
		{props.children}
	</BrickContext.Provider>
}

export function useBrick() {
	const { brick, signature } = useContext(BrickContext);
	return { brick, signature };
}
 