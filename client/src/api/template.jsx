export const templateAPI = {
  name: 'template',
  commands: {}
};

templateAPI.commands.getAllObjects = {
  name: 'getAllObjects',
  params: {
    template: true,
  }
}

templateAPI.commands.getSchema = {
  name: 'getSchema',
  params: {
    template: true,
  }
}

templateAPI.commands.setSchema = {
  name: 'setSchema',
  params: {
    template: true,
    schema: true,
  }
}

templateAPI.commands.getObjectById = {
  name: 'getObjectById',
  params: {
    template: true,
    objectId: true,
  }
}

templateAPI.commands.updateObjectById = {
  name: 'updateObjectById',
  params: {
    template: true,
    objectId: true,
    fields: true,
  }
}

templateAPI.commands.createObject = {
  name: 'createObject',
  params: {
    template: true,

  }
}

templateAPI.commands.cloneObject = {
  name: 'cloneObject',
  params: {
    template: true,
    objectId: true,
  }
}

templateAPI.commands.removeObjectById = {
  name: 'removeObjectById',
  params: {
    template: true,
    objectId: true,
  }
}

// templateAPI.commands.removeAll = {
//   name: 'removeAll',
//   params: {
//     template: true,
//   }
// }

// templateAPI.commands.createMany = {
//   name: 'createMany',
//   params: {
//     template: true,
//     objects: true,
//   }
// }