const commands = {};

commands.getAllObjects = {
  name: "getAllObjects",
  params: {
    template: true,
  },
};

commands.getSchema = {
  name: "getSchema",
  params: {
    template: true,
  },
};

commands.setSchema = {
  name: "setSchema",
  params: {
    template: true,
    schema: true,
  },
};

commands.getObjectById = {
  name: "getObjectById",
  params: {
    template: true,
    objectId: true,
  },
};

commands.updateObjectById = {
  name: "updateObjectById",
  params: {
    template: true,
    objectId: true,
    fields: true,
  },
};

commands.createObject = {
  name: "createObject",
  params: {
    template: true,
  },
};

commands.cloneObject = {
  name: "cloneObject",
  params: {
    template: true,
    objectId: true,
  },
};

commands.removeObjectById = {
  name: "removeObjectById",
  params: {
    template: true,
    objectId: true,
  },
};

export const templateAPI = {
  name: "template",
  commands,
};
