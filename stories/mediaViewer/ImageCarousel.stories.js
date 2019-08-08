import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import ImageCarousel from '../../src/mobile.mediaViewer/ImageCarousel.js';
import '../../resources/mobile.mediaViewer/ImageCarousel.less';
import { fakeGateway, fakeRouter, thumbnails } from './utils';
import { fakeEventBus } from '../utils';

storiesOf( 'mediaViewer' )
	.add( 'ImageCarousel (empty)',
		() => wrap(
			new ImageCarousel( {
				thumbnails: [],
				router: fakeRouter,
				eventBus: fakeEventBus,
				gateway: fakeGateway
			} ),
			null,
			null,
			'background: black; padding: 50px;'
		)
	)
	.add( 'ImageCarousel (2 images)',
		() => wrap(
			new ImageCarousel( {
				title: 'File:Bananas.jpg',
				thumbnails,
				router: fakeRouter,
				eventBus: fakeEventBus,
				gateway: fakeGateway
			} ),
			null,
			null,
			'background: black; padding: 50px;'
		)
	);
