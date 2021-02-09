import headers from '../src/mobile.startup/headers';
import Button from '../src/mobile.startup/Button';
import View from '../src/mobile.startup/View';
import icons from '../src/mobile.startup/icons';
import '../resources/mobile.startup/Overlay.less';
import '../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less';

export default {
	title: 'headers'
};

export const Header = () =>
	headers.header( 'Heading', [
		new Button( {
			tagName: 'button',
			// note special property of continue class here...
			additionalClassNames: 'continue',
			label: 'continue'
		} )
	] );

Header.story = {
	name: 'header'
};

export const HeaderWithAdditionalClassAndCancel = () =>
	headers.header(
		'Heading',
		[
			new Button( {
				tagName: 'button',
				label: 'continue'
			} )
		],
		icons.cancel(),
		'heading--class'
	);

HeaderWithAdditionalClassAndCancel.story = {
	name: 'header (with additional class and cancel)'
};

export const FormHeader = () =>
	headers.formHeader(
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
	);

FormHeader.story = {
	name: 'formHeader'
};

export const FormHeaderWithView = () =>
	headers.formHeader(
		new View( {
			el: $( '<div>' ).addClass( 'overlay-title' ).text( 'views work too' )
		} ),
		[
			new Button( {
				tagName: 'button',
				label: 'continue'
			} )
		]
	);

FormHeaderWithView.story = {
	name: 'formHeader (with View)'
};

export const Save = () => headers.saveHeader( 'Save?' );

Save.story = {
	name: 'save'
};

export const Saving = () => {
	const heading = headers.savingHeader( 'Saving is hidden by default' );
	// Gotcha with using this as is.
	heading.classList.remove( 'hidden' );
	return heading;
};

Saving.story = {
	name: 'saving'
};
