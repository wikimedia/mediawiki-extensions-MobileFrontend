( function ( M ) {
	var context = M.require( 'mobile.context/context' ),
		samplingRates = mw.config.get( 'wgMFSchemaMobileWebLanguageSwitcherSampleRate', {} ),
		/*
		 * MobileWebLanguageSwitcher schema
		 * https://meta.wikimedia.org/wiki/Schema:MobileWebLanguageSwitcher
		 */
		schemaMobileWebLanguageSwitcher = new mw.eventLog.Schema(
			'MobileWebLanguageSwitcher',
			( context.isBetaGroupMember() ? samplingRates.beta : samplingRates.stable ) || 0,
			{
				// throwing in the timestamp to have a better chance of being unique ;)
				funnelToken: mw.user.generateRandomSessionId() + new Date().getTime(),
				mobileMode: mw.config.get( 'wgMFMode' )
			}
		);

	/**
	 * @ignore
	 * @param {String} topic
	 * @param {Object} data
	 */
	function logger( topic, data ) {
		schemaMobileWebLanguageSwitcher.log( data );
		// stop logging when the user decides to close the modal
		if ( data.exitModal === 'dismissed' ) {
			mw.trackUnsubscribe( logger );
		}
	}

	mw.trackSubscribe( 'mf.schemaMobileWebLanguageSwitcher', logger );
}( mw.mobileFrontend ) );
