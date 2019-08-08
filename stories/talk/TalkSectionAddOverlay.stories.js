import { storiesOf } from '@storybook/html';
import TalkSectionAddOverlay from '../../src/mobile.talk.overlays/TalkSectionAddOverlay';
import '../../resources/mobile.talk.overlays/talk.less';
import '../../.storybook/resolve-less-imports/mediawiki.ui/components/inputs.less';
import { action } from '@storybook/addon-actions';

storiesOf( 'talk' )
	.add( 'TalkSectionAddOverlay (happy path)', () => {
		const overlay = new TalkSectionAddOverlay( {
			api: {
				postWithToken: () => Promise.resolve( {
					edit: {
						result: 'Success'
					}
				} )
			},
			title: 'Talk page',
			currentPageTitle: 'Talk:Talk page',
			licenseMsg: 'this is the license',
			onSaveComplete: action( 'onSaveComplete' ),
			eventBus: {}
		} );
		overlay.show();
		return overlay.$el[0];
	} )
	.add( 'TalkSectionAddOverlay (save fails)', () => {
		const overlay = new TalkSectionAddOverlay( {
			api: {
				postWithToken: () => Promise.reject( 'Error' )
			},
			title: 'Talk page',
			currentPageTitle: 'Talk:Talk page',
			licenseMsg: 'this is the license',
			onSaveComplete: action( 'onSaveComplete' ),
			eventBus: {}
		} );
		overlay.show();
		return overlay.$el[0];
	} );
