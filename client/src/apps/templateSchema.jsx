import { Button, Input } from "antd";
import { SageAPI } from "../api";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const { TextArea } = Input;

export default function TemplateSchema() {
  const { templateCode } = useParams();
  const [schema, setSchema] = useState();

  const loadSchema = (templateSchema) => {
    setSchema(JSON.stringify(templateSchema, undefined, 2));
  };

  useEffect(() => {
    SageAPI.template.getSchema(templateCode).then(loadSchema);
  }, [templateCode]);

  const save = () => {
    SageAPI.template.setSchema(templateCode, JSON.parse(schema));
  };

  if (!schema) return <>Loading</>;
  return (
    <>
      <p>Template: {}</p>
      <TextArea
        rows={20}
        defaultValue={schema}
        onChange={(e) => setSchema(e.target.value)}
      />
      <Button onClick={save}> save </Button>
    </>
  );
}
