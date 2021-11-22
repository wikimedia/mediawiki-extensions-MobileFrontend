import Button from '../src/mobile.startup/Button';
import { action } from '@storybook/addon-actions';

import '../.storybook/resolve-less-imports/mediawiki.ui.button/button.less';

export default {
	title: 'Button'
};

export const Normal = () =>
	new Button( {
		label: 'normal'
	} ).$el[0];

Normal.story = {
	name: 'normal'
};

export const Progressive = () =>
	new Button( {
		progressive: true,
		label: 'progressive',
		href: 'https://wikipedia.org'
	} ).$el[0];

Progressive.story = {
	name: 'progressive'
};

export const DestructiveNoHref = () =>
	new Button( {
		destructive: true,
		label: 'destructive'
	} ).$el[0];

DestructiveNoHref.story = {
	name: 'destructive (no href)'
};

export const _DestructiveNoHref = () =>
	new Button( {
		destructive: true,
		events: {
			click: action( 'click' )
		},
		label: 'destructive'
	} ).$el[0];

_DestructiveNoHref.story = {
	name: 'destructive (no href)'
};

export const StackedButtons = () => {
	const container = document.createElement( 'div' );
	[
		new Button( {
			label: '1'
		} ).$el[0],
		new Button( {
			label: '2'
		} ).$el[0],
		new Button( {
			label: '3'
		} ).$el[0]
	].forEach( ( node ) => container.appendChild( node ) );
	return container;
};

StackedButtons.story = {
	name: 'stacked buttons'
};

export const StackedBlockButtons = () => {
	const container = document.createElement( 'div' );
	[
		new Button( {
			block: true,
			label: '1'
		} ).$el[0],
		new Button( {
			block: true,
			label: '2'
		} ).$el[0],
		new Button( {
			block: true,
			label: '3'
		} ).$el[0]
	].forEach( ( node ) => container.appendChild( node ) );
	return container;
};

StackedBlockButtons.story = {
	name: 'stacked block buttons'
};
