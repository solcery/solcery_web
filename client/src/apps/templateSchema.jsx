import { Button, Input } from "antd";
import { useProject } from "../contexts/project";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const { TextArea } = Input;

export default function TemplateSchema() {
  const { templateCode } = useParams();
  const [schema, setSchema] = useState();
  const { sageApi } = useProject();

  const loadSchema = (templateSchema) => {
    setSchema(JSON.stringify(templateSchema, undefined, 2));
  };

  useEffect(() => {
    sageApi.template.getSchema(templateCode).then(loadSchema);
  }, [ templateCode, sageApi.template ]);

  const save = () => {
    sageApi.template.setSchema(templateCode, JSON.parse(schema));
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
