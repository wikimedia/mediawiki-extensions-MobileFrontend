var references,
	Drawer = require( '../Drawer' ),
	util = require( '../util' ),
	icons = require( '../icons' ),
	ReferencesGateway = require( './ReferencesGateway' ),
	Icon = require( '../Icon' );

/**
 * Create a callback for clicking references
 * @param {Function} onNestedReferenceClick
 * @return {Function}
 */
function makeOnNestedReferenceClickHandler( onNestedReferenceClick ) {
	return ( ev ) => {
		const target = ev.target;
		if ( target.tagName === 'A' ) {
			onNestedReferenceClick(
				target.getAttribute( 'href' ),
				target.textContent
			);
			// Don't hide the already shown drawer via propagation
			// and stop default scroll behaviour.
			return false;
		}
	};
}

/**
 * Drawer for references
 * @uses Icon
 * @param {Object} props
 * @param {boolean} [props.error] whether an error has occurred
 * @param {string} props.title of reference e.g [1]
 * @param {string} props.text is the HTML of the reference
 * @param {Function} [props.onNestedReferenceClick] callback for when a reference
 *  inside the reference is clicked.
 * @return {Drawer}
 */
function referenceDrawer( props ) {
	let containerClassName = props.error ? new Icon( {
		name: 'error',
		hasText: true,
		isSmall: true
	} ).getClassName() : '';
	return new Drawer(
		util.extend(
			{
				closeOnScroll: false,
				className: 'drawer position-fixed text references-drawer',
				events: {
					'click sup': props.onNestedReferenceClick &&
						makeOnNestedReferenceClickHandler( props.onNestedReferenceClick )
				},
				children: [
					util.parseHTML( '<div>' )
						.addClass( 'references-drawer__header' )
						.append( [
							new Icon( {
								isSmall: true,
								name: 'citation-invert',
								additionalClassNames: 'references-drawer__title',
								hasText: true,
								label: mw.msg( 'mobile-frontend-references-citation' )
							} ).$el,
							icons.cancel( 'gray' ).$el
						] ),
					util.parseHTML( '<div>' ).addClass( containerClassName ).append(
						util.parseHTML( '<sup>' ).text( props.title ),
						props.text ?
							util.parseHTML( '<span>' ).html( props.text ) :
							icons.spinner().$el
					)
				]
			},
			props
		)
	);
}

references = {
	test: {
		makeOnNestedReferenceClickHandler
	},
	referenceDrawer,
	/**
	 * Fetch and render nested reference upon click
	 * @param {string} id of the reference to be retrieved
	 * @param {Page} page to locate reference for
	 * @param {string} refNumber the number it identifies as in the page
	 * @param {PageHTMLParser} pageHTMLParser
	 * @param {Gateway} gateway
	 * @return {jQuery.Deferred}
	 */
	showReference: function ( id, page, refNumber, pageHTMLParser, gateway ) {
		return gateway.getReference( id, page, pageHTMLParser ).then( function ( reference ) {
			const drawer = referenceDrawer( {
				title: refNumber,
				text: reference.text,
				onNestedReferenceClick: function ( href, text ) {
					references.showReference(
						href,
						page,
						text,
						pageHTMLParser,
						gateway
					);
				}
			} );
			drawer.show();
		}, function ( err ) {
			// If non-existent reference nothing to do.
			if ( err === ReferencesGateway.ERROR_NOT_EXIST ) {
				return;
			}

			const drawer = referenceDrawer( {
				error: true,
				title: refNumber,
				text: mw.msg( 'mobile-frontend-references-citation-error' )
			} );
			drawer.show();
		} );
	}
};

module.exports = references;
