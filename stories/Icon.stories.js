import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import Icon from '../src/mobile.startup/Icon';
import '../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mediawiki.ui.icon/mediawiki.ui.icon.less';
import '../resources/mobile.startup/icon.less';

storiesOf( 'Icon' )
	.add( 'arrows (small, normal)',
		() => {
			const container = document.createElement( 'div' );
			[
				new Icon( {
					name: 'expand',
					isSmall: true,
					label: 'Arrow small',
					events: {
						click: action( 'click' )
					}
				} ),
				new Icon( {
					name: 'expand',
					label: 'Arrow',
					events: {
						click: action( 'click' )
					}
				} )
			].forEach( ( node ) => container.appendChild( node.$el[0] ) );
			return container;
		}
	)
	.add( 'arrow rotated 180 degrees',
		() => {
			const container = document.createElement( 'div' );
			[
				new Icon( {
					name: 'expand',
					isSmall: true,
					rotation: 180,
					label: 'Arrow',
					events: {
						click: action( 'click' )
					}
				} ),
				new Icon( {
					name: 'expand',
					rotation: 180,
					label: 'Arrow',
					events: {
						click: action( 'click' )
					}
				} ),
				new Icon( {
					name: 'expand',
					isSmall: true,
					rotation: 180,
					label: 'Arrow small',
					hasText: true,
					events: {
						click: action( 'click' )
					}
				} ),
				new Icon( {
					name: 'expand',
					rotation: 180,
					label: 'Arrow',
					hasText: true,
					events: {
						click: action( 'click' )
					}
				} )
			].forEach( ( node ) => container.appendChild( node.$el[0] ) );
			return container;
		}
	)
	.add( 'arrow with label',
		() => {
			const container = document.createElement( 'div' );
			[
				new Icon( {
					name: 'expand',
					isSmall: true,
					label: 'Arrow small',
					hasText: true,
					events: {
						click: action( 'click' )
					}
				} ),
				new Icon( {
					name: 'expand',
					label: 'Arrow',
					hasText: true,
					events: {
						click: action( 'click' )
					}
				} )
			].forEach( ( node ) => container.appendChild( node.$el[0] ) );
			return container;
		} );
