import React, { useContext, useEffect, useState } from 'react';
import { SolceryAPI } from '../api';

const ApiContext = React.createContext(undefined);

export function ApiProvider(props) {
	const [ solceryAPI, setSolceryAPI ] = useState();

	useEffect(() => {
		const url = process.env.REACT_APP_API_URL;
		new SolceryAPI({ url }).connect().then(api => {
			api.createAccessor().then(setSolceryAPI);
		})
	}, [])

	return <ApiContext.Provider value={{ solceryAPI }}>
		{props.children}
	</ApiContext.Provider>;
}

export function useApi() {
	const { solceryAPI } = useContext(ApiContext);
	return { solceryAPI };
}
