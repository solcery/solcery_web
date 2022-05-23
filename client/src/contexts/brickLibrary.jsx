import React, { useContext, useState, useEffect } from "react";
import { BrickLibrary, paramFromMapEntry } from '../content/brickLib';
import { SageAPI } from '../api'

const BrickLibraryContext = React.createContext(undefined);

export function BrickLibraryProvider(props) {
	const [ brickLibrary, setBrickLibrary ] = useState(undefined);

	useEffect(() => {
		let bl = new BrickLibrary();
		SageAPI.template.getAllObjects('customBricks').then(res => {
	    	let toAdd = res.filter(obj => obj.fields.brick && obj.fields.brick.brickTree).map(obj => {
		        return {
			        lib: obj.fields.brick.brickType,
			        func: `custom.${obj._id}`,
			        name: obj.fields.title,
			        params: obj.fields.brick.brickParams.map(entry => paramFromMapEntry(entry))
		        }
    		})
	   		for (let customBrick of toAdd) {
	   			bl.addBrick(customBrick);
	   		}
	    })
	    setBrickLibrary(bl.bricks);
	}, [])

    return (
      <BrickLibraryContext.Provider value={ brickLibrary }>
        {props.children}
      </BrickLibraryContext.Provider>
    );
  
}

export function useBrickLibrary() {
 	const brickLibrary = useContext(BrickLibraryContext);
	return { brickLibrary }
}