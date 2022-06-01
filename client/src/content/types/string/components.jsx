import { useState } from "react";
import { Input, Button } from "antd";
import { Link, useLocation } from 'react-router-dom';

export const ValueRender = ({ defaultValue, type, onChange, object }) => {
  const { pathname } = useLocation(); //TODO
  if (!onChange) {
    if (type.isPrimaryTitle && object) {
      return <Link to={`${pathname}.${object._id}`}>{ defaultValue }</Link>
    }
    else {
      return <>{ defaultValue }</>
    }
  }
  return (
    type.textArea ?
    <Input.TextArea
      style={{ width: `${type.width ? type.width : 800}px` }}
      type="text"
      rows={type.textArea.rows ?? 5}
      defaultValue={defaultValue}
      onChange={(event) => {
        onChange && onChange(event.target.value);
      }}
    />
    :
    <Input
      style={{ width: `${type.width ? type.width : 800}px` }}
      type="text"
      defaultValue={defaultValue}
      onChange={(event) => {
        onChange && onChange(event.target.value);
      }}
    />
  );
};

export const FilterRender = ({ defaultValue, onChange, type }) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <type.valueRender
        defaultValue={defaultValue}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onPressEnter={() => onChange(value)}
      />
      <Button onClick={() => onChange(value)}>APPLY</Button>
      <Button onClick={() => onChange(undefined)}>CLEAR</Button>
    </div>
  );
};
