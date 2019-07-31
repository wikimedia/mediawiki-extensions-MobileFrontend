var references = require( './references' );

/**
 * @deprecated
 * @param {Object} props
 * @param {ReferenceGateway} props.gateway
 * @return {Object} a backwards compatible object to ensure compatibility with
 * Minerva.
 */
module.exports = function ( props ) {
	mw.log.warn( 'Using deprecated ReferencesDrawer. Use `mw.mobileFrontend.require( "mobile.startup" ).references.showReference();`' );
	return {
		ReferencesDrawer: references.referenceDrawer,
		showReference: function ( id, page, refNumber, pageHTMLParser ) {
			references.showReference(
				id, page, refNumber, pageHTMLParser, props.gateway
			);
		},
		render: () => {},
		isVisible: () => false
	};
};
