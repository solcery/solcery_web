import { useState } from "react";
import { Button, Select } from "antd";
import { useBrickLibrary } from "../contexts/brickLibrary";
import { build, validate } from "../content";
import { Link } from "react-router-dom";

const { Option } = Select;

export default function Project() {
  const [ target, setTarget ] = useState("web");
  const [ errors, setErrors ] = useState([]);
  const { brickLibrary } = useBrickLibrary();

  const buildProject = async () => {
    let res = await build({ targets: [ target ], brickLibrary });
    if (res.status) {
      console.log(res.constructed) 
    } else {
      setErrors(res.errors)
    }
  };

  const validateProject = async () => {
    let res = await validate({ brickLibrary });
    if (!res.status) {
      setErrors(res.errors)
    }
  }

  return (
    <>
      <div>
        <p> Test targets: </p>
        <Select defaultValue="web" onChange={setTarget}>
          <Option value="web">Web</Option>
          <Option value="unity">Unity</Option>
        </Select>
        <Button onClick={buildProject}>BUILD</Button>
      </div>
      {errors.map((err, index) => 
        <Link key={`error.${index}`} to={`/template.${err.template}.${err.object}`}>
          { err.message }
        </Link>)
      }
    </>
  );
}
