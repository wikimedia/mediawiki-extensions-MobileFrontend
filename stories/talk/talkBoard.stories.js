import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import talkBoard from '../../src/mobile.talk.overlays/talkBoard';
import Section from '../../src/mobile.startup/Section';
import '../../resources/mobile.talk.overlays/talk.less';
import '../../resources/mobile.startup/Overlay.less';
import '../../resources/mobile.pagelist.styles/pagelist.less';
import { section, otherSection } from './data';

storiesOf( 'talk' )
	.add( 'talkBoard (empty)',
		() => wrap( talkBoard( [] ) )
	)
	.add( 'talkBoard (items)',
		() => wrap(
			talkBoard( [
				new Section( section ),
				new Section( otherSection )
			] )
		)
	);
