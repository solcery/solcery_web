import { SType } from '../base'
import { ValueRender } from './components'

const DEFAULT_PREVIEW_WIDTH = 200;
class SImage {
	static fromString = () => new SImage({})
	constructor(data) {
		this.previewWidth = data.previewWidth || DEFAULT_PREVIEW_WIDTH;
	}
	construct = value => value;
	valueRender = ValueRender;
	default = '';
};

SType.register('SImage', SImage);
export { SImage }
