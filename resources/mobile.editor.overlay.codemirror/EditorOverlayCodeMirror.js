( function ( M, $ ) {
	var EditorOverlay = M.require( 'modules/editor/EditorOverlay' ),
		EditorOverlayCodeMirror;

	/**
	 * Overlay that shows an editor
	 * @class EditorOverlayCodeMirror
	 * @extends EditorOverlay
	 */
	EditorOverlayCodeMirror = EditorOverlay.extend( {
		templatePartials: $.extend( {}, EditorOverlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.editor.overlay', 'content.hogan' )
		} ),

		/** @inheritdoc **/
		onInputWikitextEditor: function ( codeMirror ) {
			this.api.setContent( codeMirror.getValue() );
			this.$( '.continue, .submit' ).prop( 'disabled', false );
		},

		/** @inheritdoc **/
		setContent: function () {
			EditorOverlay.prototype.setContent.apply( this, arguments );

			this.codeMirror = CodeMirror.fromTextArea( this.$content[0], {
				mwextFunctionSynonyms: mw.config.get( 'extCodeMirrorFunctionSynonyms' ),
				mwextTags: mw.config.get( 'extCodeMirrorTags' ),
				mwextDoubleUnderscore: mw.config.get( 'extCodeMirrorDoubleUnderscore' ),
				mwextUrlProtocols: mw.config.get( 'extCodeMirrorUrlProtocols' ),
				mwextModes: mw.config.get( 'extCodeMirrorExtModes' ),
				styleActiveLine: true,
				lineWrapping: true,
				readOnly: this.$content[0].readOnly, // doesn't allow to edit read-only pages
				viewportMargin: Infinity, // lets automatically resize to fit its content
				scrollbarStyle: 'null', // never needed but sometimes displayed
				mode: 'text/mediawiki'
			} );
			this.$codeMirror = this.$( '.CodeMirror' );
			// IE specific code goes here
			if ( window.navigator.userAgent.indexOf( 'Trident/' ) > -1 ) {
				this.$codeMirror.addClass( 'CodeMirrorIE' );
			}
			this.$codeMirror.height( 'auto' ); // lets automatically resize to fit its content
			// @see http://codemirror.net/doc/manual.html#event_change
			this.codeMirror.on( 'change', $.proxy( this, 'onInputWikitextEditor' ) );
		},

		/** @inheritdoc **/
		getContent: function () {
			return this.codeMirror.getValue();
		},

		/** @inheritdoc **/
		onStageChanges: function () {
			this.$codeMirror.hide();
			EditorOverlay.prototype.onStageChanges.apply( this, arguments );
		},

		/** @inheritdoc **/
		_hidePreview: function () {
			this.$codeMirror.show();
			this.codeMirror.refresh();
			EditorOverlay.prototype._hidePreview.apply( this, arguments );
			this.$content.hide();
		}
	} );

	M.define( 'modules/editor/EditorOverlayCodeMirror', EditorOverlayCodeMirror );
}( mw.mobileFrontend, jQuery ) );
