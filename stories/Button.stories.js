import { storiesOf } from '@storybook/html';
import Button from '../src/mobile.startup/Button';
import { action } from '@storybook/addon-actions';

import '../.storybook/resolve-less-imports/mediawiki.ui/components/buttons.less';

storiesOf( 'Button' )
	.add( 'normal',
		() => new Button( {
			label: 'normal'
		} ).$el[0]
	)
	.add( 'progressive',
		() => new Button( {
			progressive: true,
			label: 'progressive',
			href: 'https://wikipedia.org'
		} ).$el[0]
	)
	.add( 'destructive (no href)',
		() => new Button( {
			destructive: true,
			label: 'destructive'
		} ).$el[0]
	)
	.add( 'destructive (no href)',
		() => new Button( {
			destructive: true,
			events: {
				click: action( 'click' )
			},
			label: 'destructive'
		} ).$el[0]
	)
	.add( 'stacked buttons', () => {
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
	}
	)
	.add( 'stacked block buttons',
		() => {
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
		}
	);
