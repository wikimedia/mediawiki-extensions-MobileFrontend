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

storiesOf( 'Drawer' )
	.add( 'default',
		() => {
			const drawer = new Drawer( {
				children: [
					$( '<div>' ).text( 'Text of drawer' )
				],
				onShow: action( 'onShow' )
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	)
	.add( 'CtaDrawer',
		() => {
			const drawer = CtaDrawer( {
				content: 'This is the call to action. Will you take it?',
				onShow: action( 'onShow' )
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
				onShow: action( 'onShow' ),
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
				onShow: action( 'onShow' ),
				text: '<span>error occurred</span>',
				error: true
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	)
	.add( 'blockMessageDrawer (global admin)',
		() => {
			const drawer = blockMessageDrawer( {
				blockId: 1,
				partial: true,
				blockedbyid: 0,
				creator: {
					name: 'Global>Admin'
				},
				reason: 'Constant vandalism',
				duration: '10 days',
				expiry: '(1st September 2019)'
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	)
	.add( 'blockMessageDrawer (unknown user)',
		() => {
			const drawer = blockMessageDrawer( {
				blockId: 1,
				partial: true,
				blockedbyid: 0,
				creator: {
					name: undefined
				},
				reason: 'Constant vandalism',
				duration: '10 days',
				expiry: '(1st September 2019)'
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
				expiry: '(1st September 2019)'
			} );
			drawer.show();
			return wrap( drawer, 'drawer-container' );
		}
	);
