import React, { useState, useEffect } from 'react';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { Input } from 'antd'
import { getBrickLibColor } from '../Brick';

import './style.scss';

const DraggableBrick = (props) => {
  const { lib, func, name, defaultParams } = props;
  const { brickLibrary } = useBrickLibrary();

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ lib, func, defaultParams }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return <div 
    className='brick-dnd' 
    style={{ backgroundColor: brickLibrary.getTypeColor(lib) }}
    onDragStart={(event) => onDragStart(event)} 
    draggable
  >
    {name}
  </div>
}

export const BrickPanel = () => {
  const { brickLibrary, brickParams } = useBrickLibrary();

  const [ filter, setFilter ] = useState();
  const [ options, setOptions ] = useState([]);

  useEffect(() => {
    if (!brickLibrary) return;
    let newOptions = brickLibrary.getBricks()
      .filter(brick => !brick.hidden)
      .map(brick => ({
        lib: brick.lib,
        func: brick.func,
        name: brick.name,
      }));
      
    if (brickParams) {
      for (let param of brickParams) {
        newOptions.push({
          lib: param.type,
          func: 'arg',
          name: `Arg [${param.name}]`,
          defaultParams: {
            name: param.name,
          }
        })
      }
    }

    if (filter) {
      newOptions = newOptions.filter(b => b.name.toLowerCase().includes(filter.toLowerCase()));
    }
    setOptions(newOptions);
  }, [ brickLibrary, brickParams, filter ])


  return (
    <div className='brick-panel'>
      <Input allowClear placeholder='Filter...' onChange={event => setFilter(event.target.value)}/>
      <div className='brick-list'>
        {options.map((option, index) => <DraggableBrick 
          key={index} 
          {...option}
        />)}
      </div>
    </div>
  );
};