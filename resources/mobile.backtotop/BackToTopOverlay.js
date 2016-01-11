( function ( M, $ ) {

	var View = M.require( 'mobile.view/View' );

	/**
	 * Displays a little arrow at the bottom right of the viewport.
	 * @class BackToTopOverlay
	 * @extends View
	 */
	function BackToTopOverlay() {
		View.apply( this, arguments );
	}

	OO.mfExtend( BackToTopOverlay, View, {
		/**
		 * @inheritdoc
		 */
		className: 'backtotop',
		/**
		 * @inheritdoc
		 */
		template: mw.template.get( 'mobile.backtotop', 'BackToTopOverlay.hogan' ),
		/**
		 * @inheritdoc
		 */
		events: $.extend( {}, View.prototype.events, {
			click: 'onBackToTopClick'
		} ),

		/**
		 * Show the back to top element, if it's not visible already.
		 */
		show: function () {
			this.$el.css( 'visibility', 'visible' ).addClass( 'visible' );
		},

		/**
		 * Hide the back to top element, if it's visible.
		 */
		hide: function () {
			this.$el.removeClass( 'visible' );
		},

		/**
		 * Handles the click on the "Back to top" element and scrolls back
		 * to the top smoothly.
		 */
		onBackToTopClick: function () {
			$( 'html, body' ).animate( { scrollTop: 0 }, 400 );
		}
	} );

	M.define( 'mobile.backtotop/BackToTopOverlay', BackToTopOverlay );

}( mw.mobileFrontend, jQuery ) );
