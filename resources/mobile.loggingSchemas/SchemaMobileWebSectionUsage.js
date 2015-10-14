( function ( M, $ ) {
	var SchemaMobileWebSectionUsage,
		Schema = M.require( 'mobile.startup/Schema' ),
		user = M.require( 'mobile.user/user' ),
		browser = M.require( 'mobile.browser/browser' );

	/**
	 * @class SchemaMobileWebSectionUsage
	 * @extends Schema
	 */
	SchemaMobileWebSectionUsage = Schema.extend( {
		/**
		 * @inheritdoc
		 */
		isSampled: true,
		/**
		 * @inheritdoc
		 */
		samplingRate: 0.01,
		/** @inheritdoc **/
		name: 'MobileWebSectionUsage',
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.isTablet whether the screen resolution is over 768px
		 * @cfg {String} defaults.sessionId unique session id for user
		 * @cfg {Boolean} defaults.hasServiceWorkerSupport whether the user is able to use service workers.
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			isTablet: browser.isWideScreen(),
			sessionId: user.getSessionId(),
			hasServiceWorkerSupport: 'serviceWorker' in navigator
		} ),
		/**
		 * Enables the schema for the current page.
		 *
		 * @param {Page} page to enable the logger for
		 */
		enable: function ( page ) {
			var defaults = {
				sectionCount: page.getSections().length,
				pageId: page.getId(),
				namespace: page.getNamespaceId()
			};
			$.extend( this.defaults, defaults );
		}
	} );

	M.define( 'mobile.loggingSchemas/SchemaMobileWebSectionUsage', SchemaMobileWebSectionUsage );

} )( mw.mobileFrontend, jQuery );
