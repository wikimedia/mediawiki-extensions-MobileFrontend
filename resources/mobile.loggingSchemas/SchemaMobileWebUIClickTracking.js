( function ( M ) {
	var SchemaMobileWebClickTracking = M.require(
		'mobile.loggingSchemas/SchemaMobileWebClickTracking' );

	/**
	 * @class SchemaMobileWebUIClickTracking
	 * @extends SchemaMobileWebClickTracking
	 */
	function SchemaMobileWebUIClickTracking() {
		SchemaMobileWebClickTracking.apply( this, arguments );
	}

	OO.mfExtend( SchemaMobileWebUIClickTracking, SchemaMobileWebClickTracking, {
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
