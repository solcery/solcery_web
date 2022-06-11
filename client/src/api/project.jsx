export const projectAPI = {
  name: 'project',
  commands: {}
};

projectAPI.commands.getAllTemplates = {
  name: 'getAllTemplates',
};

projectAPI.commands.restore = {
  name: 'restore',
  params: { 
    src: true
  },
};

projectAPI.commands.dump = {
  name: 'dump',
};

projectAPI.commands.getContent = {
  name: 'getContent',
};

projectAPI.commands.migrate = {
  name: 'migrate',
  params: {
    objects: true
  },
};