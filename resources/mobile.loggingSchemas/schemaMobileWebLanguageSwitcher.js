( function ( M ) {
	var context = M.require( 'mobile.context/context' ),
		samplingRates = mw.config.get( 'wgMFSchemaMobileWebLanguageSwitcherSampleRate', {} ),
		ignoreSamplingRate = mw.config.get( 'wgMFIgnoreEventLoggingBucketing' ),
		schemaMobileWebLanguageSwitcher =  {};

	/** @ignore */
	function getSamplingRate() {
		var result;

		if ( ignoreSamplingRate ) {
			return 1;
		}

		result = context.isBetaGroupMember() ? samplingRates.beta : samplingRates.stable;

		return result || 0;
	}

	if ( mw.eventLog ) {
		schemaMobileWebLanguageSwitcher = new mw.eventLog.Schema(
			'MobileWebLanguageSwitcher',
			getSamplingRate(),
			{
				// throwing in the timestamp to have a better chance of being unique ;)
				funnelToken: mw.user.generateRandomSessionId() + new Date().getTime(),
				mobileMode: mw.config.get( 'wgMFMode' )
			}
		);
	}

	/**
	 * Whether to stop sending EventLogging events
	 *
	 * @ignore
	 * @type {Boolean}
	 */
	schemaMobileWebLanguageSwitcher.stopLogging = false;

	/**
	 * A wrapper around mw.eventLog.Schema.log that only logs when logging
	 * hasn't been stopped with the 'stopLogging' variable.
	 * TODO: upstream a method that does this easily
	 * @ignore
	 */
	schemaMobileWebLanguageSwitcher.log = function () {
		if ( !this.stopLogging ) {
			if ( mw.eventLog ) {
				mw.eventLog.Schema.prototype.log.apply( this, arguments );
			}
		}
	};

	M.define( 'mobile.loggingSchemas/schemaMobileWebLanguageSwitcher', schemaMobileWebLanguageSwitcher );
}( mw.mobileFrontend ) );
