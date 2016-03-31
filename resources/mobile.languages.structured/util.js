( function ( M, $ ) {
	/**
	 * Utility function for the structured language overlay
	 *
	 * @class util
	 * @singleton
	 */
	var util = {};

	/**
	 * Return the device language if it's in the list of article languages.
	 * If the language is a variant of a general language, and if the article
	 * is not available in that language, then return the general language
	 * if article is available in it. For example, if the device language is
	 * 'en-gb', and the article is only available in 'en', then return 'en'.
	 *
	 * @ignore
	 * @param {Object[]} languages list of language objects as returned by the API
	 * @param {String|undefined} deviceLanguage the device's primary language
	 * @returns {String|undefined} Return undefined if the article is not available in
	 *  the (general or variant) device language
	 */
	function getDeviceLanguageOrParent( languages, deviceLanguage ) {
		var parentLanguage, index,
			deviceLanguagesWithVariants = {};

		if ( !deviceLanguage ) {
			return;
		}

		// Are we dealing with a variant?
		index = deviceLanguage.indexOf( '-' );
		if ( index !== -1 ) {
			parentLanguage = deviceLanguage.slice( 0, index );
		}

		$.each( languages, function ( i, language ) {
			if ( language.lang === parentLanguage || language.lang === deviceLanguage ) {
				deviceLanguagesWithVariants[ language.lang ] = true;
			}
		} );

		if ( deviceLanguagesWithVariants.hasOwnProperty( deviceLanguage ) ) {
			// the device language is one of the available languages
			return deviceLanguage;
		} else if ( deviceLanguagesWithVariants.hasOwnProperty( parentLanguage ) ) {
			// no device language, but the parent language is one of the available languages
			return parentLanguage;
		}
	}

	/**
	 * Return two sets of languages: preferred and all (everything else)
	 *
	 * Preferred languages are the ones that the user has used before. This also
	 * includes the user device's primary language. Preferred languages are ordered
	 * by frequency in descending order. The device's language is always at the top.
	 * This group also includes the variants.
	 *
	 * All languages are the languages that are not preferred.
	 * Languages in this list are ordered in the lexicographical order of
	 * their language names.
	 *
	 * @param {Object[]} languages list of language objects as returned by the API
	 * @param {Array|Boolean} variants language variant objects or false if no variants exist
	 * @param {Object} frequentlyUsedLanguages list of the frequently used languages
	 * @param {String|undefined} deviceLanguage the device's primary language
	 * @return {Object[]}
	 */
	util.getStructuredLanguages = function ( languages, variants, frequentlyUsedLanguages, deviceLanguage ) {
		var maxFrequency = 0,
			minFrequency = 0,
			preferredLanguages = [],
			allLanguages = [];

		// Is the article available in the user's device language?
		deviceLanguage = getDeviceLanguageOrParent( languages, deviceLanguage );
		if ( deviceLanguage ) {
			$.each( frequentlyUsedLanguages, function ( language, frequency ) {
				maxFrequency = maxFrequency < frequency ? frequency : maxFrequency;
				minFrequency = minFrequency > frequency ? frequency : minFrequency;
			} );

			// Make the device language the most frequently used one so that
			// it appears at the top of the list when sorted by frequency.
			frequentlyUsedLanguages[ deviceLanguage ] = maxFrequency + 1;
		}

		// Separate languages into preferred and all languages.
		$.each( languages, function ( i, language ) {
			if ( frequentlyUsedLanguages.hasOwnProperty( language.lang ) ) {
				language.frequency = frequentlyUsedLanguages[ language.lang ];
				preferredLanguages.push( language );
			} else {
				allLanguages.push( language );
			}
		} );

		// Add variants to the preferred languages list and assign the lowest
		// frequency because the variant hasn't been clicked on yet.
		// Note that the variants data doesn't contain the article title, thus
		// we cannot show it for the variants.
		if ( variants ) {
			$.each( variants, function ( i, variant ) {
				if ( frequentlyUsedLanguages.hasOwnProperty( variant.lang ) ) {
					variant.frequency =  frequentlyUsedLanguages[variant.lang];
				} else {
					variant.frequency = minFrequency - 1;
				}
				preferredLanguages.push( variant );
			} );
		}

		// sort preferred languages in descending order by frequency
		preferredLanguages = preferredLanguages.sort( function ( a, b ) {
			return b.frequency - a.frequency;
		} );

		/**
		 * Compare language names lexicographically
		 *
		 * @ignore
		 * @param {Object} a first language
		 * @param {Object} b second language
		 */
		function compareLanguagesByLanguageName( a, b ) {
			return a.autonym < b.autonym ? -1 : 1;
		}

		allLanguages = allLanguages.sort( compareLanguagesByLanguageName );

		return {
			preferred: preferredLanguages,
			all: allLanguages
		};
	};

	/**
	 * Return a map of frequently used languages on the current device.
	 *
	 * @returns {Object}
	 */
	util.getFrequentlyUsedLanguages = function () {
		var languageMap = mw.storage.get( 'langMap' );

		return languageMap ? $.parseJSON( languageMap ) : {};
	};

	/**
	 * Save the frequently used languages to the user's device
	 *
	 * @param {Object} languageMap
	 */
	util.saveFrequentlyUsedLanguages = function ( languageMap ) {
		mw.storage.set( 'langMap', JSON.stringify( languageMap ) );
	};

	/**
	 * Increment the current language usage by one and save it to the device.
	 * Cap the result at 100.
	 *
	 * @param {String} languageCode
	 * @param {Object} frequentlyUsedLanguages list of the frequently used languages
	 */
	util.saveLanguageUsageCount = function ( languageCode, frequentlyUsedLanguages ) {
		var count = frequentlyUsedLanguages[ languageCode ] || 0;

		count += 1;
		// cap at 100 as this is enough data to work on
		frequentlyUsedLanguages[ languageCode ] = count > 100 ? 100 : count;
		util.saveFrequentlyUsedLanguages( frequentlyUsedLanguages );
	};

	M.define( 'mobile.languages.structured/util', util );

}( mw.mobileFrontend, jQuery ) );
