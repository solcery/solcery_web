import { SageAPI } from "../api";
import { Template } from "../content/template";

export * from "./types";
export * from "./template";
export * from "./brickLib";

export const validate = async ({ brickLibrary }) => {
  let meta = {
    errors: [],
    brickLibrary,
  }
  let templates = (await SageAPI.project.getAllTemplates()).map(
    (template) => new Template(template)
  );
  for (let template of templates) {
    let fields = Object.values(template.fields).filter(field => field.type.validate);
    let objects = await SageAPI.template.getAllObjects(template.code);
    for (let object of objects) {
      for (let field of fields) {
        let res = field.type.validate(object.fields[field.code], meta);
        if (res) {
          meta.errors.push({ 
            template: template.code,
            object: object._id,
            field: field.code,
            message: res.message,
          })
        };
      }
    }
  }
  return {
  	status: meta.errors.length === 0,
  	errors: meta.errors,
  };
}

export const build = async ({ targets, brickLibrary }) => { //TODO: remove brickLibrary?

  let validationResult = await validate({ brickLibrary });
  if (!validationResult.status) {
  	return validationResult;
  }

  let result = Object.fromEntries(targets.map((target) => [target, {}]));
  let meta = {
    intIds: {},
    brickLibrary,
    addIntId: function (objectId) {
      let intId = Object.keys(this.intIds).length + 1;
      this.intIds[objectId] = intId;
      return intId;
    },
    getIntId: function (objectId) {
      return this.intIds[objectId];
    },
  };

  let templates = (await SageAPI.project.getAllTemplates()).map(
    (template) => new Template(template)
  );
  let tpl = templates.map(async (template) => {
    let objects = await SageAPI.template.getAllObjects(template.code);
    for (let obj of objects) {
      meta.addIntId(obj._id);
    }
    return [template.code, { template, objects }];
  });
  meta.rawContent = Object.fromEntries(await Promise.all(tpl));

  meta.stringMacros = meta.rawContent.stringReplaceRules.objects
    .filter((object) => object.fields.source && object.fields.result)
    .map((object) => {
      return {
        source: object.fields.source,
        result: object.fields.result,
      };
    });

  //Building target
  for (let target of targets) {
    let constructed = {};
    meta.target = target;
    for (let template of templates) {
      if (template.constructTargets.includes(target)) {
        constructed[template.code] = meta.rawContent[template.code].objects.map(
          (obj) => template.construct(obj, meta)
        );
      }
    }
    if (target === "unity") {
      Object.entries(constructed).forEach(([name, objects]) => {
        result.unity[name] = { name, objects };
      });
    }
    if (target === "web") {
      for (let [code, objects] of Object.entries(constructed)) {
        result.web[code] = Object.fromEntries(
          objects.map((obj) => [obj.id, obj])
        );
      }
    }
  }
  return {
  	status: true,
  	constructed: result
  };
};

