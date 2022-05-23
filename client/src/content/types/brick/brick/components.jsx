import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { BrickEditor } from '../editor/BrickEditor';
import React from "react";
import { BrickLibrary } from '../../../brickLib'
import { useBrickLibrary } from '../../../../contexts/brickLibrary';

export const ValueRender = (props) => {
  const { brickLibrary } = useBrickLibrary();
  if (!props.onChange && !props.defaultValue) return <p>Empty</p>
  if (!brickLibrary) return (<p>Loading</p>)
  return (
    <>
      <ReactFlowProvider>
        <BrickEditor
          width = { 300 }
          height = { 200 }
          brickLibrary = { brickLibrary }
          brickTree = { props.defaultValue }
          brickType = { props.type.brickType }
          type = { props.type }
          onChange = { props.onChange }
        />
      </ReactFlowProvider>
    </>
  );
}
