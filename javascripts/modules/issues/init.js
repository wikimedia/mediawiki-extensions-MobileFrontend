( function ( M, $ ) {

	var module = ( function () {
		var context = M.require( 'context' ),
			Icon = M.require( 'Icon' ),
			overlayManager = M.require( 'overlayManager' ),
			inBeta = context.isBetaGroupMember(),
			CleanupOverlay = M.require( 'modules/issues/CleanupOverlay' );

		/**
		 * Extract a summary message from a cleanup template generated element that is
		 * friendly for mobile display.
		 * @param {Object} $box element to extract the message from
		 * @ignore
		 * @return {String} html of message.
		 */
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

		/**
		 * Create a link element that opens the issues overlay.
		 *
		 * @ignore
		 *
		 * @param {String} labelText The text value of the element
		 * @return {jQuery}
		 */
		function createLinkElement( labelText ) {
			if ( inBeta ) {
				return $( '<a class="cleanup mw-mf-cleanup"></a>' )
					.text( labelText );
			}

			return new Icon( {
					tagName: 'a',
					name: 'cleanup',
					hasText: true,
					label: labelText,
					additionalClassNames: 'mw-mf-cleanup'
				} ).$el;
		}

		/**
		 * Render a banner in a containing element.
		 * @param {jQuery.Object} $container to render the page issues banner inside.
		 * @param {String} labelText what the label of the page issues banner should say
		 * @param {String} headingText the heading of the overlay that is created when the page issues banner is clicked
		 * @ignore
		 */
		function createBanner( $container, labelText, headingText ) {
			var selector = 'table.ambox, table.tmbox, table.cmbox',
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

			$link = createLinkElement( labelText );
			$link.attr( 'href', '#/issues' );

			overlayManager.add( /^\/issues$/, function () {
				return new CleanupOverlay( {
					issues: issues,
					headingText: headingText
				} );
			} );

			if ( inBeta && $metadata.length ) {
				$( '.pre-content' ).append( $link );
			} else {
				$link.insertBefore( $metadata.eq( 0 ) );
			}

			$metadata.remove();
		}

		/**
		 * Scan an element for any known cleanup templates and replace them with a button
		 * that opens them in a mobile friendly overlay.
		 * @ignore
		 */
		function initPageIssues() {
			var ns = mw.config.get( 'wgNamespaceNumber' ),
				$container = ns === 14 ? $( '#content' ) : M.getCurrentPage().getLeadSectionElement(),
				labelMsgKey = 'mobile-frontend-meta-data-issues';

			if ( inBeta ) {
				labelMsgKey += '-beta';
			}

			if ( ns === 0 ) {
				createBanner( $container, mw.msg( labelMsgKey ),
					mw.msg( 'mobile-frontend-meta-data-issues-header' ) );
			// Create a banner for talk pages (namespace 1) in beta mode to make them more readable.
			} else if ( ns === 1 ) {
				createBanner( $container, mw.msg( 'mobile-frontend-meta-data-issues-talk' ),
					mw.msg( 'mobile-frontend-meta-data-issues-header-talk' ) );
			} else if ( ns === 14 && inBeta ) {
				createBanner( $container, mw.msg( 'mobile-frontend-meta-data-issues-categories' ),
					mw.msg( 'mobile-frontend-meta-data-issues-header-talk' ) );
			}
		}

		// Setup the issues banner on the page
		initPageIssues();
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
