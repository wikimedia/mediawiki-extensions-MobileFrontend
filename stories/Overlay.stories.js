import { wrap } from './utils';
import Overlay from '../src/mobile.startup/Overlay';
import Button from '../src/mobile.startup/Button';
import View from '../src/mobile.startup/View';
import '../resources/mobile.startup/Overlay.less';
import '../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less';

export default {
	title: 'Overlay'
};

export const OverlayWithViewAsChild = () => {
	return wrap(
		Overlay.make(
			{
				className: 'overlay visible',
				heading: 'Simple overlay'
			},
			new Button( {
				progressive: true,
				block: true,
				events: {
					click: () =>
						alert(
							'Click the overlay close button to make it hide!'
						)
				},
				label: 'Click me!'
			} )
		),
		'overlay-enabled'
	);
};

OverlayWithViewAsChild.story = {
	name: 'Overlay with View as child'
};

export const OverlayWithJQueryElementAsChild = () => {
	return wrap(
		Overlay.make(
			{
				className: 'overlay visible',
				heading: 'Simple overlay'
			},
			new View( {
				el: $( '<p>' ).text( `
                    You can use the View class to add simple jQuery elements to the overlay body.
 Clicking the close icon will currently hide the overlay.
                    ` )
			} )
		),
		'overlay-enabled'
	);
};

OverlayWithJQueryElementAsChild.story = {
	name: 'Overlay with jQuery element as child'
};

export const OverlayWithoutHeader = () => {
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
};

OverlayWithoutHeader.story = {
	name: 'Overlay without header'
};

export const OverlayThatControlsExiting = () => {
	return wrap(
		Overlay.make(
			{
				className: 'overlay visible',
				heading: 'Overlay that controls exiting',
				onBeforeExit: function ( exit, cancel ) {
					const yes = window.confirm(
						'Are you sure you want to exit?'
					);
					if ( yes ) {
						exit();
					} else {
						cancel();
					}
				}
			},
			new View( {
				el: $( '<textarea>' ).text(
					'If you click the close button it will ask you to confirm. Use onBeforeExit for this magic.'
				)
			} )
		),
		'overlay-enabled'
	);
};

OverlayThatControlsExiting.story = {
	name: 'Overlay that controls exiting'
};
