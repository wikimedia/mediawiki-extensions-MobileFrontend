( function ( M, $ ) {
	var Overlay = M.require( 'mobile.overlays/Overlay' );

	/**
	 * Overlay that shows an editor
	 * @class AddReferenceOverlay
	 * @extends Overlay
	 */
	function AddReferenceOverlay() {
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( AddReferenceOverlay, Overlay, {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.referenceMsg Label of the reference input field
		 * @cfg {String} defaults.heading Title of the error reporting interface
		 * logging in.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			referenceMsg: mw.msg( 'mobile-frontend-editor-reference-placeholder' ),
			heading: mw.msg( 'mobile-frontend-editor-insert-reference' ),
			headerButtonsListClassName: 'overlay-action',
			headerButtons: [ {
				className: 'submit',
				msg: mw.msg( 'mobile-frontend-editor-add-reference' )
			} ]
		} ),
		/**
		 * @inheritdoc
		 */
		templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.editor.overlay.withtoolbar', 'contentAddReference.hogan' )
		} ),
		/**
		 * @inheritdoc
		 */
		events: $.extend( {}, Overlay.prototype.events, {
			'click button.submit': 'onSubmitClick'
		} ),
		/**
		 * Handle a click on the submit button
		 */
		onSubmitClick: function () {
			var parts = {
					pre: '<ref>',
					peri: $( '.referenceInput' ).val(),
					post: '</ref>'
				};

			this.options.editorOverlay.$content.textSelection( 'encapsulateSelection', parts );
			this.hide();
		},

		/**
		 * @inheritdoc
		 */
		onExit: function () {
			this.hide();
			return false;
		}
	} );

	M.define( 'mobile.editor.overlay.withtoolbar/AddReferenceOverlay', AddReferenceOverlay );
}( mw.mobileFrontend, jQuery ) );
