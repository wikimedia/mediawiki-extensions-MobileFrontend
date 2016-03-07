( function ( M, $ ) {
	var drawer, referencesData,
		context = M.require( 'mobile.context/context' ),
		isBeta = context.isBetaGroupMember(),
		ReferencesDrawer = M.require( 'mobile.references/ReferencesDrawer' );

	/**
	 * Return a data structure indexing all references in the given page.
	 * @method
	 * @ignore
	 * @param {Page} page to retrieve references for
	 * @returns {jQuery.Deferred} resolving with an Object indexing all references
	 */
	function getReferenceData( page ) {
		var api,
			d = $.Deferred();

		if ( referencesData ) {
			d.resolve( referencesData );
		} else {
			api = new mw.Api();
			api.get( {
				action: 'query',
				prop: 'references',
				formatversion: 2,
				titles: [ page.getTitle() ]
			} ).then( function ( data ) {
				if ( data && data.query && data.query.pages && data.query.pages.length ) {
					referencesData = data.query.pages[0].references;
				} else {
					referencesData = {};
				}
				d.resolve( referencesData );
			} ).fail( $.proxy( d, 'reject' ) );
		}
		return d;
	}

	/**
	 * Return the matched reference among the children of ol.references
	 * @method
	 * @ignore
	 * @param {String} id CSS selector
	 * @param {Page} page to retrieve reference for
	 * @returns {jQuery.Deferred} resolves with an Object representing reference
	 */
	function getReference( id, page ) {
		var $el,
			config = mw.config.get( 'wgMFLazyLoadReferences' ),
			EditorGateway = M.require( 'mobile.editor.api/EditorGateway' ),
			editorGateway = new EditorGateway( {
				api: new mw.Api(),
				title: page.getTitle()
			} ),
			d = $.Deferred(),
			// Escape (almost) all CSS selector meta characters
			// see http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
			meta = /[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g;

		id = id.replace( meta, '\\$&' );
		if ( config.base || ( isBeta && config.beta ) ) {
			id = id.substr( 1, id.length );
			// FIXME: Use a gateway for this (?)
			getReferenceData( page ).then( function ( references ) {
				var ref = references[id];
				if ( !ref ) {
					d.reject();
				} else if ( ref.html ) {
					// use cached version to avoid lookup
					d.resolve( {
						text: ref.html
					} );
				} else {
					// reference was provided raw so we now need to parse it.
					editorGateway.getPreview( {
						text: ref.text
					} ).done( function ( parsedText ) {
						// cache for later use
						ref.html = parsedText;
						d.resolve( {
							text: parsedText
						} );
					} ).fail( $.proxy( d, 'reject' ) );
				}
			} ).fail( $.proxy( d, 'reject' ) );
		} else {
			// Use find rather than string concatenation
			$el = page.$( 'ol.references' ).find( id );
			if ( $el.length ) {
				d.resolve( {
					text: $el.html()
				} );
			} else {
				d.reject();
			}
		}
		return d;
	}

	/**
	 * Event handler to show reference when a reference link is clicked
	 * @method
	 * @ignore
	 * @param {jQuery.Event} ev Event object
	 */
	function showReference( ev ) {
		var $dest = $( this ),
			href = $dest.attr( 'href' );

		if ( !drawer ) {
			// Note we only initialise here to avoid adding to DOM unnecessarily
			// (Drawer currently auto appends within the postRender function )
			drawer = new ReferencesDrawer();
		}
		getReference( href, $dest.data( 'page' ) ).done( function ( reference ) {
			drawer.render( {
				title: $dest.text(),
				text: reference.text
			} );
		} ).fail( function () {
			drawer.render( {
				error: true,
				title: $dest.text(),
				text: mw.msg( 'mobile-frontend-references-citation-error' )
			} );
		} );

		ev.preventDefault();
		// don't hide drawer (stop propagation of click) if it is already shown (e.g. click another reference)
		if ( drawer.isVisible() ) {
			ev.stopPropagation();
		} else {
			// flush any existing reference information
			drawer.render( {
				text: undefined
			} );
			// use setTimeout so that browser calculates dimensions before show()
			setTimeout( $.proxy( drawer, 'show' ), 0 );
		}
	}

	/**
	 * Make references clickable and show a drawer when clicked on.
	 * @method
	 * @ignore
	 * @param {Page} page Defaults to $( '#bodyContent' )
	 */
	function setup( page ) {
		page.$( 'sup a' ).off( 'click' )
			.data( 'page', page )
			.on( 'click', showReference );
		page.$( '.mw-cite-backlink a' ).off( 'click' );
	}

	M.define( 'mobile.references/references', {
		getReference: getReference,
		setup: setup
	} );

}( mw.mobileFrontend, jQuery ) );
