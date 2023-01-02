import React, { useContext, useEffect, useState, useCallback } from 'react';

const BrickContext = React.createContext(undefined);

export function BrickProvider(props) { // TODO

	const { brick, signature, selected } = props;

	return <BrickContext.Provider value={{ brick, signature, selected }}>
		{props.children}
	</BrickContext.Provider>
}

export function useBrick() {
	const { brick, signature, selected } = useContext(BrickContext);
	return { brick, signature, selected };
}
 