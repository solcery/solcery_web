import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Input, Button } from 'antd';
import { useCookies } from 'react-cookie';
import { useProject } from './project';
import { useAuth } from './auth';
import { Alert } from 'antd';

const UserContext = React.createContext(undefined);


export function UserProvider(props) {
	const [cookies, setCookie] = useCookies();
	const { publicKey, AuthComponent } = useAuth();
	const [ userId, setUserId ] = useState();
	const [user, setUser] = useState(undefined);
	const { projectId } = useProject();
	const { engine } = useProject();

	useEffect(() => {
		if (userId) return;
		setUserId('TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz')
		// if (publicKey) {
		// 	setUserId(publicKey.toBase58());
		// 	return;
		// };
		// if (cookies[`${projectId}.session`]) {
		// 	setUserId(cookies[`${projectId}.session`]);
		// 	return;
		// }
	}, [ publicKey, cookies ])

	useEffect(() => {
		if (!userId) return;
		const SESSION_LENGTH = 86400 * 30 * 1000;
		setCookie(`${projectId}.session`, userId, {
			expires: new Date(new Date().getTime() + SESSION_LENGTH),
			path: '/',
		});
	}, [ userId ])

	useEffect(() => {
		if (!engine) return;
		if (!userId) return;
 		engine.setAccessParam('pubkey', userId);
		engine.user(userId).get().then(res => {
			setUser(Object.assign({ userId, }, res.fields))
		});
	}, [ userId, engine ])

	useEffect(() => {
		if (user && user.css) {
			var style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = user.css;
			if (document) {
				document.getElementsByTagName('head')[0].appendChild(style);
			}
		}
	}, [ user ]);

	if (!user) return <AuthComponent/>;
	return <UserContext.Provider value={user}>
		{props.children}
	</UserContext.Provider>;
}

export function useUser() {
	const user = useContext(UserContext);
	return user;
}
