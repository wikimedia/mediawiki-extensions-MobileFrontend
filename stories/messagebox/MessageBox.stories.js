import { storiesOf } from '@storybook/html';

import MessageBox from '../../src/mobile.startup/MessageBox';
import '../../resources/mobile.messageBox.styles/messageBox.less';

storiesOf( 'messagebox' )
	.add( 'MessageBox (error)', () => {
		return new MessageBox( {
			heading: 'Bad error',
			className: 'errorbox',
			msg: 'Oh no <strong>everything</strong> is broken!'
		} ).$el[0];
	} )
	.add( 'MessageBox (warning)', () => {
		return new MessageBox( {
			heading: 'Warning',
			className: 'warningbox',
			msg: 'Just to let you know in case you care.'
		} ).$el[0];
	} )
	.add( 'MessageBox (success)', () => {
		return new MessageBox( {
			heading: 'Yes!',
			className: 'successbox',
			msg: 'You did it!'
		} ).$el[0];
	} );
