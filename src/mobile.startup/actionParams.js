const util = require( './util' ),
	defaultParams = {
		action: 'query',
		formatversion: 2
	};

/**
 * Extends the default params for an action query with otherParams
 *
 * @ignore
 * @param {Object} otherParams
 * @return {Object}
 */
module.exports = function actionParams( otherParams ) {
	const scriptPath = mw.config.get( 'wgMFScriptPath' );
	return util.extend( {}, defaultParams, {
		origin: scriptPath ? '*' : undefined
	}, otherParams );
};
