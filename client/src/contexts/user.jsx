import React, { useContext, useEffect, useState, useCallback } from "react";
import { SageAPI } from "../api";
import { Input, Button } from "antd";
import { useCookies } from "react-cookie";
import { Alert } from "antd";

const UserContext = React.createContext(undefined);

export function UserProvider(props) {
  const [cookies, setCookie] = useCookies(["loggedAs", "projectName"]);
  const [user, setUser] = useState(undefined);

  const [login, setLogin] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const [projectName, setProjectName] = useState(undefined);
  const [error, setError] = useState(undefined);

  const loadUser = (userData) => {
    setUser({
      id: userData._id,
      css: userData.fields.css,
      layoutPresets: userData.fields.layoutPresets,
      readonlyBricks: userData.fields.readonlyBricks,
    });
  };

  const reload = (id) => {
    SageAPI.template.getObjectById("users", id).then((res) => loadUser(res));
  };

  useEffect(() => {
    if (user) return;
    let loggedAs = cookies.loggedAs;
    let lastProject = cookies.projectName;
    if (!loggedAs || !lastProject) return;
    SageAPI.connect(lastProject);
    SageAPI.template
      .getObjectById("users", loggedAs)
      .then((res) => loadUser(res));
  }, [user, cookies.loggedAs, cookies.projectName]);

  const auth = useCallback(() => {
    if (!projectName) {
      setError("Please enter project name!");
      return;
    }
    SageAPI.connect(projectName);
    if (!login || !password) {
      setError("Please specify login and password!");
      return;
    }
    SageAPI.template.getAllObjects("users").then((res) => {
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
      setCookie("loggedAs", userObject._id, {
        expires: new Date(new Date().getTime() + SESSION_LENGTH),
      });
      setCookie("projectName", projectName, {
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
          placeholder="Project name"
          onChange={(e) => {
            setProjectName(e.target.value);
          }}
        />
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
