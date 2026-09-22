/**
 * The return-to-app banner waits a tick after being added to the DOM, then adds
 * its content. This waits for that to occur.
 *
 * @return {Promise} promise that resolves once content appears
 */
async function waitForBannerContent() {
	return new Promise( ( resolve ) => {
		setTimeout( resolve, 0 );
	} );
}

module.exports = { waitForBannerContent };
