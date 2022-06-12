import React, { useContext, useEffect, useState } from "react";
import { BrickLibrary } from "../content/brickLib";
import { useProject } from "./project";

const BrickLibraryContext = React.createContext(undefined);

export function BrickLibraryProvider(props) {
  // const [ revision ] = useState(0);
  const { sageApi } = useProject()
  const [ brickLibrary, setBrickLibrary ] = useState(undefined);

  const load = async () => {
    let content = await sageApi.project.dump();
    let bl = new BrickLibrary(content);
    setBrickLibrary(bl.bricks);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <BrickLibraryContext.Provider value={{ brickLibrary, load }}>
      {props.children}
    </BrickLibraryContext.Provider>
  );
}

export function useBrickLibrary() {
  const { brickLibrary, load } = useContext(BrickLibraryContext);
  return { brickLibrary, load };
}
