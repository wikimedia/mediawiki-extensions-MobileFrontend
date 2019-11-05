import { storiesOf } from '@storybook/html';
import overlay from '../../src/mobile.startup/talk/overlay';
import talkBoard from '../../src/mobile.talk.overlays/talkBoard';
import m from '../../src/mobile.startup/moduleLoaderSingleton';
import { section, otherSection } from './data';

m.define( 'mobile.talk.overlays/talkBoard', talkBoard );

storiesOf( 'talk' )
	.add( 'overlay',
		() => {
			const talkOverlay = overlay( 'test', {
				getSections: () => Promise.resolve( [
					section, otherSection
				] )
			} );
			talkOverlay.show();
			return talkOverlay.$el[0];
		}
	);
