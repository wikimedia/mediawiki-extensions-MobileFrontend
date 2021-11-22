import Anchor from '../src/mobile.startup/Anchor';
import '../.storybook/resolve-less-imports/mediawiki.ui.anchor/anchor.less';

export default {
	title: 'Anchor'
};

export const Normal = () =>
	new Anchor( {
		label: 'normal',
		href: 'https://wikipedia.org/wiki/Puppies'
	} ).$el[0];

Normal.story = {
	name: 'normal'
};

export const Progressive = () =>
	new Anchor( {
		label: 'progressive',
		progressive: true,
		href: 'https://wikipedia.org/wiki/Puppies'
	} ).$el[0];

Progressive.story = {
	name: 'progressive'
};

export const Destructive = () =>
	new Anchor( {
		label: 'destructive',
		events: {
			click: () => alert( 'DESTRUCTIVE!' )
		},
		destructive: true,
		href: 'https://wikipedia.org/wiki/Puppies'
	} ).$el[0];

Destructive.story = {
	name: 'destructive'
};
