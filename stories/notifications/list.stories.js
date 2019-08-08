import { storiesOf } from '@storybook/html';
import list from '../../src/mobile.notifications.overlay/list';
import { fakeEcho } from './utils';
import { wrap, warning } from '../utils';
import { action } from '@storybook/addon-actions';
import '../../node_modules/oojs-ui/dist/oojs-ui-core.js';

storiesOf( 'notifications' )
	.add( '⚠️', () => warning(
		'Note: There are styling issues with this module due to the fact it should live in Echo (T221007)'
	) )
	.add( 'list',
		() => {
			const l = list( fakeEcho,
					new OO.ui.ButtonWidget( {
						icon: 'checkAll',
						title: mw.msg( 'echo-mark-all-as-read' )
					} ),
					action( 'onCountChange' ),
					action( 'onListRendered' )
				),
				content = document.createElement( 'div' );
			content.setAttribute( 'class', 'notifications-overlay' );
			content.appendChild(
				wrap( l, 'overlay-content' )
			);
			return content;
		}
	);
