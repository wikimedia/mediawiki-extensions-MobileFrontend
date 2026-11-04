/* globals $ */
/**
 * @ignore
 * @throws {Error} if mediawiki message is in unexpected format.
 * @return {jQuery.Object} a list of links
 */
const getLinks = () => {
	const mobileLicense = mw.message( 'mobile-frontend-license-links' );
	const mobileMsgExists = mobileLicense.exists() && mobileLicense.text();
	const userLanguage = mw.config.get( 'wgUserLanguage' );
	if ( userLanguage === 'qqx' ) {
		// Special handling for qqx code so we can easily debug what's going on here.
		return mobileLicense.parseDom();
	} else {
		return mobileMsgExists ? mobileLicense.parseDom() : $( 'body #footer-info-copyright a' ).clone();
	}
};

/**
 * Returns the appropriate license message including links/name to
 * terms of use (if any) and license page
 *
 * @ignore
 * @return {string|undefined}
 */
const getLicenseMessage = () => {
	const $licenseLinks = getLinks();

	let licenseMsg;
	if ( $licenseLinks.length ) {
		const licensePlural = mw.language.convertNumber(
			$licenseLinks.filter( 'a' ).length
		);

		if ( $( 'body #footer-places-terms-use' ).length > 0 ) {

			const $termsLink = mw.message(
				'mobile-frontend-editor-terms-link',
				$( 'body #footer-places-terms-use a' ).attr( 'href' )
			).parseDom();
			licenseMsg = mw.message(
				'mobile-frontend-editor-licensing-with-terms',
				$termsLink,
				$licenseLinks,
				licensePlural
			).parse();
		} else {
			licenseMsg = mw.message(
				'mobile-frontend-editor-licensing',
				$licenseLinks,
				licensePlural
			).parse();
		}
	}

	return licenseMsg;
};

module.exports = getLicenseMessage;
