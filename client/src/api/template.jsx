import { apiCall } from "./index";

const MODULE_NAME = "template";
export const template = {};

template.getAllObjects = (templateCode) => {
  return apiCall(MODULE_NAME, "getAll", { templateCode });
};

template.getSchema = (templateCode) => {
  return apiCall(MODULE_NAME, "getSchema", { templateCode });
};

template.setSchema = (templateCode, schema) => {
  return apiCall(MODULE_NAME, "setSchema", { templateCode, schema });
};

template.getObjectById = (templateCode, objectId) => {
  return apiCall(MODULE_NAME, "getById", { templateCode, objectId });
};

template.updateObjectById = (templateCode, objectId, fields) => {
  return apiCall(MODULE_NAME, "update", { templateCode, objectId, fields });
};

template.create = (templateCode) => {
  return apiCall(MODULE_NAME, "create", { templateCode });
};

template.clone = (templateCode, objectId) => {
  return apiCall(MODULE_NAME, "clone", { templateCode, objectId });
};

template.removeById = (templateCode, objectId) => {
  return apiCall(MODULE_NAME, "removeById", { templateCode, objectId });
};

template.removeAll = (templateCode) => {
  return apiCall(MODULE_NAME, "removeAll", { templateCode });
};

template.createMany = (templateCode, objects) => {
  return apiCall(MODULE_NAME, "createMany", { templateCode, objects });
};
