( function ( M ) {
	var SchemaMobileWebUIClickTracking,
		SchemaMobileWebClickTracking = M.require(
			'mobile.loggingSchemas/SchemaMobileWebClickTracking' );

	/**
	 * @class SchemaMobileWebUIClickTracking
	 * @extends SchemaMobileWebClickTracking
	 */
	SchemaMobileWebUIClickTracking = SchemaMobileWebClickTracking.extend( {
		/** @inheritdoc **/
		name: 'MobileWebUIClickTracking',
		/** @inheritdoc */
		isSampled: true,
		/** @inheritdoc */
		samplingRate: 0.1
	} );

	M.define( 'mobile.loggingSchemas/SchemaMobileWebUIClickTracking',
		SchemaMobileWebUIClickTracking );
} )( mw.mobileFrontend );
