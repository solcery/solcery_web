import { SType } from "../base";
import { ValueRender } from "./components";

class SArray {
  static fromString = (data) => new SArray({ valueType: data });
  constructor(data) {
    this.valueType = SType.from(data.valueType);
  }
  construct = (value, meta) => value.map((val) => this.valueType.construct(val, meta));
  valueRender = ValueRender;
  default = () => [];
}

SType.register("SArray", SArray);
export { SArray };
