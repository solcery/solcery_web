import { useState, useEffect, useRef } from "react";
import { useProject } from "../../../contexts/project";
import { Select } from "antd";
const { Option } = Select;

export const ValueRender = (props) => {
  const [objects, setObjects] = useState(undefined);
  const mountedRef = useRef(true);
  const { sageApi } = useProject();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onChange = (newValue) => {
    props.onChange && props.onChange(newValue);
  };

  useEffect(() => {
    sageApi.template
      .getAllObjects({ template: props.type.templateCode })
      .then((res) => {
        if (!mountedRef.current) return null;
        setObjects(
          res.map((object) => {
            return {
              id: object._id,
              title: object.fields.name,
            };
          })
        );
      });
  }, [props.type, sageApi]);
  if (!props.onChange) {
    if (!props.defaultValue) return <p>None</p>;
    if (!objects) return <>Loading ...</>;
    let obj = objects.find((obj) => obj.id === props.defaultValue);
    if (obj) {
      return (
        <a href={`/template.${props.type.templateCode}.${props.defaultValue}`}>
          {obj.title}
        </a>
      );
    } else {
      return <p>{`Missing object ${props.defaultValue}`}</p>;
    }
  }

  if (!objects) return <>Loading ...</>;
  return (
    <Select
      showSearch
      style={{
        width: 200,
      }}
      onChange={onChange}
      defaultValue={props.defaultValue}
      filterOption={(input, option) => option.children.includes(input)}
      filterSort={(optionA, optionB) =>
        optionA.children
          .toLowerCase()
          .localeCompare(optionB.children.toLowerCase())
      }
    >
      <Option value={undefined}>None</Option>
      {objects.map((obj) => (
        <Option key={obj.id} value={obj.id}>
          {obj.title}
        </Option>
      ))}
    </Select>
  );
};
