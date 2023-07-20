import { action } from '@storybook/addon-actions';
import IconButton from '../src/mobile.startup/IconButton';
import '../.storybook/icons.less';
import '../resources/mobile.startup/icon.less';

export default {
	title: 'Icon'
};

export const ArrowsSmallNormal = () => {
	const container = document.createElement( 'div' );
	[
		new IconButton( {
			icon: 'expand',
			isSmall: true,
			label: 'Arrow small',
			events: {
				click: action( 'click' )
			}
		} ),
		new IconButton( {
			icon: 'expand',
			label: 'Arrow',
			events: {
				click: action( 'click' )
			}
		} )
	].forEach( ( node ) => container.appendChild( node.$el[0] ) );
	return container;
};

ArrowsSmallNormal.story = {
	name: 'arrows (small, normal)'
};

export const ArrowRotated180Degrees = () => {
	const container = document.createElement( 'div' );
	[
		new IconButton( {
			icon: 'expand',
			isSmall: true,
			rotation: 180,
			label: 'Arrow',
			events: {
				click: action( 'click' )
			}
		} ),
		new IconButton( {
			icon: 'expand',
			rotation: 180,
			label: 'Arrow',
			events: {
				click: action( 'click' )
			}
		} ),
		new IconButton( {
			icon: 'expand',
			isSmall: true,
			rotation: 180,
			label: 'Arrow small',
			hasText: true,
			events: {
				click: action( 'click' )
			}
		} ),
		new IconButton( {
			icon: 'expand',
			rotation: 180,
			label: 'Arrow',
			hasText: true,
			events: {
				click: action( 'click' )
			}
		} )
	].forEach( ( node ) => container.appendChild( node.$el[0] ) );
	return container;
};

ArrowRotated180Degrees.story = {
	name: 'arrow rotated 180 degrees'
};

export const ArrowWithLabel = () => {
	const container = document.createElement( 'div' );
	[
		new IconButton( {
			icon: 'expand',
			isSmall: true,
			label: 'Arrow small',
			hasText: true,
			events: {
				click: action( 'click' )
			}
		} ),
		new IconButton( {
			icon: 'expand',
			label: 'Arrow',
			hasText: true,
			events: {
				click: action( 'click' )
			}
		} )
	].forEach( ( node ) => container.appendChild( node.$el[0] ) );
	return container;
};

ArrowWithLabel.story = {
	name: 'arrow with label'
};
