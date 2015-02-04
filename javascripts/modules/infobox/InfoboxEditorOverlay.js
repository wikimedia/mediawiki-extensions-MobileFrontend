( function ( M, $ ) {
	var InfoboxEditorOverlay,
		pageTitle = mw.config.get( 'wgTitle' ),
		icons = M.require( 'icons' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		WikiDataItemLookupInputWidget = M.require( 'modules/infobox/WikiDataItemLookupInputWidget' ),
		Overlay = M.require( 'Overlay' );

	/**
	 * A Wikidata generated infobox editor
	 * @class InfoboxEditorOverlay
	 * @extends Overlay
	 */
	InfoboxEditorOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.title Page title
		 * @cfg {String} defaults.descriptionLabel WikiData description of the page
		 */
		defaults: {
			title: pageTitle,
			descriptionLabel: mw.msg( 'mobile-frontend-wikidata-editor-description-label', pageTitle )
		},
		/** @inheritdoc */
		events: $.extend( {}, Overlay.prototype.events, {
			'click .submit': 'onSave'
		} ),
		/**
		 * @inheritdoc
		 */
		templatePartials: {
			spinner: icons.spinner,
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			header: mw.template.get( 'mobile.infobox', 'EditorOverlayHeader.hogan' ),
			content: mw.template.get( 'mobile.infobox', 'EditorOverlayContent.hogan' )
		},
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			var self = this;
			this.infobox = options.infobox;
			Overlay.prototype.initialize.apply( this, arguments );
			this.infobox.emit( 'load' );
			// make sure the infobox has fully intialized.
			this.infobox.getDeferred().done( function () {
				self.render( self.infobox.options );
				self.$( '.spinner' ).remove();
				self.$( '.editor-interface' ).removeClass( 'hidden' );
			} );
		},
		/**
		 * Enhances existing DOM elements in view with OOUI LookupInputWidgets
		 */
		setupLookupInputWidgets: function () {
			var self = this;

			this.$( '.editable-field' ).each( function () {
				var widget, src,
					$field = $( this ),
					$answers = $( '<div class="answers">' ),
					type = $field.parent().data( 'type' ),
					label = $field.data( 'label' );

				if ( type === 'wikibase-item' ) {
					widget = new WikiDataItemLookupInputWidget( {
						value: label,
						appendToAnswer: $answers.insertBefore( this ),
						claimId: $field.parent().data( 'id' ),
						api: self.infobox.api
					} );
					$field.empty().append( widget.$element );
				} else if ( type === 'commonsMedia' ) {
					src = $field.data( 'src' );
					if ( src ) {
						$field.empty().append( $( '<img>' ).attr( 'src', src  ) );
					}
				} else {
					$field.text( label );
				}
			} );
		},
		/**
		 * Event handler that runs whenever a save has been fully executed.
		 */
		onSaveComplete: function () {
			// clear the existing hash for the refresh
			window.location.hash = '';
			window.location.query = 'cachebust=' + Math.random();
			// Give time for wikidata to update...
			window.setTimeout( function () {
				window.location.reload();
			}, 300 );
		},
		/**
		 * Event handler that runs when the user clicks save.
		 */
		onSave: function () {
			var self = this,
				$answers = this.$( '.answers' ).children(),
				api = self.infobox.getApi(),
				changesToStage = $answers.length,
				queue = [],
				loader = new LoadingOverlay(),
				val = self.$( '.description' ).val();

			loader.show();
			/**
			 * Executes save commands sequentially to avoid edit conflicts due to
			 * use of centralauth tokens
			 * @ignore
			 */
			function completeSaveEvent() {
				var args;
				if ( queue.length === 0 ) {
					self.onSaveComplete.apply( self );
				} else {
					args = queue.pop();
					api.saveClaim.apply( api, args ).always( completeSaveEvent );
				}
			}
			$( this ).prop( 'disabled', true );
			$answers.each( function () {
				var $answer = $( this );
				queue.push( [ $answer.data( 'id' ), $answer.data( 'value' ) ] );
			} );
			if ( this.initialDescriptionValue !== val ) {
				changesToStage += 1;
				api.saveDescription( val ).always( completeSaveEvent );
			} else {
				completeSaveEvent();
			}
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			Overlay.prototype.postRender.apply( this, arguments );
			this.initialDescriptionValue = $( '.description' ).val();
			this.setupLookupInputWidgets();
		}
	} );

	M.define( 'modules/InfoboxEditorOverlay', InfoboxEditorOverlay );

}( mw.mobileFrontend, jQuery ) );
