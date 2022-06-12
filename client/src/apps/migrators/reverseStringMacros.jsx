import { execute, SString } from "../../content";

const reverseStringsForObject = (object, meta) => {
  let template = meta.content.templates.find(
    (tpl) => tpl.code === object.template
  );
  if (!template) return;
  let fields = Object.values(template.fields).filter(
    (field) =>
      field.type instanceof SString &&
      field.type.useMacros &&
      object.fields[field.code]
  );
  if (fields.length === 0) return;
  for (let field of fields) {
    let res = object.fields[field.code];
    for (let { source, result } of meta.stringMacros) {
      res = res.replaceAll(result, source);
    }
    object.fields[field.code] = res;
  }
  meta.objects.push(object);
};

export const migrator = (content) => {
  let meta = {
    stringMacros: content.objects
      .filter(
        (object) =>
          object.template === "stringReplaceRules" &&
          object.fields.source &&
          object.fields.result
      )
      .map((object) => {
        return {
          source: object.fields.source,
          result: object.fields.result,
        };
      }),
    content,
    objects: [],
  };
  execute(reverseStringsForObject, meta);
  return meta.objects;
};
