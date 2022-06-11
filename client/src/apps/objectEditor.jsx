import React, { useEffect, useState } from "react";
import { Template } from "../content/template";
import { Table, Button } from "antd";
import { useProject } from "../contexts/project";

const { Column } = Table;

export default function ObjectEditor({ templateCode, objectId, onSave, instant }) {
  const [object, setObject] = useState(undefined);
  const [template, setTemplate] = useState(undefined);
  const { sageApi } = useProject();

  useEffect(() => {
    sageApi.template.getObjectById({ template: templateCode, objectId }).then(setObject);
    sageApi.template
      .getSchema({ template: templateCode })
      .then((data) => setTemplate(new Template(data)));
  }, [objectId, templateCode]);

  const setField = (fieldCode, value) => {
    object.fields[fieldCode] = value;
  };

  const save = () => {
    sageApi.template
      .updateObjectById({ template: templateCode, objectId, fields: object.fields })
      .then((res) => {
        if (res.modifiedCount) {
          if (onSave) onSave();
        }
      });
  };

  if (!template || !object) return <>NO DATA</>; // TODO
  let tableData = Object.values(template.fields).map((field) => {
    return {
      key: field.code,
      field: field,
      value: object.fields[field.code],
    };
  });
  return (
    <>
      <Button style={{ width: '100%' }}onClick={save}>SAVE</Button>
      <Table pagination={false} dataSource={tableData}>
        <Column
          title="Field"
          key="Field"
          dataIndex="fieldName"
          render={(text, record) => <p>{record.field.name}</p>}
        />
        <Column
          title="Value"
          key="value"
          dataIndex="value"
          render={(text, record) => (
            <record.field.type.valueRender
              instant = {record.field.code === instant}
              defaultValue={record.value}
              onChange={(value) => {
                setField(record.field.code, value);
              }}
              type={record.field.type}
            />
          )}
        />
      </Table>
      <Button style={{ width: '100%' }}onClick={save}>SAVE</Button>
    </>
  );
}
