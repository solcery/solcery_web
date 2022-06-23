import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Input, Button } from 'antd';
import { useCookies } from 'react-cookie';
import { useProject } from './project';
import { Alert } from 'antd';
import { useParams } from 'react-router-dom';

const UserContext = React.createContext(undefined);

export function UserProvider(props) {
	const [cookies, setCookie] = useCookies();
	const [user, setUser] = useState(undefined);
	const { projectName } = useParams();
	const { sageApi, setUserSession } = useProject();

	const [login, setLogin] = useState(undefined);
	const [password, setPassword] = useState(undefined);
	const [error, setError] = useState(undefined);

	const loadUser = useCallback((userData) => {
		if (!userData) return;
	    if (!userData.session) return;
	    if (!setUserSession) return;
			setUser(
				Object.assign(
					{
						id: userData._id,
						nick: userData.login,
					},
					userData.fields
				)
			);
	    setUserSession(userData.session)
	}, [ setUserSession ]);

	const reload = () => {
		sageApi.user.getById({ id: user.id }).then((res) => loadUser(res));
	};

	useEffect(() => {
		console.log(user, projectName, sageApi, cookies)
		if (user) return;
		if (!sageApi) return;
		if (!cookies[`session.${projectName}`]) return;
		sageApi.user.getSession({ session: cookies[`session.${projectName}`] }).then((res) => loadUser(res));
	}, [user, projectName, sageApi, cookies]);

	const auth = useCallback(() => {
		if (!login || !password) {
			setError('Please specify login and password!');
			return;
		}
		sageApi.user.login({ login, password }).then((res) => {
			const SESSION_LENGTH = 86400 * 30 * 1000;
			setCookie(`session.${projectName}`, res.session, {
				expires: new Date(new Date().getTime() + SESSION_LENGTH),
			});
			loadUser(res);
		});
	}, [login, password, projectName, setCookie, sageApi]);

	useEffect(() => {
		if (user && user.css) {
			var style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = user.css;
			if (document) {
				document.getElementsByTagName('head')[0].appendChild(style);
			}
		}
	}, [user]);

	if (!user && sageApi) return <></>;
	if (!user)
		return (
			<>
				<h1> Project name: { projectName } </h1>
				<Input
					placeholder="Login"
					onChange={(e) => {
						setLogin(e.target.value);
					}}
					onPressEnter={auth}
				/>
				<Input.Password
					placeholder="Password"
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					onPressEnter={auth}
				/>
				<Button onClick={auth}>LOGIN</Button>
				{error && <Alert message={error} banner={true} />}
			</>
		);
	return <UserContext.Provider value={Object.assign({ reload }, user)}>{props.children}</UserContext.Provider>;
}

export function useUser() {
	const { id, nick, css, layoutPresets, reload, readonlyBricks } = useContext(UserContext);
	return { id, nick, css, layoutPresets, reload, readonlyBricks };
}
