import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import AbuseFilterPanel from '../../src/mobile.editor.overlay/AbuseFilterPanel';
import '../../resources/mobile.editor.overlay/editor.less';
import '../../resources/mobile.startup/panel.less';

storiesOf( 'editor' )
	.add( 'AbuseFilterPanel warning',
		() => {
			const panel = new AbuseFilterPanel( {
				overlayManager: {
					add: function () {}
				}
			} );
			panel.show( 'warning', 'This is a warning' );
			return wrap( panel, 'editor-overlay overlay visible' );
		}
	)
	.add( 'AbuseFilterPanel disallow', () => {
		const panel = new AbuseFilterPanel( {
			overlayManager: {
				add: function () {}
			}
		} );
		panel.show( 'disallow', 'This is not allowed.' );
		return wrap( panel, 'editor-overlay overlay visible' );
	} );
