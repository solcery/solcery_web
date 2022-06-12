import { useEffect } from "react";
import { Switch } from "antd";

export const ValueRender = (props) => {
  useEffect(() => {
    if (props.onChange) props.onChange(props.defaultValue ?? false);
  }, [props]);

  if (!props.onChange) return <p>{props.defaultValue ? "True" : "False"}</p>;

  return (
    <Switch defaultChecked={props.defaultValue} onChange={props.onChange} />
  );
};
