const util = require( './util' ),
	defaultParams = {
		action: 'query',
		formatversion: 2
	};

/**
 * Extends the default params for an action query with otherParams
 *
 * @param {Object} otherParams
 * @return {Object}
 */
function actionParams( otherParams ) {
	const scriptPath = mw.config.get( 'wgMFScriptPath' );
	return util.extend( {}, defaultParams, {
		origin: scriptPath ? '*' : undefined
	}, otherParams );
}

module.exports = actionParams;
