import React, { useContext, useEffect, useState } from "react";
import { SageAPI } from '../api'

const UserContext = React.createContext(undefined);

export function UserProvider(props) {
	const [ user, setUser ] = useState(undefined);

	useEffect(() => {
		SageAPI.template.getAllObjects('users').then(res => {
			let userObject = res.find(usr => usr.fields.pubkey === '9kXLhvDcWc4wzuapQpWkKVnJ8wKVhEDomwoFxkn58nfX'); //TODO
			if (userObject) {
				setUser({
					css: userObject.fields.css,
				})
			}
		})
	}, [])

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

  return (
    <UserContext.Provider value = { user }>
      {props.children}
    </UserContext.Provider>
  );
  
}

export function useUser() {
 	const { css } = useContext(UserContext);
	return { css }
}
