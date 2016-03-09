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
	 *
	 * All languages are the languages that are not preferred. Languages in this
	 * list may have a 'variants' property which includes all variants for the
	 * given languages. If a variant is in the preferred list, then it's omitted
	 * from the all list. All languages are ordered in the lexicographical order of
	 * their language codes.
	 *
	 * @param {Object[]} languages list of language objects as returned by the API
	 * @param {Object} frequentlyUsedLanguages list of the frequently used languages
	 * @param {String|undefined} deviceLanguage the device's primary language
	 * @return {Object[]}
	 */
	util.getStructuredLanguages = function ( languages, frequentlyUsedLanguages, deviceLanguage ) {
		var index, lang, variant, allLanguages, maxFrequency = 0,
			parentsMap = {},
			variantsMap = {},
			preferredLanguages = [],
			preferredLanguagesMap = {};

		$.each( frequentlyUsedLanguages, function ( language, frequency ) {
			maxFrequency = maxFrequency < frequency ? frequency : maxFrequency;
		} );

		// Is the article available in the user's device language?
		deviceLanguage = getDeviceLanguageOrParent( languages, deviceLanguage );

		if ( deviceLanguage ) {
			// Make the device language the most frequently used one so that
			// it appears at the top of the list when sorted by frequency.
			frequentlyUsedLanguages[ deviceLanguage ] = maxFrequency + 1;
		}

		// Separate languages into preferred, parent, and variants. Parent
		// languages are all top level non-preferred languages. Variants are
		// variants of parent languages if any.
		$.each( languages, function ( i, language ) {
			if ( frequentlyUsedLanguages.hasOwnProperty( language.lang ) ) {
				language.frequency = frequentlyUsedLanguages[ language.lang ];
				preferredLanguages.push( language );
				preferredLanguagesMap[ language.lang ] = language;
			} else {
				// assuming variants are separated by a '-', i.e. zh, zh-min-nan, zh-yue
				index = language.lang.indexOf( '-' );
				if ( index === -1 ) {
					parentsMap[ language.lang ] = language;
				} else {
					lang = language.lang.slice( 0, index );
					variant = language.lang.slice( index + 1 );
					language.variant = variant;
					if ( variantsMap.hasOwnProperty( lang ) ) {
						variantsMap[ lang ].push( language );
					} else {
						variantsMap[ lang ] = [ language ];
					}
				}
			}
		} );

		// Attach variants to their parents
		$.each( variantsMap, function ( lang, variants ) {
			// parent may be in the preferred languages list
			if ( parentsMap.hasOwnProperty( lang ) ) {
				parentsMap[ lang ].variantsHeader = parentsMap[ lang ].langname;
				parentsMap[ lang ].variants = variants;
				parentsMap[ lang ].hasVariants = true;
			} else {
				// group variants under a fake non-existing parent
				if ( variants.length > 1 ) {
					parentsMap[ lang ] = {
						lang: lang,  // this key is needed for lexicographical comparison
						variantsHeader: preferredLanguagesMap[ lang ] ? preferredLanguagesMap[ lang ].langname : '',
						variants: variants,
						hasVariants: true
					};
				} else {
					// make the variant a parent
					parentsMap[ lang ] = variants[0];
				}
			}
		} );

		// sort preferred languages in descending order by frequency
		preferredLanguages = preferredLanguages.sort( function ( a, b ) {
			return b.frequency - a.frequency;
		} );

		/**
		 * Compare language codes lexicographically
		 *
		 * @ignore
		 * @param {Object} a first language
		 * @param {Object} b second language
		 */
		function compareLanguagesByLanguageCode( a, b ) {
			return a.lang.localeCompare( b.lang );
		}

		allLanguages = $.map( parentsMap, function ( language ) {
			// let's sort variants while we're at it
			if ( language.variants ) {
				language.variants = language.variants.sort( compareLanguagesByLanguageCode );
			}
			return language;
		} );
		allLanguages = allLanguages.sort( compareLanguagesByLanguageCode );

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
