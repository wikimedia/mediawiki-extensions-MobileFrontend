import TalkSectionOverlay from '../../src/mobile.talk.overlays/TalkSectionOverlay';
import '../../resources/mobile.talk.overlays/talk.less';
import { action } from '@storybook/addon-actions';
import { section } from './data';

export default {
	title: 'talk'
};

export const _TalkSectionOverlay = () => {
	const overlay = new TalkSectionOverlay( {
		title: 'Talk page',
		currentPageTitle: 'Talk:Talk page',
		licenseMsg: 'this is the license',
		id: section.id,
		api: {
			postWithToken: () => {
				alert( 'This should be an onReply callback but it is not.' );
				return Promise.resolve( {} );
			}
		},
		section,
		eventBus: {},
		onSaveComplete: action( 'onSaveComplete' )
	} );
	overlay.show();
	return overlay.$el[0];
};

_TalkSectionOverlay.story = {
	name: 'TalkSectionOverlay'
};
