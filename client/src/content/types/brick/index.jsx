import { SType } from "../../index";
import { ValueRender, FilterRender } from "./components";

class SBrick {
  static fromString = (data) => new SBrick({ brickType: data });

  constructor(data) {
    this.brickType = data.brickType;
    this.params = data.params;

    if (!this.brickType) {
      this.filter = {
        eq: (value, filterValue) => {
          return value.brickType === filterValue;
        },
        render: FilterRender,
      };
    }
  }

  construct = (value, meta) => {
    let v = value;

    if (meta.target === "unity") return undefined;

    if (value.brickType) v = value.brickTree; //For top-level brickTree and custom bricks
    if (!v) return undefined;
    let brickSignature = meta.brickLibrary[v.lib][v.func];
    if (!brickSignature)
      throw new Error(
        `Error constructing brick [${v.lib}.${v.func}] - no signature found!`
      );
    let result = {
      name: brickSignature.name,
    };
    let params = brickSignature.params
      .filter((paramSig) => v.params[paramSig.code] !== undefined)
      .map((paramSig) => {
        let param = v.params[paramSig.code];
        return {
          name: paramSig.code,
          value: paramSig.type.construct(param, meta),
        };
      });
    if (meta.target === "unity") {
      let func = brickSignature.func;
      if (func.includes("custom")) {
        let typeByName = { action: 0, condition: 1, value: 2 };
        result.subtype = 10000 + meta.getIntId(func.split(".")[1]);
        result.type = typeByName[brickSignature.lib];
      } else {
        result.type = brickSignature.type;
        result.subtype = brickSignature.subtype;
        result.params = params;
      }
    }
    if (meta.target === "web") {
      result.lib = brickSignature.lib;
      result.func = brickSignature.func;
      let func = brickSignature.func;
      if (func.includes("custom")) {
        result.func = "custom." + meta.getIntId(func.split(".")[1]);
      }
      let newParams = {};
      for (let param of params) {
        newParams[param.name] = param.value;
      }
      result.params = newParams;
    }
    return result;
  };
  valueRender = ValueRender;
  default = "";
}

SType.register("SBrick", SBrick);
export { SBrick };
