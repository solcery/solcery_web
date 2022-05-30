import { SType } from "../base";
import { ValueRender } from "./components";

const MAP_TYPES_DELIMETER = "|";

class SMap {
  static fromString = (data) => {
    let typeDatas = data.split(MAP_TYPES_DELIMETER);
    return new SMap({
      keyType: typeDatas[0],
      valueType: typeDatas[1],
    });
  };

  constructor(data) {
    this.valueType = SType.from(data.valueType);
    this.keyType = SType.from(data.keyType);
  }

  construct = (value, meta) => {
    if (meta.target.includes("unity")) {
      return value.map((val) => {
        return {
          key: this.keyType.construct(val.key, meta),
          value: this.valueType.construct(val.value, meta),
        };
      });
    }
    if (meta.target === "web") {
      return Object.fromEntries(
        value.map((val) => [
          this.keyType.construct(val.key, meta),
          this.valueType.construct(val.value, meta),
        ])
      );
    }
  };

  valueRender = ValueRender;
  default = () => [];
}

SType.register("SMap", SMap);
export { SMap };
