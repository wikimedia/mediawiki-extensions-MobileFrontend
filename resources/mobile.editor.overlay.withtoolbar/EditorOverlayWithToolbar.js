( function ( M, $ ) {
	var EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' ),
		AddReferenceOverlay = M.require( 'mobile.editor.overlay.withtoolbar/AddReferenceOverlay' );

	/**
	 * Overlay that shows an editor
	 * @class EditorOverlayWithToolbar
	 * @extends EditorOverlay
	 */
	function EditorOverlayWithToolbar() {
		EditorOverlay.apply( this, arguments );
	}

	OO.mfExtend( EditorOverlayWithToolbar, EditorOverlay, {
		templatePartials: $.extend( {}, EditorOverlay.prototype.templatePartials, {
			footer: mw.template.get( 'mobile.editor.overlay.withtoolbar', 'editorFooter.hogan' )
		} ),
		/** @inheritdoc **/
		postRender: function () {
			var self = this;

			this._initializeEditorButtons();
			EditorOverlay.prototype.postRender.apply( this, arguments );
			// check, if the toolbar should be still visible on resize
			setTimeout( function () {
				self.onResize();
			}, 0 );
			// repeat the check whenever the screen size changes
			M.on( 'resize', $.proxy( this, 'onResize' ) );
		},

		/**
		 * Creates several basic buttons to better work with wikitext
		 */
		_initializeEditorButtons: function () {
			var formattingTools,
				toolFactory = new OO.ui.ToolFactory(),
				toolGroupFactory = new OO.ui.ToolGroupFactory(),
				toolbar = new OO.ui.Toolbar( toolFactory, toolGroupFactory );

			/**
			 * Creates and returns a new Tool object with the given data
			 * @param {String} group The group this Tool should been
			 * @param {String} name The name of this Tool
			 * @param {String} icon Name of the icon to use
			 * @param {String} title Title of the Tool
			 * @param {Function} callback Function to call, when this Tool is selected
			 * @return {OO.ui.Tool}
			 * @ignore
			 */
			function getToolButton( group, name, icon, title, callback ) {
				/**
				 * Creates a new instance of OO.ui.Tool
				 * @param {String} group The group this Tool should been
				 * @param {Object} [config] Configuration options
				 */
				var toolButton = function ( group, config ) {
					// Parent constructor
					OO.ui.Tool.call( this, group, config );
				};

				// inherit OO.ui.Tool
				OO.inheritClass( toolButton, OO.ui.Tool );

				/**
				 * Handle the tool being selected.
				 */
				toolButton.prototype.onSelect = function () {
					callback.call( this );
					// we don't want to leave the button selected
					this.setActive( false );
				};
				/**
				 * Toolbar update state handler.
				 */
				toolButton.prototype.onUpdateState = function () {
					// do nothing
				};

				// set properties
				toolButton.static.name = name;
				toolButton.static.group = group;
				toolButton.static.title = title;
				toolButton.static.icon = icon;

				return toolButton;
			}
			// Array of buttons to add to the toolbar and their data
			formattingTools = [
				[ 'formattingTools', 'bold', 'bold', mw.msg( 'mobile-frontend-editor-bold' ), $.proxy( this, 'onWrapOrAddDefault', 'bold' ) ],
				[ 'formattingTools', 'italic', 'italic', mw.msg( 'mobile-frontend-editor-italic' ), $.proxy( this, 'onWrapOrAddDefault', 'italic' ) ],
				[ 'formattingTools', 'reference', 'reference', mw.msg( 'mobile-frontend-editor-reference' ), $.proxy( this, 'onAddReference' ) ]
			];
			// add the buttons to the toolbar
			$.each( formattingTools, function ( i, data ) {
				toolFactory.register( getToolButton( data[0], data[1], data[2], data[3], data[4] ) );
			} );

			toolbar.setup( [ {
				// include the button group in this toolbar
				include: [ {
					group: 'formattingTools'
				} ]
			} ] );
			// add the toolbar to the toolbar container
			this.$( '.toolbar' ).append( toolbar.$element );
		},

		/**
		 * Handles a click on a toolbar Tool button and wraps
		 * the selected text (if any) into the action's pre- and post
		 * signs. If no text is selected it adds an example to the cursor
		 * position.
		 * @param {String} action The performed action
		 */
		onWrapOrAddDefault: function ( action ) {
			var parts = {};

			// set pre and post and default strings
			switch ( action ) {
				case 'bold':
					parts = {
						pre: '\'\'\'',
						peri: mw.msg( 'mobile-frontend-editor-bold-text' ) + ' ',
						post: '\'\'\''
					};
					break;
				case 'italic':
					parts = {
						pre: '\'\'',
						peri: mw.msg( 'mobile-frontend-editor-italic-text' ) + ' ',
						post: '\'\''
					};
					break;
			}
			// replace/add the text to the content
			this.onInputWikitextEditor();
			this.$content.textSelection( 'encapsulateSelection', parts );
		},

		/**
		 * Handles a click on the "add reference" button and opens a simple Overlay to add
		 * a source/cite/reference to the text.
		 */
		onAddReference: function () {
			var self = this,
				referenceOverlay = new AddReferenceOverlay( {
					editorOverlay: this
				} );

			// Open the Overlay and handle the hide event
			referenceOverlay.on( 'hide', function () {
				self.show();
			} ).show();

			// When closing this overlay, also close the child section overlay
			this.on( 'hide', function () {
				referenceOverlay.remove();
			} );
		},

		/**
		 * @inheritdoc
		 */
		onStageChanges: function () {
			this.$( '.overlay-footer-container' ).hide();
			EditorOverlay.prototype.onStageChanges.apply( this, arguments );
		},

		/**
		 * resize-event handler. Check if the overlay height is big enough to hold
		 * the textarea and the toolbar and both is still visible. If not, hide the
		 * toolbar.
		 */
		onResize: function () {
			this.$( '.toolbar' ).toggleClass( 'hidden', this.$el.innerHeight() <= 200 );
		},

		/**
		 * @inheritdoc
		 */
		_hidePreview: function () {
			this.$( '.overlay-footer-container' ).show();
			EditorOverlay.prototype._hidePreview.apply( this, arguments );
		}
	} );

	M.define( 'mobile.editor.overlay.withtoolbar/EditorOverlayWithToolbar', EditorOverlayWithToolbar );
}( mw.mobileFrontend, jQuery ) );
