( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' );

	/**
	 * @typedef {Object} PageIssue
	 * @property {string} icon html associated with Icon component
	 * @property {string} text html explaining the details of the issue
	 * @property {string} severity associated with the issue
	 */

	/**
	 * Obtain severity associated with a given $target node
	 * by looking at associated parent node (defined by template)
	 *
	 * @param {jQuery.Object} $target
	 * @return {string} severity as defined in associated PageIssue
	 */
	function parseSeverity( $target ) {
		return $target.parents( '.issue-notice' ).data( 'severity' );
	}

	/**
	 * Overlay for displaying page issues
	 * @class CleanupOverlay
	 * @extends Overlay
	 *
	 * @param {Object} options Configuration options
	 * @param {string} options.headingText
	 * @param {PageIssue[]} options.issues list of page issues for display
	 * @fires CleanupOverlay#link-edit-click
	 * @fires CleanupOverlay#link-internal-click
	 */
	function CleanupOverlay( options ) {
		options.heading = '<strong>' + options.headingText + '</strong>';
		Overlay.call( this, options );
	}

	OO.mfExtend( CleanupOverlay, Overlay, {
		/**
		 * @memberof CleanupOverlay
		 * @instance
		 */
		className: 'overlay overlay-cleanup',
		/**
		 * @memberof CleanupOverlay
		 * @instance
		 */
		events: util.extend( {}, Overlay.prototype.events, {
			'click a:not(.external):not([href*=edit])': 'onInternalClick',
			'click a[href*="edit"]': 'onEditClick'
		} ),
		/**
		 * @memberof CleanupOverlay
		 * @instance
		 */
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.issues', 'OverlayContent.hogan' )
		} ),
		/**
		 * Event that is triggered when an internal link inside the overlay is clicked
		 * This event will not be triggered if the link contains the edit keyword, in which
		 * case onEditClick will be fired
		 * This is primarily used for instrumenting page issues
		 * (see https://meta.wikimedia.org/wiki/Schema:PageIssues)
		 * @param {jQuery.Event} ev
		 * @memberof CleanupOverlay
		 * @instance
		 */
		onInternalClick: function ( ev ) {
			/**
			 * @event CleanupOverlay#link-internal-click
			 * @param {string} severity
			 */
			this.emit( 'link-internal-click', parseSeverity( this.$( ev.target ) ) );
		},
		/**
		 * Event that is triggered when an edit link inside the overlay is clicked
		 * This is primarily used for instrumenting page issues
		 * (see https://meta.wikimedia.org/wiki/Schema:PageIssues)
		 * @param {jQuery.Event} ev
		 * @memberof CleanupOverlay
		 * @instance
		 */
		onEditClick: function ( ev ) {
			/**
			 * @event CleanupOverlay#link-edit-click
			 * @param {string} severity
			 */
			this.emit( 'link-edit-click', parseSeverity( this.$( ev.target ) ) );
		}
	} );
	M.define( 'mobile.issues/CleanupOverlay', CleanupOverlay ); // resource-modules-disable-line
}( mw.mobileFrontend ) );
