import { wrap } from '../utils';
import LoadErrorMessage from '../../src/mobile.mediaViewer/LoadErrorMessage.js';
import '../../resources/mobile.mediaViewer/ImageCarousel.less';

export default {
	title: 'mediaViewer'
};

export const _LoadErrorMessage = () =>
	wrap(
		new LoadErrorMessage( {
			retryPath: '#/retry'
		} ),
		null,
		null,
		'background: black; padding: 50px;'
	);

_LoadErrorMessage.story = {
	name: 'LoadErrorMessage'
};
