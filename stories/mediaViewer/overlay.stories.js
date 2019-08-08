import { storiesOf } from '@storybook/html';
import { wrap, fakeEventBus } from '../utils';
import overlay from '../../src/mobile.startup/mediaViewer/overlay';
import ImageCarousel from '../../src/mobile.mediaViewer/ImageCarousel.js';
import '../../resources/mobile.startup/mediaViewer/overlay.less';
import '../../resources/mobile.mediaViewer/ImageCarousel.less';
import m from '../../src/mobile.startup/moduleLoaderSingleton';
import { fakeGateway, fakeRouter, thumbnails } from './utils';

m.define( 'mobile.mediaViewer', {
	ImageCarousel
} );

storiesOf( 'mediaViewer' )
	.add( 'overlay',
		() => {
			const mOverlay = overlay( {
				title: 'File:Bananas.jpg',
				thumbnails,
				router: fakeRouter,
				eventBus: fakeEventBus,
				gateway: fakeGateway
			} );
			mOverlay.show();
			return wrap( mOverlay, 'overlay-enabled' );
		}
	);
