( function ( M ) {
	var Toast,
		settingsKey = 'mobileFrontend/toast',
		settings = M.require( 'settings' ),
		Drawer = M.require( 'Drawer' );

	/**
	 * Auto-expiring notification.
	 * @class
	 * @extends Drawer
	 */
	Toast = Drawer.extend( {
		className: 'toast position-fixed',
		minHideDelay: 1000,
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			Drawer.prototype.postRender.call( this );
			this._showPending();
		},
		/**
		 * Show the toast message with a given class and content
		 * @method
		 * @param {String} content Content to be placed in element
		 * @param {String} className class to add to element
		 */
		show: function ( content, className ) {
			this.$el
				.html( content )
				.removeAttr( 'class' )
				.addClass( this.className )
				.addClass( className );
			Drawer.prototype.show.apply( this, arguments );
		},
		/**
		 * Save the toast data in settings so that we can show it on page reload.
		 * Also check whether there is a pending message that's not shown yet.
		 * If yes, output a warning message and discard this message.
		 * This is to ensure that the page needs to be reloaded before adding
		 * a new message for showing later.
		 * @method
		 * @param {String} content Content to be placed in element
		 * @param {String} className class to add to element
		 */
		showOnPageReload: function ( content, className ) {
			if ( settings.get( settingsKey ) ) {
				mw.log.warn(
					'A pending toast message already exits. ' +
					'The page should have been reloaded by now.'
				);
				return;
			}
			settings.save( settingsKey, JSON.stringify( {
				content: content,
				className: className
			} ) );
		},
		/**
		 * Show the previously saved toast data and delete it from settings
		 * @private
		 */
		_showPending: function () {
			var data = settings.get( settingsKey );
			if ( data ) {
				data = JSON.parse( data );
				this.show( data.content, data.className );
				settings.remove( settingsKey );
			}
		}
	} );

	M.define( 'toast', new Toast() );

}( mw.mobileFrontend ) );
