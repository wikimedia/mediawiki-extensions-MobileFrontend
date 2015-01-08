( function ( M, $ ) {

	var context = M.require( 'context' ),
		Overlay = M.require( 'Overlay' ),
		Icon = M.require( 'Icon' ),
		LeadPhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		buttonMsg = mw.msg( 'mobile-frontend-first-upload-wizard-new-page-3-ok' ),
		UploadTutorial;

	/**
	 * Overlay for displaying upload tutorial
	 * @class UploadTutorial
	 * @extends Overlay
	 * @uses Icon
	 * @uses LeadPhotoUploaderButton
	 */
	UploadTutorial = Overlay.extend( {
		template: mw.template.get( 'mobile.uploads', 'UploadTutorial.hogan' ),
		className: 'overlay carousel tutorial content-overlay',

		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.slideLeftButton HTML of the slide left button.
		 * @cfg {String} defaults.slideRightButton HTML of the slide right button.
		 * @cfg {Boolean} defaults.inBeta Whether the user is a beta group member.
		 * @cfg {Array} defaults.pages Array of {Object}s that will be used as options to
		 * create pages. Defaults to the following pages:
		 *  * Informative statement about where images come from.
		 *  * Guidance on avoiding copyright materials shown to first time users on
		 *    [[Special:Uploads]].
		 *  * Question asking user if they understood the tutorial.
		 */
		defaults: {
			slideLeftButton: new Icon( {
				name: 'previous',
				additionalClassNames: 'slider-button prev'
			} ).toHtmlString(),
			slideRightButton: new Icon( {
				name: 'next',
				additionalClassNames: 'slider-button next'
			} ).toHtmlString(),
			inBeta: context.isBetaGroupMember(),
			pages: [
				{
					caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-1-header' ),
					text: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-1' )
				},
				{
					caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-2-header' ),
					text: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-2' )
				},
				{
					caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-3-header' ),
					button: buttonMsg
				}
			]
		},

		/** @inheritdoc */
		postRender: function ( options ) {
			var self = this,
				$button = this.$( '.button' );

			if ( options.funnel ) {
				new LeadPhotoUploaderButton( {
					el: $button,
					buttonCaption: buttonMsg,
					funnel: options.funnel
				} );
				$button.on( 'click', function () {
					// need timeout for the file dialog to open
					setTimeout( $.proxy( self, 'hide' ), 0 );
					setTimeout( $.proxy( self, 'emit', 'hide' ), 0 );
				} );
			}

			this.page = 0;
			this.totalPages = options.pages.length;
			this.$( '.prev' ).on( 'click', $.proxy( this, 'previous' ) );
			this.$( '.next' ).on( 'click', $.proxy( this, 'next' ) );

			this._showCurrentPage();

			Overlay.prototype.postRender.apply( this, arguments );
		},

		/**
		 * Show current page inside the upload tutorial
		 * @method
		 * @private
		 */
		_showCurrentPage: function () {
			this.$( '.slide' ).removeClass( 'active' ).eq( this.page ).addClass( 'active' );
			this.$( '.prev' ).toggle( this.page > 0 );
			this.$( '.next' ).toggle( this.page < this.totalPages - 1 );
		},

		/**
		 * Show next page of the tutorial
		 * @method
		 */
		next: function () {
			this.page += 1;
			this._showCurrentPage();
		},

		/**
		 * Show previous page of the tutorial
		 * @method
		 */
		previous: function () {
			this.page -= 1;
			this._showCurrentPage();
		}
	} );

	M.define( 'modules/uploads/UploadTutorial', UploadTutorial );

}( mw.mobileFrontend, jQuery ) );
