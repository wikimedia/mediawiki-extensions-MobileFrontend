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
		className: 'overlay carousel tutorial content-overlay tutorial-overlay',

		/** @inheritdoc */
		events: $.extend( {}, Overlay.prototype.events, {
			'click .prev': 'onPreviousClick',
			'click .next': 'onNextClick',
			'click .button': 'onClickUploadButton'
		} ),
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
				name: 'previous'
			} ).toHtmlString(),
			slideRightButton: new Icon( {
				name: 'next'
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
			var $button = this.$( '.button' ),
				photoUploaderButton;

			if ( options.funnel ) {
				photoUploaderButton = new LeadPhotoUploaderButton( {
					el: $button,
					buttonCaption: buttonMsg,
					funnel: options.funnel
				} );
			}

			this.page = 0;
			this.totalPages = options.pages.length;
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
		 * Event that is fired when clicking the final button at the end of the tutorial.
		 * @method
		 */
		onClickUploadButton: function () {
			this.emit( 'hide' );
			// FIXME: this is a hack. Not sure why this is needed but without it
			// when escaping the upload interface you will still see it.
			this.$el.hide();
		},

		/**
		 * Show next page of the tutorial
		 * @method
		 */
		onNextClick: function () {
			this.page += 1;
			this._showCurrentPage();
		},

		/**
		 * Show previous page of the tutorial
		 * @method
		 */
		onPreviousClick: function () {
			this.page -= 1;
			this._showCurrentPage();
		}
	} );

	M.define( 'modules/uploads/UploadTutorial', UploadTutorial );

}( mw.mobileFrontend, jQuery ) );
