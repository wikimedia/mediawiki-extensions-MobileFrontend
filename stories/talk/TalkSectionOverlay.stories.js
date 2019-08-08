import { storiesOf } from '@storybook/html';
import TalkSectionOverlay from '../../src/mobile.talk.overlays/TalkSectionOverlay';
import '../../resources/mobile.talk.overlays/talk.less';
import { section } from './data';

storiesOf( 'talk' )
	.add( 'TalkSectionOverlay', () => {
		const overlay = new TalkSectionOverlay( {
			title: 'Talk page',
			currentPageTitle: 'Talk:Talk page',
			licenseMsg: 'this is the license',
			id: section.id,
			api: {
				get: () => {
					alert( 'This should be an onSaveComplete callback but it is not.' );
					return Promise.resolve( {} );
				},
				postWithToken: () => {
					alert( 'This should be an onReply callback but it is not.' );
					return Promise.resolve( {} );
				}
			},
			section,
			eventBus: {}
		} );
		overlay.show();
		return overlay.$el[0];
	} );
