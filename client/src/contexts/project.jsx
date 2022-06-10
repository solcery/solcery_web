import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SageAPI } from "../api";

const ProjectContext = React.createContext(undefined);

export function ProjectProvider(props) {

  let { projectName } = useParams();
  useEffect(() => {
    SageAPI.connect(projectName)
  }, [ projectName ]);

  return (
    <ProjectContext.Provider value={{ projectName }}>
      {props.children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const { projectName } = useContext(ProjectContext);
  return { projectName };
}
