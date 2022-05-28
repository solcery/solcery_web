import { ReactFlowProvider } from 'react-flow-renderer';
import { BrickEditor } from './editor/BrickEditor';
import React, { useState, useEffect } from "react";
import { paramFromMapEntry } from "../../brickLib";
import { Select } from 'antd';
import { SType } from '../base';
import { insertTable } from '../../../utils';
import { useBrickLibrary } from '../../../contexts/brickLibrary';

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
    valueType: {
      name: 'SEnum',
      data: {
        values: [ 'action', 'condition', 'value' ],
        titles: [ 'Action', 'Condition', 'Value' ]
      }
    }
  }
})

export const ValueRender = (props) => {
  const [ brickType, setBrickType ] = useState(props.type.brickType ? props.type.brickType : props.defaultValue && props.defaultValue.brickType);
  const [ brickParams, setBrickParams ] = useState((props.type.params && props.defaultValue) ? props.defaultValue.brickParams : []);
  const [ brickTree, setBrickTree ] = useState(props.defaultValue && props.defaultValue.brickTree);
  const { brickLibrary } = useBrickLibrary();
  const [ brickLib, setBrickLib ] = useState(undefined);

  const onChange = (brickTree) => {
    setBrickTree(brickTree)
    if (props.onChange) props.onChange({ brickType, brickParams, brickTree });
  }

  useEffect(() => {
    if (!brickLibrary) return;
    let bricks = {}
    for (let [ libname, funcs ] of Object.entries(brickLibrary)) {
      bricks[libname] = Object.assign({}, funcs)
    }
    if (props.type.params) {
      let params = brickParams.filter(entry => entry.key !== '').map(entry => paramFromMapEntry(entry));
      params.forEach(param => {
        let arg = argFromParam(param);
        let argCode = arg.params[0].value;
        insertTable(bricks, arg, arg.lib, `arg.${argCode}`);  
      })
    }
    setBrickLib(bricks)
  }, [ brickParams, brickLibrary, props.type.params ])

  if (!brickLibrary) return <p>Loading</p>;
  if (!brickLib) return <p>Loading</p>;
  if (!props.onChange && (!props.defaultValue || !props.defaultValue.brickTree)) return <p>Empty</p>  
  if (!brickType) return <BrickTypeSelector onChange = { setBrickType }/>;

  return (
    <>
      {props.type.params && <>Params:
        <paramMapType.valueRender 
          defaultValue = { brickParams }
          type = { paramMapType }
          onChange = { props.onChange && setBrickParams }
        />
      </>}
      <ReactFlowProvider>
        <BrickEditor
          width = { 300 }
          height = { 200 }
          brickLibrary = { brickLib }
          brickTree = { brickTree }
          brickType = { brickType }
          type = { props.type }
          onChange = { props.onChange && onChange }
        />
      </ReactFlowProvider> 
    </>
  );
}
