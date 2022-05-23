import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { BrickEditor } from '../editor/BrickEditor';
import React from "react";
import { BrickLibrary } from '../../../brickLib'

export const ValueRender = (props) => {
  const [ brickLib, setBrickLib ] = useState(new BrickLibrary())

  if (!props.onChange && !props.defaultValue) return <p>Empty</p>
  return (
    <>
      <ReactFlowProvider>
        <BrickEditor
          width = { 300 }
          height = { 200 }
          brickLibrary = { brickLib.bricks }
          brickTree = { props.defaultValue }
          type = { props.type }
          onChange = { props.onChange }
        />
      </ReactFlowProvider>
    </>
  );
}
