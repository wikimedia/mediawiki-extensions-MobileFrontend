const Drawer = require( '../Drawer' ),
	util = require( '../util' ),
	icons = require( '../icons' ),
	ReferencesGateway = require( './ReferencesGateway' ),
	Icon = require( '../Icon' ),
	ReferencesHtmlScraperGateway = require( './ReferencesHtmlScraperGateway' ),
	IconButton = require( '../IconButton' );

/**
 * Create a callback for clicking references
 *
 * @ignore
 * @param {Function} onNestedReferenceClick
 * @return {Function}
 */
function makeOnNestedReferenceClickHandler( onNestedReferenceClick ) {
	return ( ev ) => {
		const target = ev.currentTarget.querySelector( 'a' );
		if ( target ) {
			onNestedReferenceClick(
				target.getAttribute( 'href' ),
				target.textContent
			);
			// Don't hide the already shown drawer via propagation
			return false;
		}
	};
}

/**
 * Drawer for references
 *
 * @memberof module:mobile.startup/references
 * @uses IconButton
 * @param {Object} props
 * @param {boolean} [props.error] whether an error has occurred
 * @param {string} props.title of reference e.g [1]
 * @param {string} props.text is the HTML of the reference
 * @param {string} [props.parentText] is the HTML of the parent reference if there is one
 * @param {boolean} props.isSubref true when this reference has a parent
 * @param {Function} [props.onNestedReferenceClick] callback for when a reference
 *  inside the reference is clicked.
 * @return {module:mobile.startup/Drawer}
 */
function referenceDrawer( props ) {
	const errorIcon = props.error ? new IconButton( {
		name: 'error',
		isSmall: true
	} ).$el : null;

	const mainRef = props.isSubref ? props.parentText : props.text;
	const mainRefHtml = util.parseHTML( '<div>' )
		.addClass( 'main-reference-content' )
		.html( mainRef );
	if ( !mainRef ) {
		mainRefHtml.append( icons.spinner().$el );
	}
	const subRefHtml = props.isSubref ?
		util.parseHTML( '<div>' ).html( props.text ) : '';

	return new Drawer(
		util.extend(
			{
				showCollapseIcon: false,
				className: 'drawer position-fixed text references-drawer',
				events: {
					'click sup a': ( ev ) => {
						// Stop default scroll to hash fragment behaviour.
						ev.preventDefault();
					},
					'click sup': props.onNestedReferenceClick &&
						makeOnNestedReferenceClickHandler( props.onNestedReferenceClick )
				},
				children: [
					util.parseHTML( '<div>' )
						.addClass( 'references-drawer__header' )
						.append( [
							new Icon( {
								icon: 'reference',
								isSmall: true
							} ).$el,
							util.parseHTML( '<span>' ).addClass( 'references-drawer__title' ).text( mw.msg( 'mobile-frontend-references-citation' ) ),
							icons.cancel( 'gray', {
								isSmall: true
							} ).$el
						] ),

					// Add .mw-parser-output so that TemplateStyles styles apply (T244510)
					util.parseHTML( '<div>' ).addClass( 'mw-parser-output' ).append( [
						errorIcon,
						util.parseHTML( '<sup>' ).text( props.title ),
						mainRefHtml,
						subRefHtml
					] )
				]
			},
			props
		)
	);
}

/**
 * Internal for use inside Minerva only. See {@link module:mobile.startup} for access.
 *
 * @exports module:mobile.startup/references
 */
const references = {
	test: {
		makeOnNestedReferenceClickHandler
	},
	ReferencesHtmlScraperGateway,
	referenceDrawer,
	/**
	 * Fetch and render nested reference upon click
	 *
	 * @param {string} id of the reference to be retrieved
	 * @param {Page} page to locate reference for
	 * @param {string} refNumber the number it identifies as in the page
	 * @param {module:mobile.startup/PageHTMLParser} pageHTMLParser
	 * @param {module:mobile.startup/references~Gateway} gateway
	 * @param {Object} props for referenceDrawer
	 * @param {Function} onShowNestedReference function call when a nested reference is triggered.
	 * @return {jQuery.Deferred}
	 */
	showReference( id, page, refNumber, pageHTMLParser, gateway, props,
		onShowNestedReference
	) {
		return gateway.getReference( id, page, pageHTMLParser ).then( ( reference ) => {
			const drawer = referenceDrawer( util.extend( {
				title: refNumber,
				text: reference.text,
				parentText: reference.parentText,
				isSubref: reference.isSubref,
				onNestedReferenceClick( href, text ) {
					references.showReference(
						href,
						page,
						text,
						pageHTMLParser,
						gateway
					).then( ( nestedDrawer ) => {
						if ( props.onShowNestedReference ) {
							onShowNestedReference( drawer, nestedDrawer );
						} else {
							mw.log.warn( 'Please provide onShowNestedReferences parameter.' );
							document.body.appendChild( nestedDrawer.$el[0] );
							drawer.hide();
							nestedDrawer.show();
						}
					} );
				}
			}, props ) );
			return drawer;
		}, ( err ) => {
			// If non-existent reference nothing to do.
			if ( err === ReferencesGateway.ERROR_NOT_EXIST ) {
				return;
			}

			return referenceDrawer( {
				error: true,
				title: refNumber,
				text: mw.msg( 'mobile-frontend-references-citation-error' )
			} );
		} );
	}
};

module.exports = references;
