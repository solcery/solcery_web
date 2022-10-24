import React, { useContext, useEffect, useState } from 'react';
import { SolceryAPI } from '../api';

const ApiContext = React.createContext(undefined);

export function ApiProvider(props) {
	const [ solceryAPI, setSolceryAPI ] = useState();

	useEffect(() => {
		new SolceryAPI({ url: 'https://solcery-server.herokuapp.com/api/' }).connect().then(api => {
			console.log(api)
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
