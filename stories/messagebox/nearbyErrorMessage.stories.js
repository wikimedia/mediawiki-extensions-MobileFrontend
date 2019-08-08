import { storiesOf } from '@storybook/html';
import nearbyErrorMessage from '../../src/mobile.special.nearby.scripts/nearbyErrorMessage.js';
import '../../resources/mobile.special.nearby.styles/specialNearby.less';
import '../../resources/mobile.messageBox.styles/messageBox.less';

storiesOf( 'messagebox' )
	.add( 'nearbyErrorMessage (permission)',
		() => nearbyErrorMessage( 'permission' ).$el[0]
	)
	.add( 'nearbyErrorMessage (location)',
		() => nearbyErrorMessage( 'location' ).$el[0]
	)
	.add( 'nearbyErrorMessage (empty)',
		() => nearbyErrorMessage( 'empty' ).$el[0]
	)
	.add( 'nearbyErrorMessage (http)',
		() => nearbyErrorMessage( 'http' ).$el[0]
	)
	.add( 'nearbyErrorMessage (incompatible)',
		() => nearbyErrorMessage( 'incompatible' ).$el[0]
	)
	.add( 'nearbyErrorMessage (default)',
		() => nearbyErrorMessage( 'blah' ).$el[0]
	);
