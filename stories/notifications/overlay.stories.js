/* global $ */
import { storiesOf } from '@storybook/html';
import overlay from '../../src/mobile.startup/notifications/overlay';
import list from '../../src/mobile.notifications.overlay/list';
import m from '../../src/mobile.startup/moduleLoaderSingleton';
import { fakeEcho } from './utils';
import '../../node_modules/oojs-ui/dist/oojs-ui-core.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-wikimediaui.js';
import NotificationsFilterOverlay from '../../src/mobile.notifications.overlay/NotificationsFilterOverlay';
import { action } from '@storybook/addon-actions';

m.define( 'mobile.notifications.overlay', {
	list,
	echo: () => fakeEcho
} );

storiesOf( 'notifications' )
	.add( 'overlay',
		() => {
			const o = overlay( action( 'onCountChange' ),
				action( 'onNotificationListRendered' ), fakeEcho );
			o.show();
			return o.$el[0];
		}
	)
	.add( 'NotificationsFilterOverlay',
		() => {
			const o = new NotificationsFilterOverlay( {
				// eslint-disable-next-line no-jquery/no-parse-html-literal
				$notifReadState: $( '<div>$notifReadState</div>' ),
				// eslint-disable-next-line no-jquery/no-parse-html-literal
				$crossWikiUnreadFilter: $( '<div>$crossWikiUnreadFilter</div>' )
			} );
			o.show();
			return o.$el[0];
		}
	);
