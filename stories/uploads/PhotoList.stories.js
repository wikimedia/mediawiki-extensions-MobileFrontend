import { storiesOf } from '@storybook/html';
import PhotoList from '../../src/mobile.special.uploads.scripts/PhotoList';
import '../../resources/mobile.special.uploads.scripts/gallery.less';
import '../../resources/mobile.special.uploads.styles/default.less';
import { apiResponse } from './data';
import { fakeEventBus } from '../utils';

storiesOf( 'uploads' )
	.add( 'PhotoList (empty state)',
		() => new PhotoList( {
			eventBus: fakeEventBus,
			// FIXME: Not used by PhotoList - only PhotoListGateway
			username: 'Jdlrobson',
			url: 'https://en.wikipedia.org/wiki/Bananas',
			api: {
				ajax: () => {
					return Promise.resolve( {} );
				}
			}
		} ).$el[0]
	)
	.add( 'PhotoList',
		() => new PhotoList( {
			eventBus: fakeEventBus,
			// FIXME: Not used by PhotoList - only PhotoListGateway
			username: 'Jdlrobson',
			url: 'https://en.wikipedia.org/wiki/Bananas',
			api: {
				ajax: () => {
					return Promise.resolve( apiResponse );
				}
			}
		} ).$el[0]
	);
