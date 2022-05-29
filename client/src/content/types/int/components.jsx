import React from "react";
import { InputNumber } from "antd";

export const ValueRender = (props) => {
  if (!props.onChange) return <p>{props.defaultValue}</p>;
  return (
    <InputNumber
      precision={0}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
    />
  );
};
