import { storiesOf } from '@storybook/html';
import Icon from '../src/mobile.startup/Icon';
// Assumes core is accessible using standard directory structure
import '../../../resources/src/mediawiki.ui/components/icons.less';
import '../resources/mobile.startup/icon.less';

// Note quiet and block
storiesOf( 'Icon' )
	.add( 'arrow',
		() => new Icon( {
			name: 'arrow',
			label: 'I Arrow',
			events: {
				click: () => alert( 'do arrow thing!' )
			}
		} ).$el[0]
	)
	.add( 'arrow rotated 180 degrees',
		() => new Icon( {
			name: 'arrow',
			rotation: 180,
			label: 'I also Arrow',
			events: {
				click: () => alert( 'do arrow thing!' )
			}
		} ).$el[0]
	)
	.add( 'arrow with label',
		() => new Icon( {
			name: 'arrow',
			label: 'I arrow',
			hasText: true,
			events: {
				click: () => alert( 'do arrow thing!' )
			}
		} ).$el[0]
	);
