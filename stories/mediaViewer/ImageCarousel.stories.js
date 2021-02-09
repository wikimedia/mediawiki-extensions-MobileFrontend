import { wrap } from '../utils';
import ImageCarousel from '../../src/mobile.mediaViewer/ImageCarousel.js';
import '../../resources/mobile.mediaViewer/ImageCarousel.less';
import { fakeGateway, fakeRouter, thumbnails } from './utils';
import { fakeEventBus } from '../utils';

export default {
	title: 'mediaViewer'
};

export const ImageCarouselEmpty = () =>
	wrap(
		new ImageCarousel( {
			thumbnails: [],
			router: fakeRouter,
			eventBus: fakeEventBus,
			gateway: fakeGateway
		} ),
		null,
		null,
		'background: black; padding: 50px;'
	);

ImageCarouselEmpty.story = {
	name: 'ImageCarousel (empty)'
};

export const ImageCarousel2Images = () =>
	wrap(
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
	);

ImageCarousel2Images.story = {
	name: 'ImageCarousel (2 images)'
};
