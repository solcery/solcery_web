import { Button, Input } from "antd";
import { useState } from "react";
import { SageAPI } from "../api";
import { execute } from "../content";
import { migrator } from "./migrators/tokenAddedToTokenLinked";

const { TextArea } = Input;

export default function Migrator() {
  const [result, setResult] = useState('');

  const applyMigrator = async () => {
    let content = await SageAPI.project.getContent();

    setResult(JSON.stringify(content, undefined, 2));
    let objects = migrator(content);
    SageAPI.project.migrate({ objects });
  };

  return (
    <>
      <TextArea
        placeholder="Result will be here"
        rows={10}
        value = {result}
      />
      <Button onClick={applyMigrator}> APPLY </Button>
    </>
  );
}
