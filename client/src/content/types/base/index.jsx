import { DefaultFilterRender } from "./components";

const _stypebyclassname = {};

const fromObject = (src) => {
  let classConstructor = _stypebyclassname[src.name];
  if (!classConstructor) throw new Error("Error building stype from data!");
  return new classConstructor(src.data);
};

const fromString = (src) => {
  let fromIndex = src.indexOf("<") + 1;
  let toIndex = src.lastIndexOf(">");
  let name = src.replace(/ *<[^)]*> */g, "");
  let data = fromIndex > 0 ? src.substring(fromIndex, toIndex) : undefined;
  return _stypebyclassname[name].fromString(data);
};

export const SType = {
  register: (classname, constructor) => {
    _stypebyclassname[classname] = constructor;
  },

  from: (src) => {
    switch (typeof src) {
      case "string":
        return fromString(src);
      case "object":
        return fromObject(src);
      default:
        throw new Error("Unknown type definition from mongo");
    }
  },
};

export const defaultFilter = {
  eq: (value, filterValue) => value === filterValue,
  render: DefaultFilterRender,
};
