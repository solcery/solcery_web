import React, { useContext, useEffect, useState } from "react";
import { BrickLibrary, paramFromMapEntry } from "../content/brickLib";
import { SageAPI } from "../api";

const BrickLibraryContext = React.createContext(undefined);

export function BrickLibraryProvider(props) {
  // const [ revision ] = useState(0);
  const [brickLibrary, setBrickLibrary] = useState(undefined);

  const load = () => {
    let bl = new BrickLibrary();
    SageAPI.template.getAllObjects("customBricks").then((res) => {
      let toAdd = res
        .filter((obj) => obj.fields.brick && obj.fields.brick.brickTree)
        .map((obj) => {
          let params = [];
          if (obj.fields.brick.brickParams) {
            params = obj.fields.brick.brickParams.map((entry) =>
              paramFromMapEntry(entry)
            );
          }
          return {
            lib: obj.fields.brick.brickType,
            func: `custom.${obj._id}`,
            name: obj.fields.name,
            hidden: obj.fields.hidden,
            params,
          };
        });
      for (let customBrick of toAdd) {
        bl.addBrick(customBrick);
      }
      setBrickLibrary(bl.bricks);
    });
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
