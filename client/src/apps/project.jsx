import { useState } from "react";
import { Button, Select, Card } from "antd";
import { useBrickLibrary } from "../contexts/brickLibrary";
import { useUser } from "../contexts/user";
import { build, validate } from "../content";
import { Link } from "react-router-dom";
import { Session } from "../game";
import { DownloadOutlined } from "@ant-design/icons";
const { Option } = Select;

export default function Project() {
  const [target, setTarget] = useState("web");
  const [errors, setErrors] = useState([]);
  const [unityData, setUnityData] = useState(undefined);

  const { brickLibrary } = useBrickLibrary();
  const { layoutPresets } = useUser();

  const buildProject = async () => {
    setErrors([]);
    let res = await build({ targets: [target], brickLibrary });
    if (!res.status) {
      setErrors(res.errors);
      return;
    }
  };

  const validateProject = async () => {
    setErrors([]);
    let res = await validate({ brickLibrary });
    if (!res.status) {
      setErrors(res.errors);
    }
    window.alert("Everything seems fine!");
  };

  const downloadAsJSON = async (filename, data) => {
    let date = Date.now();
    let json = JSON.stringify(data, undefined, 2);
    const element = document.createElement("a");
    const file = new Blob([json], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}_${date}.json`; // TODO: add_date and project
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const downloadForUnityLocalSim = (filetype) => {
    downloadAsJSON(`game_${filetype}`, unityData[filetype]);
  };

  const buildForUnity = async () => {
    setUnityData(undefined);
    setErrors([]);
    let res = await build({ targets: ["web", "unity_local"], brickLibrary });
    if (!res.status) {
      setErrors(res.errors);
      return;
    }
    let session = new Session(
      { web: res.constructed.web, unity: res.constructed.unity_local },
      [1]
    );
    session.start(layoutPresets);
    let state = {
      id: 0,
      state_type: 0,
      value: session.game.diffLog,
    };
    setUnityData({
      content: res.constructed.unity_local,
      state,
    });
  };

  return (
    <>
      <Card title="Test targets">
        <Select defaultValue="web" onChange={setTarget}>
          <Option value="web">Web</Option>
          <Option value="unity">Unity</Option>
        </Select>
        <Button onClick={buildProject}>BUILD</Button>
      </Card>
      <Card title="For unity local simulation">
        {unityData && (
          <Button
            icon=<DownloadOutlined />
            onClick={() => downloadForUnityLocalSim("content")}
          >
            Content
          </Button>
        )}
        {unityData && (
          <Button
            icon=<DownloadOutlined />
            onClick={() => downloadForUnityLocalSim("state")}
          >
            State
          </Button>
        )}
        <Button onClick={buildForUnity}>Build for Unity simulation</Button>
      </Card>
      <Card title="Validation">
        <Button onClick={validateProject}>Check content</Button>
      </Card>
      {errors.length > 0 && (
        <Card title="Errors">
          {errors.map((err, index) => (
            <Link
              key={`error.${index}`}
              to={`/template.${err.template}.${err.object}`}
            >
              {err.message}
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
