import React, { useState, useEffect, useRef } from 'react';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { Input } from 'antd'
import { getBrickLibColor } from '../Brick';

import './style.scss';

const DraggableComment = (props) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ 
      nodeType: 'comment',
      size: {
        width: 100,
        height: 80,
      }
    }));
    event.dataTransfer.effectAllowed = 'move';
  };
  return <div
    onDragStart={(event) => onDragStart(event)} 
    draggable
  >
    Comment
  </div>
}

const DraggableBrick = (props) => {
  const { lib, func, name, defaultParams } = props;
  const { brickLibrary } = useBrickLibrary();

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(brickLibrary.new(lib, func, defaultParams)));
    event.dataTransfer.effectAllowed = 'move';
  };

  return <div 
    className='brick-dnd' 
    onDragStart={(event) => onDragStart(event)} 
    draggable
  >
    <div className='brick-dnd-title'>{name}</div>
    <div className='brick-dnd-bg' style={{ backgroundColor: brickLibrary.getTypeColor(lib) }}/>
  </div>
}

export const BrickPanel = () => {
  const { brickLibrary, brickParams } = useBrickLibrary();

  const [ filter, setFilter ] = useState();
  const [ options, setOptions ] = useState([]);
  const [ maximized, setMaximized ] = useState(false);
  const inputRef = useRef();

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
  }

  useEffect(() => {
    if (!inputRef.current) return;
    if (maximized) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [ maximized ])

  return (
    <div className={`brick-panel ${maximized ? 'maximized' : ''}`}
      onMouseEnter={() => setMaximized(true)} 
      onMouseLeave={close}
    >
      <DraggableComment/>
      <Input 
        className='brick-list-filter' 
        disabled={!maximized}
        ref={inputRef}
        allowClear 
        placeholder='Filter...' 
        onChange={event => setFilter(event.target.value)}
      />
      <div className='brick-list'>
        {options.map((option, index) => <DraggableBrick 
          key={index} 
          {...option}
        />)}
      </div>
      
    </div>
  );
};