import React, { useState } from 'react';
import { useBrickLibrary } from 'contexts/brickLibrary'
import { Input } from 'antd'
import { getBrickLibColor } from '../Brick';

import './style.scss';

const DraggableBrick = (props) => {
  const { lib, func, name } = props.brick;
  const { getBrickTypeStyle } = useBrickLibrary();
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return <div 
    className='brick-dnd' 
    style={getBrickTypeStyle(lib)}
    onDragStart={(event) => onDragStart(event, { lib, func })} 
    draggable
  >
    {name}
  </div>
}

export const BrickPanel = () => {
  const { brickLibrary } = useBrickLibrary();
  const [ filter, setFilter ] = useState();

  if (!brickLibrary) return;
  let bricks = [];
  for (let [ lib, funcs ] of Object.entries(brickLibrary)) {
    for (let [ func, brick ] of Object.entries(funcs)) {
      if (brick.hidden) continue;
      bricks.push({
        lib,
        func,
        name: brick.name
      })
    }
  }
  if (filter) {
    bricks = bricks.filter(b => b.name.toLowerCase().includes(filter.toLowerCase()));
  }
  return (
    <div className='brick-panel'>
      <Input allowClear placeholder='Filter...' onChange={event => setFilter(event.target.value)}/>
      <div className='brick-list'>
        {bricks.map((brick, index) => <DraggableBrick key={index} brick={brick}/>)}
      </div>
    </div>
  );
};