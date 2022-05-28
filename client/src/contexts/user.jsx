import React, { useContext, useEffect, useState, useCallback } from "react";
import { SageAPI } from '../api'
import { Input, Button } from 'antd';
import { useCookies } from 'react-cookie';

const UserContext = React.createContext(undefined);

export function UserProvider(props) {
	const [ cookies, setCookie, removeCookie ] = useCookies(['loggedAs']);
	const [ user, setUser ] = useState(undefined);
	const [ login, setLogin ] = useState(undefined);
	const [ password, setPassword ] = useState(undefined);

	useEffect(() => {
		if (user) return;
		let loggedAs = cookies.loggedAs;
		if (!loggedAs) return;
		SageAPI.template.getObjectById('users', loggedAs).then(loadUser)
	}, [ user ])

	const reload = (id) => {
		SageAPI.template.getObjectById('users', id).then(loadUser)
	}

	const loadUser = (userData) => {
		setUser({
			id: userData._id,
			css: userData.fields.css,
			layoutPresets: userData.fields.layoutPresets,
			reload
		})
	}

	const auth = (login, password) => {
		if (!login || !password) return;
		SageAPI.template.getAllObjects('users').then(res => {
			let userObject = res.find(usr => usr.fields.name === login);
			if (!userObject) return; //TODO: no user
			if (userObject.fields.password !== password) return; // TODO: wrong pass
			const SESSION_LENGTH = 86400 * 30 * 1000;
			setCookie('loggedAs', userObject._id, {
					expires: new Date((new Date()).getTime() + SESSION_LENGTH)
			})
			loadUser(userObject);
		})
	}

	// useEffect(() => {
	// 	SageAPI.template.getAllObjects('users').then(res => {
	// 		let userObject = res.find(usr => usr.fields.pubkey === '9kXLhvDcWc4wzuapQpWkKVnJ8wKVhEDomwoFxkn58nfX'); //TODO
	// 		if (userObject) {
	// 			setUser({
	// 				css: userObject.fields.css,
	// 			})
	// 		}
	// 	})
	// }, [])

	useEffect(() => {
		if (user && user.css) {
			var style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = user.css;
			if (document) {
				document.getElementsByTagName('head')[0].appendChild(style);
			}
		}
	}, [ user ])

	if (!user) return (<>
			<Input placeholder = 'login' onChange={e => setLogin(e.target.value)}/>
			<Input.Password placeholder = 'password' onChange={e => setPassword(e.target.value)}/>
			<Button onClick={auth}>LOGIN</Button>
		</>);
  return (
    <UserContext.Provider value = { user }>
      {props.children}
    </UserContext.Provider>
  );
  
}

export function useUser() {
 	const { id, css, layoutPresets, reload } = useContext(UserContext);
	return { id, css, layoutPresets, reload }
}
