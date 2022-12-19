import React, { useContext, useEffect, useState } from 'react';

const BrickParamsContext = React.createContext(undefined);

export function BrickParamsProvider(props) { // TODO
	const [ params, setParams ] = useState();

	useEffect(() => {
		setParams(props.params)
	}, [ props.params ])

	return <BrickParamsContext.Provider value={{ brickParams: params }}>
		{props.children}
	</BrickParamsContext.Provider>
}

export function useBrickParams() {
	const { brickParams } = useContext(BrickParamsContext);
	return { brickParams };
}
 