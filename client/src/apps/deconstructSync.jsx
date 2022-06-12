import { useState } from "react";
import { Button, Input } from "antd";
import { SType, SLink, SBrick, SArray } from "../content/types";
import { constructedBrickToBrick } from "./migrators/constructedBrickToBrick";

const { TextArea } = Input;

export const packId = (id) => {
  return `[-${id}-]`;
};

const getMigratorForField = (fieldData) => {
  let fieldType = SType.from(fieldData.type);
  if (fieldType instanceof SLink)
    return (value, content) => {
      return packId(value);
    };
  if (fieldType instanceof SBrick)
    return (value, content) => {
      return constructedBrickToBrick(value, content);
    };
  if (fieldType instanceof SArray)
    return (value, content) => {
      if (fieldType.valueType instanceof SLink) {
        return value.map((v) => packId(v));
      }
    };
  // if (fieldData.type.match(/SLink<.*>/)) return (value) => {
  // 	return packId(value);
  // };
  // if (fieldData.type.match(/SBrick<.*>/)) return (value) => {
  // 	return constructedBrickToBrick(value);
  // };
};

export default function DeconstructSync() {
  const [templateSchemaJson, setTemplateSchemaJson] = useState();
  const [contentSchemaJson, setContentSchemaJson] = useState();

  const applyPayload = async () => {
    if (!templateSchemaJson) return;
    if (!contentSchemaJson) return;
    let templateDatas = JSON.parse(templateSchemaJson);
    let contentSchema = JSON.parse(contentSchemaJson);
    let content = [];
    for (let [template, templateContent] of Object.entries(contentSchema)) {
      let templateData = templateDatas.find((tpl) => tpl.code === template);
      if (!templateData) continue;
      for (let object of templateContent.objects) {
        let resultObject = {
          template,
          id: object.id,
          fields: {},
        };
        for (let [field, value] of Object.entries(object)) {
          if (field === "id") continue;
          let fieldData = templateData.fields.find((fld) => fld.code === field);
          if (!fieldData) continue;
          let migrator = getMigratorForField(fieldData);
          if (!migrator) {
            resultObject.fields[field] = value;
          } else {
            resultObject.fields[field] = migrator(value, contentSchema);
          }
        }
        content.push(resultObject);
      }
    }
    console.log(content);
  };

  return (
    <>
      <p>Template schema</p>
      <TextArea rows={10} onChange={(e) => setTemplateSchemaJson(e.target.value)} />
      <p>Content schema</p>
      <TextArea rows={10} onChange={(e) => setContentSchemaJson(e.target.value)} />
      <Button onClick={applyPayload}>Apply</Button>
    </>
  );
}
