import { SType } from '../base';
import { ValueRender } from './components';

const DEFAULT_PREVIEW_WIDTH = 200;
class SImage extends SType {
	static fromString = () => new SImage();
	constructor(data = {}) {
		super();
		this.previewHeight = data.previewHeight;
		this.previewWidth = data.previewWidth ?? DEFAULT_PREVIEW_WIDTH;
		if (!this.previewHeight && !this.previewWidth) {
			this.previewWidth = DEFAULT_PREVIEW_WIDTH;
		}
	}
	sort = undefined;
	valueRender = ValueRender;
	default = () => '';
}

SType.register('SImage', SImage);
export { SImage };
