import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button } from "antd";
import { Template } from "../content/template";
import { SageAPI } from "../api";
import { useCookies } from "react-cookie";

const { Column } = Table;

export default function CollectionEditor({ templateCode, moduleName }) {
  const filterCookieName = `${moduleName}.filter`;
  let navigate = useNavigate();
  const [objects, setObjects] = useState();
  const [template, setTemplate] = useState();
  const [cookies, setCookie, removeCookie] = useCookies([filterCookieName]);
  const [filteredField, setFilteredField] = useState();
  const [filter, setFilter] = useState(cookies[filterCookieName] ?? {});

  const setFieldFilter = (fieldCode, filterValue) => {
    if (filterValue === undefined) {
      delete filter[fieldCode];
    } else {
      filter[fieldCode] = filterValue;
    }
    if (Object.keys(filter).length > 0) {
      setCookie(filterCookieName, filter);
    } else {
      removeCookie(filterCookieName);
    }
    setFilter(Object.assign({}, filter));
  };

  useEffect(() => {
    SageAPI.template.getAllObjects(templateCode).then(setObjects);
    SageAPI.template
      .getSchema(templateCode)
      .then((data) => setTemplate(new Template(data)));
  }, [ templateCode ]);

  const onPaginationChange = (pagination) => {
    setCookie(`${templateCode}.pagination.pageSize`, pagination.pageSize);
    setCookie(`${templateCode}.pagination.current`, pagination.current);
  };
  if (!template || !objects || !filter) return <>NO DATA</>;

  let tableData = objects
    .filter((object) => {
      for (let field of Object.values(template.fields)) {
        let filterValue = filter[field.code];
        if (filterValue === undefined) continue;
        let fieldFilter = field.type.filter;
        if (!fieldFilter) continue;
        if (!field.type.filter.eq(object.fields[field.code], filterValue))
          return false;
      }
      return true;
    })
    .map((object) => {
      return {
        id: object._id,
        key: object._id,
        fields: Object.assign({}, object.fields),
      };
    });
    
  return (
    <>
      <Table
        dataSource={tableData}
        onRow={(record, rowIndex) => {
          return {
            onDoubleClick: (event) => {
              navigate(`/${moduleName}.${record.id}`);
            },
          };
        }}
        onChange={onPaginationChange}
        pagination={{
          defaultCurrent: cookies[`${moduleName}.pagination.pageSize`] ?? 1,
          defaultPageSize: cookies[`${moduleName}.pagination.current`] ?? 10,
          onChange: onPaginationChange,
        }}
      >
        {Object.values(template.fields).map((field) => (
          <Column
            filtered={filter[field.code] !== undefined}
            title={
              field.name +
              (filter[field.code] !== undefined
                ? `   [ ${filter[field.code]} ]`
                : "")
            }
            key={`${moduleName}.${field.code}`}
            dataIndex={field.code}
            filterDropdown={
              field.type.filter && (
                <field.type.filter.render
                  type={field.type}
                  defaultValue={filter[field.code]}
                  onChange={(value) => {
                    setFieldFilter(field.code, value);
                    setFilteredField();
                  }}
                />
              )
            }
            onFilterDropdownVisibleChange={(visible) =>
              setFilteredField(visible ? field.code : undefined)
            }
            filterDropdownVisible={filteredField === field.code}
            render={(_, object) => (
              <field.type.valueRender
                defaultValue={object.fields[field.code]}
                type={field.type}
              />
            )}
          />
        ))}
        <Column
          title="Actions"
          key="actions"
          render={(_, object) => (
            <div key={"actions." + object.id}>
              <Button
                key={"copy." + object.id}
                onClick={() => {
                  SageAPI.template
                    .clone(templateCode, object.id)
                    .then((res) => {
                      if (res.insertedId) {
                        navigate(`/${moduleName}.${res.insertedId}`);
                      }
                    });
                }}
              >
                Copy
              </Button>
              <Button
                key={"delete." + object.id}
                onClick={() => {
                  if (
                    window.confirm(
                      "Deleting object [" +
                        object.id +
                        "] " +
                        object.fields.title +
                        ". Are you sure?"
                    )
                  ) {
                    SageAPI.template
                      .removeById(templateCode, object.id)
                      .then((res) => {
                        if (res.deletedCount) {
                          navigate(`/${moduleName}`);
                        }
                      });
                  }
                }}
              >
                Delete
              </Button>
            </div>
          )}
        />
      </Table>
      <Button
        onClick={() => {
          SageAPI.template.create(templateCode).then((res) => {
            if (res.insertedId) {
              navigate(`/${moduleName}.${res.insertedId}`);
            }
          });
        }}
      >
        Create
      </Button>
    </>
  );
}
