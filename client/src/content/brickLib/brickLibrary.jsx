import { insertTable } from '../../utils';
import { SType } from '../types';
import { basicActions } from './index';
import { basicValues } from './index';
import { basicConditions } from './index';

export class BrickLibrary {
  bricks = {};

  addBrick(brickSignature) {
    let brick = Object.assign({}, brickSignature);
    brick.params = brickSignature.params.map(param => {
      let newParam = Object.assign({}, param);
      newParam.type = SType.from(newParam.type);
      return newParam;
    })
    insertTable(this.bricks, brick, brick.lib, brick.func)
  }

  constructor() {
    basicActions.forEach(brick => this.addBrick(brick));
    basicConditions.forEach(brick => this.addBrick(brick));
    basicValues.forEach(brick => this.addBrick(brick));
  }
}

export default BrickLibrary;
