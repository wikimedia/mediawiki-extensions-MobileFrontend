/* global $ */
import { storiesOf } from '@storybook/html';
import Drawer from '../src/mobile.startup/Drawer';
import { wrap } from './utils';
import { action } from '@storybook/addon-actions';
import CtaDrawer from '../src/mobile.startup/CtaDrawer';
import references from '../src/mobile.startup/references/references';
import blockMessageDrawer from '../src/mobile.editor.overlay/blockMessageDrawer';
import '../resources/mobile.editor.overlay/BlockMessageDetails.less';
import '../resources/mobile.startup/Drawer.less';
import '../resources/mobile.startup/references/ReferencesDrawer.less';
import '../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/drawers.less';

Drawer.prototype.appendToElement = '.drawer-container';
storiesOf( 'Drawer' )
	.add( 'default',
		() => {
			const drawer = new Drawer( {
				children: [
					$( '<div>' ).text( 'Text of drawer' )
				]
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	)
	.add( 'CtaDrawer',
		() => {
			const drawer = CtaDrawer( {
				content: 'This is the call to action. Will you take it?'
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	)
	.add( 'referenceDrawer',
		() => {
			const drawer = references.referenceDrawer( {
				title: '[1]',
				onNestedReferenceClick: action( 'onNestedReferenceClick' ),
				text: '<a href="#">Wikipedia</a> is a reference <sup><a href="#/ref">[1]</a></sup>.'
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	)
	.add( 'referenceDrawer with error',
		() => {
			const drawer = references.referenceDrawer( {
				title: '[1]',
				text: '<span>error occurred</span>',
				error: true
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	)
	.add( 'blockMessageDrawer',
		() => {
			const drawer = blockMessageDrawer( {
				blockId: 1,
				partial: true,
				creator: {
					name: 'Jon',
					url: 'https://jdlrobson.com'
				},
				reason: 'Constant vandalism',
				duration: '10 days',
				expiry: 'Sept 1st'
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	);
