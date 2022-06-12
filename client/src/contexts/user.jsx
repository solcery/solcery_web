import React, { useContext, useEffect, useState, useCallback } from "react";
import { Input, Button } from "antd";
import { useCookies } from "react-cookie";
import { useProject } from './project'
import { Alert } from "antd";

const UserContext = React.createContext(undefined);

export function UserProvider(props) {

  const [ cookies, setCookie ] = useCookies();
  const [ user, setUser ] = useState(undefined);
  const { projectName, sageApi } = useProject();

  const [login, setLogin] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const [error, setError] = useState(undefined);

  const loadUser = (userData) => {
    if (!userData) return;
    setUser(Object.assign({
      id: userData._id,
      nick: userData.login,
    }, userData.fields));
  };

  const reload = () => {
    sageApi.user.get({ id: user.id }).then((res) => loadUser(res));
  };

  useEffect(() => {
    if (user) return;
    if (!sageApi) return;
    if (!cookies[`session.${projectName}`]) return;
    sageApi.user.get({ id: cookies[`session.${projectName}`] })
      .then((res) => loadUser(res));
  }, [ user, projectName, sageApi ]);

  const auth = useCallback(() => {
    if (!login || !password) {
      setError("Please specify login and password!");
      return;
    }
    sageApi.user.login({ login, password }).then((res) => {
      const SESSION_LENGTH = 86400 * 30 * 1000;
      setCookie(`session.${projectName}`, res._id, {
        expires: new Date(new Date().getTime() + SESSION_LENGTH),
      });
      loadUser(res);
    });
  }, [login, password, projectName, setCookie]);

  useEffect(() => {
    if (user && user.css) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML = user.css;
      if (document) {
        document.getElementsByTagName("head")[0].appendChild(style);
      }
    }
  }, [user]);

  if (!user)
    return (
      <>
        <Input
          placeholder="Login"
          onChange={(e) => {
            setLogin(e.target.value);
          }}
        />
        <Input.Password
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <Button onClick={auth}>LOGIN</Button>
        {error && <Alert message={error} banner={true} />}
      </>
    );
  return (
    <UserContext.Provider value={Object.assign({ reload }, user)}>
      {props.children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const { id, nick, css, layoutPresets, reload, readonlyBricks } =
    useContext(UserContext);
  return { id, nick, css, layoutPresets, reload, readonlyBricks };
}
