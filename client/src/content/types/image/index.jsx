import { SType } from '../base'
import { ValueRender } from './components'

const DEFAULT_PREVIEW_WIDTH = 200;
class SImage {
	constructor(data) {
		this.previewWidth = data.previewWidth || DEFAULT_PREVIEW_WIDTH;
	}
	valueRender = ValueRender;
};

SType.register('SImage', SImage);
export { SImage }
