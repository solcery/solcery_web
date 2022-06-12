import { Menu, Avatar } from "antd";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useProject } from "../contexts/project";
import { useUser } from "../contexts/user";
import {
  UserOutlined,
  CaretRightOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";

export const TopMenu = () => {
  const [templates, setTemplates] = useState([]);
  const { sageApi, projectName } = useProject();
  const { nick } = useUser();

  useEffect(() => {
    sageApi.project.getAllTemplates().then(setTemplates);
  }, []);

  return (
    <>
      <Menu mode="horizontal">
        <Menu.Item key="project">
          <Link to="project" style={{ fontWeight: 'bold' }}>
            <Avatar size={"small"} icon=<DeploymentUnitOutlined /> style={{ marginRight: 7 }}/>
              { projectName }
          </Link>
        </Menu.Item>
        <Menu.Item key="play">
          <Link to="play" style={{ fontWeight: 'bold' }}>
            <Avatar size={"small"} icon=<CaretRightOutlined /> style={{ marginRight: 7 }}/>
              Play
          </Link>
        </Menu.Item>
        <Menu.Item key="brickLibrary">
          <Link to="brickLibrary">Brick library</Link>
        </Menu.Item>
        {templates
          .filter((template) => !template.hidden)
          .map((template) => (
            <Menu.Item key={template.code}>
              <Link to={`template.${template.code}`}>{template.name}</Link>
            </Menu.Item>
          ))}
        <Menu.Item key="profile">
          <Link to="profile" style={{ fontWeight: 'bold' }}>
            <Avatar size={"small"} icon=<UserOutlined />  style={{ marginRight: 7 }}/>
            { nick }
          </Link>
        </Menu.Item>
      </Menu>
    </>
  );
};
