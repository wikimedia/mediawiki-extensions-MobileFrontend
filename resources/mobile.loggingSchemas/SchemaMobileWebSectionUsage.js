( function ( M, $ ) {
	var SchemaMobileWebSectionUsage,
		Schema = M.require( 'mobile.startup/Schema' ),
		user = M.require( 'mobile.user/user' ),
		browser = M.require( 'mobile.browser/browser' ),
		experiments = mw.config.get( 'wgMFExperiments' );

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
		samplingRate: mw.config.get( 'wgMFSchemaMobileWebSectionUsageSampleRate' ),
		/** @inheritdoc **/
		name: 'MobileWebSectionUsage',
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.isTablet whether the screen width is over tablet width threshold
		 * @cfg {String} defaults.sessionId unique session id for user
		 * @cfg {Boolean} defaults.hasServiceWorkerSupport whether the user is able to use service workers.
		 * @cfg {Boolean} defaults.isTestA whether the user is in the bucket A of the A/B test.
		 *   Defaults to false if the sectionCollapsing experiment is not enabled.
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			isTablet: browser.isWideScreen(),
			sessionId: user.getSessionId(),
			hasServiceWorkerSupport: 'serviceWorker' in navigator,
			isTestA: false
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

			if ( experiments.sectionCollapsing ) {
				defaults.isTestA = mw.experiments.getBucket(
						experiments.sectionCollapsing, mw.user.sessionId() ) === 'A';
			}
			$.extend( this.defaults, defaults );
		}
	} );

	M.define( 'mobile.loggingSchemas/SchemaMobileWebSectionUsage', SchemaMobileWebSectionUsage );

} )( mw.mobileFrontend, jQuery );
