import TalkSectionAddOverlay from '../../src/mobile.talk.overlays/TalkSectionAddOverlay';
import '../../resources/mobile.talk.overlays/talk.less';
import '../../.storybook/resolve-less-imports/mediawiki.ui.input/input.less';
import { action } from '@storybook/addon-actions';

export default {
	title: 'talk'
};

export const TalkSectionAddOverlayHappyPath = () => {
	const overlay = new TalkSectionAddOverlay( {
		api: {
			postWithToken: () =>
				Promise.resolve( {
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
};

TalkSectionAddOverlayHappyPath.story = {
	name: 'TalkSectionAddOverlay (happy path)'
};

export const TalkSectionAddOverlaySaveFails = () => {
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
};

TalkSectionAddOverlaySaveFails.story = {
	name: 'TalkSectionAddOverlay (save fails)'
};
