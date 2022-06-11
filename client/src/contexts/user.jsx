import React, { useContext, useEffect, useState, useCallback } from "react";
import { Input, Button } from "antd";
import { useCookies } from "react-cookie";
import { useProject } from './project'
import { Alert } from "antd";

const UserContext = React.createContext(undefined);

export function UserProvider(props) {

  const [cookies, setCookie] = useCookies();
  const [user, setUser] = useState(undefined);
  const { projectName, sageApi} = useProject();

  const [login, setLogin] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const [error, setError] = useState(undefined);

  const loadUser = (userData) => {
    if (!userData) return;
    setUser({
      id: userData._id,
      css: userData.fields.css,
      layoutPresets: userData.fields.layoutPresets,
      readonlyBricks: userData.fields.readonlyBricks,
    });
  };

  const reload = (id) => {
    sageApi.template.getObjectById({ template: "users", objectId: id }).then((res) => loadUser(res));
  };

  useEffect(() => {
    if (user) return;
    if (!sageApi) return;
    if (!cookies[`session.${projectName}`]) return;
    sageApi.template
      .getObjectById({ template: "users", objectId: cookies[`session.${projectName}`] })
      .then((res) => loadUser(res));
  }, [ user, projectName, sageApi ]);

  const auth = useCallback(() => {
    if (!login || !password) {
      setError("Please specify login and password!");
      return;
    }
    sageApi.template.getAllObjects({ template: "users" }).then((res) => {
      let userObject = res.find((usr) => usr.fields.name === login);
      if (!userObject) {
        setError(`Incorrect username '${login}' for project '${projectName}'!`);
        return;
      }
      if (userObject.fields.password !== password) {
        setError(`Incorrect password!`);
        return;
      }
      const SESSION_LENGTH = 86400 * 30 * 1000;
      setCookie(`session.${projectName}`, userObject._id, {
        expires: new Date(new Date().getTime() + SESSION_LENGTH),
      });
      loadUser(userObject);
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
  const { id, css, layoutPresets, reload, readonlyBricks } =
    useContext(UserContext);
  return { id, css, layoutPresets, reload, readonlyBricks };
}
