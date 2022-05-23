import { ReactFlowProvider } from 'react-flow-renderer';
import { BrickEditor } from '../editor/BrickEditor';
import React, { useState, useEffect } from "react";
import { BrickLibrary, paramFromMapEntry } from "../../../brickLib";
import { Select } from 'antd';
import { SType } from '../../base';
import { insertTable } from '../../../../utils';
import { useBrickLibrary } from '../../../../contexts/brickLibrary';

const { Option } = Select;

const argFromParam = (param) => {
  return {
    lib: param.type.brickType,
    func: `arg`,
    name: `Arg [${param.name}]`,
    params: [
      { code: 'name', name: 'Name', type: SType.from('SString'), value: param.code, readonly: true }
    ],
  }
}

const BrickTypeSelector = (props) => {
  return (
  <Select onChange = { props.onChange }>
    <Option key='action' value='action'>Action</Option>
    <Option key='condition' value='condition'>Condition</Option>
    <Option key='value' value='value'>Value</Option>
  </Select>);
}

const paramMapType = SType.from({
  name: 'SMap',
  data: {
    keyType: 'SString',
    valueType: 'SEnum<action|condition|value>',
  }
})

export const ValueRender = (props) => {
  const [ brickType, setBrickType ] = useState(props.defaultValue && props.defaultValue.brickType);
  const [ brickParams, setBrickParams ] = useState(props.defaultValue ? props.defaultValue.brickParams : []);
  const [ brickTree, setBrickTree ] = useState(props.defaultValue && props.defaultValue.brickTree);
  const { brickLibrary } = useBrickLibrary();
  const [ brickLib, setBrickLib ] = useState(undefined)

  const onChange = (newValue) => {
    if (props.onChange) props.onChange(newValue);
  }

  useEffect(() => {
    onChange({ brickType, brickTree, brickParams })
  }, [ brickParams, brickType, brickTree ])

  useEffect(() => {
    if (!brickLibrary) return;
    console.log(brickLibrary);
    let bricks = {}
    for (let [ libname, funcs ] of Object.entries(brickLibrary)) {
      bricks[libname] = Object.assign({}, funcs)
    }
    let params = brickParams.filter(entry => entry.key !== '').map(entry => paramFromMapEntry(entry));
    params.forEach(param => {
      let arg = argFromParam(param);
      let argCode = arg.params[0].value;
      insertTable(bricks, arg, arg.lib, `arg.${argCode}`);  
    })
    setBrickLib(bricks)
  }, [ brickParams, brickLibrary ])

  if (!brickLibrary) return <p>Loading</p>;
  if (!brickLib) return <p>Loading</p>;
  if (!props.onChange && !props.defaultValue) return <p>Empty</p>  
  if (!brickType) return <BrickTypeSelector onChange = { setBrickType }/>;

  return (
    <>
      <p>Params:</p>
      <paramMapType.valueRender 
        defaultValue = { brickParams }
        type = { paramMapType }
        onChange = { props.onChange && setBrickParams }
      />
      <ReactFlowProvider>
        <BrickEditor
          width = { 300 }
          height = { 200 }
          brickLibrary = { brickLib }
          brickTree = { brickTree }
          brickType = { brickType }
          type = { props.type }
          onChange = { setBrickTree }
        />
      </ReactFlowProvider> 
    </>
	);
}