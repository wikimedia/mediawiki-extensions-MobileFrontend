/* global $ */
import { storiesOf } from '@storybook/html';
import { wrap } from './utils';
import Overlay from '../src/mobile.startup/Overlay';
import Button from '../src/mobile.startup/Button';
import View from '../src/mobile.startup/View';
import '../resources/mobile.startup/Overlay.less';
import '../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less';

storiesOf( 'Overlay' )
	.add( 'Overlay with View as child',
		() => {
			return wrap(
				Overlay.make(
					{
						className: 'overlay visible',
						heading: 'Simple overlay'
					}, new Button( {
						progressive: true,
						block: true,
						events: {
							click: () => alert( 'Click the overlay close button to make it hide!' )
						},
						label: 'Click me!'
					} )
				),
				'overlay-enabled'
			);
		}
	)
	.add( 'Overlay with jQuery element as child', () => {
		return wrap(
			Overlay.make(
				{
					className: 'overlay visible',
					heading: 'Simple overlay'
				}, new View( {
					el: $( '<p>' ).text( `
					You can use the View class to add simple jQuery elements to the overlay body.
 Clicking the close icon will currently hide the overlay.
					` )
				} )
			),
			'overlay-enabled'
		);
	} )
	.add( 'Overlay without header', () => {
		return wrap(
			Overlay.make(
				{
					className: 'overlay visible',
					noHeader: true
				},
				new View( {
					el: $( '<div>' ).text( 'Overlay without header.' )
				} )
			),
			'overlay-enabled'
		);
	} )
	.add( 'Overlay that controls exiting', () => {
		return wrap(
			Overlay.make(
				{
					className: 'overlay visible',
					heading: 'Overlay that controls exiting',
					onBeforeExit: function ( exit, cancel ) {
						const yes = window.confirm( 'Are you sure you want to exit?' );
						if ( yes ) {
							exit();
						} else {
							cancel();
						}
					}
				}, new View( {
					el: $( '<textarea>' ).text( 'If you click the close button it will ask you to confirm. Use onBeforeExit for this magic.' )
				} )
			),
			'overlay-enabled'
		);
	} );
