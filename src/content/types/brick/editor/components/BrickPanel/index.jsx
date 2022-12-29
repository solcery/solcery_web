import React, { useState, useEffect } from 'react';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { Input } from 'antd'
import { getBrickLibColor } from '../Brick';

import './style.scss';

const DraggableBrick = (props) => {
  const { lib, func, name, defaultParams } = props;
  const { brickLibrary } = useBrickLibrary();

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(brickLibrary.new(lib, func, defaultParams)));
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
  const [ maximized, setMaximized ] = useState(false);

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

  const close = () => {
    setMaximized(false);
    setFilter()
  }


  return (
    <div className='brick-panel' 
      onMouseEnter={() => setMaximized(true)} 
      onMouseLeave={close}
    >
      {maximized && <Input autoFocus allowClear placeholder='Filter...' onChange={event => setFilter(event.target.value)}/>}
      {maximized && <div className='brick-list'>
        {options.map((option, index) => <DraggableBrick 
          key={index} 
          {...option}
        />)}
      </div>}
      {!maximized && <div className='open-icon'/>}
    </div>
  );
};