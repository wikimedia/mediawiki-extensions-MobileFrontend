/* global $ */
import { storiesOf } from '@storybook/html';
import headers from '../src/mobile.startup/headers';
import Button from '../src/mobile.startup/Button';
import View from '../src/mobile.startup/View';
import icons from '../src/mobile.startup/icons';
import '../resources/mobile.startup/Overlay.less';
import '../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less';

storiesOf( 'headers' )
	.add( 'header',
		() => headers.header( 'Heading', [
			new Button( {
				tagName: 'button',
				// note special property of continue class here...
				additionalClassNames: 'continue',
				label: 'continue'
			} )
		] )
	)
	.add( 'header (with additional class and cancel)',
		() => headers.header( 'Heading', [
			new Button( {
				tagName: 'button',
				label: 'continue'
			} )
		], icons.cancel(), 'heading--class' )
	)
	.add( 'formHeader',
		() => headers.formHeader(
			`<div class="overlay-title">
	<form>
		<input style="width:99%;height:40px;" value="Remember to use .overlay-title when constructing formHeaders">
	</form>
</div>`,
			[
				new Button( {
					tagName: 'button',
					label: 'continue'
				} )
			]
		)
	)
	.add( 'formHeader (with View)',
		() => headers.formHeader(
			new View( {
				el: $( '<div>' ).addClass( 'overlay-title' ).text( 'views work too' )
			} ),
			[
				new Button( {
					tagName: 'button',
					label: 'continue'
				} )
			]
		)
	)
	.add( 'save',
		() => headers.saveHeader( 'Save?' )
	)
	.add( 'saving',
		() => {
			const heading = headers.savingHeader( 'Saving is hidden by default' );
			// Gotcha with using this as is.
			heading.classList.remove( 'hidden' );
			return heading;
		}
	);
