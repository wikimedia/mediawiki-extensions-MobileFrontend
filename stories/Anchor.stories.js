import { storiesOf } from '@storybook/html';
import Anchor from '../src/mobile.startup/Anchor';
import '../.storybook/resolve-less-imports/mediawiki.ui/components/anchors.less';

storiesOf( 'Anchor' )
	.add( 'normal',
		() => new Anchor( {
			label: 'normal',
			href: 'https://wikipedia.org/wiki/Puppies'
		} ).$el[0]
	)
	.add( 'progressive',
		() => new Anchor( {
			label: 'progressive',
			progressive: true,
			href: 'https://wikipedia.org/wiki/Puppies'
		} ).$el[0]
	)
	.add( 'destructive', () => new Anchor( {
		label: 'destructive',
		events: {
			click: () => alert( 'DESTRUCTIVE!' )
		},
		destructive: true,
		href: 'https://wikipedia.org/wiki/Puppies'
	} ).$el[0]
	);
