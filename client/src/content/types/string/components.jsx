import { useState } from "react";
import { Input, Button } from "antd";

export const ValueRender = ({ defaultValue, type, onChange }) => {
  if (!onChange) return <>{defaultValue}</>;

  return (
    <Input
      style={{ width: `${type.width ? type.width : 200}px` }}
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
