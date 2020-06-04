var util = require( './util' ),
	Button = require( './Button' ),
	icons = require( './icons' );

/**
 * Creates a header
 *
 * @param {string|View} headingOrView (HTML allowed)
 * @param {View[]} headerActions
 * @param {View} [headerCancel] defaults to cancel button
 * @param {string} [additionalClassNames] (should be escaped)
 * @return {Element}
 */
function makeHeader( headingOrView, headerActions, headerCancel, additionalClassNames ) {
	const heading = typeof headingOrView === 'string' ? headingOrView : undefined,
		templateData = {
			hasActions: headerActions && headerActions.length,
			isHidden: false,
			heading
		},
		html = util.template( `
<div class="overlay-header header ${additionalClassNames || ''} hideable">
	<ul class="header-cancel">
		<li></li>
	</ul>
	{{{heading}}}
	{{#hasActions}}
	<div class="header-action"></div>
	{{/hasActions}}
</div>
		` ).render( templateData );
	headerCancel = headerCancel || icons.cancel();
	const $el = util.parseHTML( html );
	// Truncate any text inside in the overlay header.
	$el.find( 'h2 span' ).addClass( 'truncated-text' );
	$el.find( '.header-cancel li' ).append(
		headerCancel.$el
	);
	if ( heading === undefined ) {
		headingOrView.$el.insertAfter( $el.find( '.header-cancel' ) );
	}
	if ( headerActions && headerActions.length ) {
		$el.find( '.header-action' ).append(
			headerActions.map( function ( component ) {
				return component.$el;
			} )
		);
	}
	return $el[0];
}

/**
 * Creates a header with a h2 heading
 *
 * @param {string} heading (HTML allowed)
 * @param {View[]} headerActions
 * @param {View} [headerCancel] defaults to cancel button
 * @param {string} [additionalClassNames] (should be escaped)
 * @return {Element}
 */
function header( heading, headerActions, headerCancel, additionalClassNames ) {
	heading = `<div class="overlay-title"><h2>${heading}</h2></div>`;
	return makeHeader( heading, headerActions, headerCancel, additionalClassNames );
}

/**
 * Creates a header with a form
 *
 * @param {string|View} formHTMLOrView of the header
 * @param {View[]} headerActions
 * @param {View} [headerCancel] defaults to cancel button
 * @param {string} [additionalClassNames] (should be escaped)
 * @return {Element}
 */
function formHeader( formHTMLOrView, headerActions, headerCancel, additionalClassNames ) {
	return makeHeader( formHTMLOrView, headerActions, headerCancel, additionalClassNames );
}

/**
 * Creates a header with a form
 *
 * @param {string} heading of the header
 * @param {string} additionalClassNames of the header
 * @return {Element}
 */
function saveHeader( heading, additionalClassNames ) {
	return header(
		heading,
		[
			new Button( {
				tagName: 'button',
				additionalClassNames: 'save submit',
				disabled: true,
				label: util.saveButtonMessage()
			} )
		],
		icons.back(),
		additionalClassNames
	);
}
/**
 * Creates a header with a form
 *
 * @param {string} heading of the header
 * @param {string} additionalClassNames of the header
 * @return {Element}
 */
function savingHeader( heading ) {
	return header(
		heading,
		[
			icons.spinner( {
				additionalClassNames: 'savespinner loading'
			} )
		],
		icons.cancel(),
		'saving-header hidden'
	);
}

module.exports = {
	savingHeader: savingHeader,
	saveHeader: saveHeader,
	formHeader: formHeader,
	header: header
};
