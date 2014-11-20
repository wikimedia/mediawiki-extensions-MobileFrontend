( function ( M, $ ) {

	var module = ( function () {
		var
			Icon = M.require( 'Icon' ),
			inBeta = M.isBetaGroupMember(),
			CleanupOverlay = M.require( 'modules/issues/CleanupOverlay' );

		function extractMessage( $box ) {
			var selector = '.mbox-text, .ambox-text',
				$container = $( '<div>' );

			$box.find( selector ).each( function () {
				var contents,
					$this = $( this );
				// Clean up talk page boxes
				$this.find( 'table, .noprint' ).remove();
				contents = $this.html();

				if ( contents ) {
					$( '<p>' ).html( contents ).appendTo( $container );
				}
			} );
			return $container.html();
		}

		/*
		 * Render a banner in a containing element.
		 * @param {jQuery.Object} $container to render the page issues banner inside.
		 * @param {string} labelText what the label of the page issues banner should say
		 * @param {string} headingText the heading of the overlay that is created when the page issues banner is clicked
		 */
		function createBanner( $container, labelText, headingText ) {
			var selector = 'table.ambox, table.tmbox',
				$metadata = $container.find( selector ),
				issues = [],
				$link;

			// clean it up a little
			$metadata.find( '.NavFrame' ).remove();

			$metadata.each( function () {
				var issue, content,
					$this = $( this );

				if ( $this.find( selector ).length === 0 ) {
					// FIXME: [templates] might be inconsistent
					content = inBeta ? extractMessage( $this ) :
						$this.find( '.mbox-text, .ambox-text' ).html();

					issue = {
						// .ambox- is used e.g. on eswiki
						text: content
					};
					if ( content ) {
						issues.push( issue );
					}
				}
			} );

			$link = new Icon( {
					tagName: 'a',
					name: 'cleanup',
					hasText: true,
					label: labelText,
					additionalClassNames: 'mw-mf-cleanup'
				} )
				.$el.children().eq( 0 ).attr( 'href', '#/issues' );

			M.overlayManager.add( /^\/issues$/, function () {
				return new CleanupOverlay( {
					issues: issues,
					headingText: headingText
				} );
			} );

			$link.insertBefore( $metadata.eq( 0 ) );
			$metadata.remove();
		}

		function initPageIssues( $container ) {
			var ns = mw.config.get( 'wgNamespaceNumber' );
			if ( ns === 0 ) {
				createBanner( $container, mw.msg( 'mobile-frontend-meta-data-issues' ),
					mw.msg( 'mobile-frontend-meta-data-issues-header' ) );
			// Create a banner for talk pages (namespace 1) in beta mode to make them more readable.
			} else if ( ns === 1 && inBeta ) {
				createBanner( $container, mw.msg( 'mobile-frontend-meta-data-issues-talk' ),
					mw.msg( 'mobile-frontend-meta-data-issues-header-talk' ) );
			}
		}

		// Setup the issues banner on the page
		initPageIssues( M.getCurrentPage().getLeadSectionElement() );
		// Show it in edit preview.
		M.on( 'edit-preview', function ( overlay ) {
			initPageIssues( overlay.$el );
		} );

		return {
			createBanner: createBanner,
			_extractMessage: extractMessage
		};
	}() );

	M.define( 'cleanuptemplates', module );

}( mw.mobileFrontend, jQuery ) );
