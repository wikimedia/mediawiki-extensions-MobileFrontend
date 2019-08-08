import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import LoadErrorMessage from '../../src/mobile.mediaViewer/LoadErrorMessage.js';
import '../../resources/mobile.mediaViewer/ImageCarousel.less';

storiesOf( 'mediaViewer' )
	.add( 'LoadErrorMessage',
		() => wrap(
			new LoadErrorMessage( {
				retryPath: '#/retry'
			} ),
			null,
			null,
			'background: black; padding: 50px;'
		)
	);
