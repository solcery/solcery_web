import { SType } from '../base'
import { ValueRender } from './components'

class SImage {
	constructor(data) {
		this.previewWidth = data.previewWidth;
	}
	valueRender = ValueRender;
};


SType.register('SImage', SImage);
export { SImage }
