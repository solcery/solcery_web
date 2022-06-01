import { apiCall } from "./index";

const MODULE_NAME = "project";
export const project = {};

project.getAllTemplates = () => {
  return apiCall(MODULE_NAME, "getAllTemplates");
};

project.restore = (src) => {
  return apiCall(MODULE_NAME, "restore", { src });
};

project.dump = () => {
  return apiCall(MODULE_NAME, "dump");
};

project.getContent = () => {
  return apiCall(MODULE_NAME, "getContent");
};

project.migrate = ({ objects }) => {
  return apiCall(MODULE_NAME, "migrate", { objects });
};

