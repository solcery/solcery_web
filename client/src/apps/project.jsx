import { useState } from "react";
import { Button, Select } from "antd";
import { useBrickLibrary } from "../contexts/brickLibrary";
import { build } from "../builder";

const { Option } = Select;

export default function Project() {
  const [target, setTarget] = useState("web");

  const { brickLibrary } = useBrickLibrary();

  const buildProject = async () => {
    let result = await build({ targets: [ target ], brickLibrary });
  };

  return (
    <>
      <Select defaultValue="web" onChange={setTarget}>
        <Option value="web">Web</Option>
        <Option value="unity">Unity</Option>
      </Select>
      <Button onClick={buildProject}>BUILD</Button>
    </>
  );
}
