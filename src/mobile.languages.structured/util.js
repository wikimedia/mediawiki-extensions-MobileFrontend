const
	mfUtils = require( '../mobile.startup/util' ),
	rtlLanguages = require( './rtlLanguages' );

/**
 * @typedef {Object} Language
 * @prop {string} autonym of language e.g. français
 * @prop {string} langname in the user's current language e.g French
 * @prop {string} title of the page in the language e.g. Espagne
 * @prop {string} dir (rtl or ltr)
 * @prop {string} url of the page
 *
 * @typedef {Object} SuggestedLanguage
 * @prop {string} autonym of language e.g. français
 * @prop {string} langname in the user's current language e.g French
 * @prop {string} title of the page in the language e.g. Espagne
 * @prop {string} dir (rtl or ltr)
 * @prop {string} url of the page
 * @prop {number} frequency of times the language has been used by the given user
 *
 * @typedef {Object} StructuredLanguages
 * @prop {Language[]} all languages that are available
 * @prop {SuggestedLanguage[]} suggested languages based on users browsing history
 * @ignore
 */

/**
 * Return the device language if it's in the list of article languages.
 * If the language is a variant of a general language, and if the article
 * is not available in that language, then return the general language
 * if article is available in it. For example, if the device language is
 * 'en-gb', and the article is only available in 'en', then return 'en'.
 *
 * @ignore
 * @param {Object[]} languages list of language objects as returned by the API
 * @param {string|undefined} deviceLanguage the device's primary language
 * @return {string|undefined} Return undefined if the article is not available in
 *  the (general or variant) device language
 */
function getDeviceLanguageOrParent( languages, deviceLanguage ) {
	let parentLanguage;

	const
		hasOwn = Object.prototype.hasOwnProperty,
		deviceLanguagesWithVariants = {};

	if ( !deviceLanguage ) {
		return;
	}

	// Are we dealing with a variant?
	const index = deviceLanguage.indexOf( '-' );
	if ( index !== -1 ) {
		parentLanguage = deviceLanguage.slice( 0, index );
	}

	languages.forEach( ( language ) => {
		if ( language.lang === parentLanguage || language.lang === deviceLanguage ) {
			deviceLanguagesWithVariants[ language.lang ] = true;
		}
	} );

	if ( hasOwn.call( deviceLanguagesWithVariants, deviceLanguage ) ) {
		// the device language is one of the available languages
		return deviceLanguage;
	} else if ( hasOwn.call( deviceLanguagesWithVariants, parentLanguage ) ) {
		// no device language, but the parent language is one of the available languages
		return parentLanguage;
	}
}

/**
 * Utility function for the structured language overlay
 *
 * @class util
 * @singleton
 * @private
 */
module.exports = {
	/**
	 * Determine whether a language is LTR or RTL
	 * This works around T74153 and T189036
	 * and the fact that adding dir attribute to HTML in core
	 * at time of writing is memory-intensive
	 * (I7cd8a3117f49467e3ff26f35371459a667c71470)
	 *
	 * @memberof util
	 * @instance
	 * @param {Object} language with 'lang' key.
	 * @return {Object} language with 'lang' key and new 'dir' key.
	 */
	getDir: function ( language ) {
		const dir = rtlLanguages.indexOf( language.lang ) > -1 ? 'rtl' : 'ltr';
		return mfUtils.extend( {}, language, { dir } );
	},

	/**
	 * Return two sets of languages: suggested and all (everything else)
	 *
	 * Suggested languages are the ones that the user has used before. This also
	 * includes the user device's primary language. Suggested languages are ordered
	 * by frequency in descending order. The device's language is always at the top.
	 * This group also includes the variants.
	 *
	 * All languages are the languages that are not suggested.
	 * Languages in this list are ordered in the lexicographical order of
	 * their language names.
	 *
	 * @memberof util
	 * @ignore
	 * @instance
	 * @param {Object[]} languages list of language objects as returned by the API
	 * @param {Array|boolean} variants language variant objects or false if no variants exist
	 * @param {Object} frequentlyUsedLanguages list of the frequently used languages
	 * @param {boolean} showSuggestedLanguages
	 * @param {string} [deviceLanguage] the device's primary language
	 * @return {StructuredLanguages}
	 */
	getStructuredLanguages: function (
		languages,
		variants,
		frequentlyUsedLanguages,
		showSuggestedLanguages,
		deviceLanguage
	) {
		const hasOwn = Object.prototype.hasOwnProperty,
			self = this;

		let maxFrequency = 0,
			minFrequency = 0,
			suggestedLanguages = [],
			allLanguages = [];

		// Is the article available in the user's device language?
		deviceLanguage = getDeviceLanguageOrParent( languages, deviceLanguage );
		if ( deviceLanguage ) {
			Object.keys( frequentlyUsedLanguages ).forEach( ( language ) => {
				const frequency = frequentlyUsedLanguages[ language ];
				maxFrequency = maxFrequency < frequency ? frequency : maxFrequency;
				minFrequency = minFrequency > frequency ? frequency : minFrequency;
			} );

			// Make the device language the most frequently used one so that
			// it appears at the top of the list when sorted by frequency.
			frequentlyUsedLanguages[ deviceLanguage ] = maxFrequency + 1;
		}

		/**
		 * @param {Object} language
		 * @return {Object} which has 'dir' key.
		 */
		const addLangDir = ( language ) => {
			if ( language.dir ) {
				return language;
			} else {
				return self.getDir( language );
			}
		};

		// Separate languages into suggested and all languages.
		if ( showSuggestedLanguages ) {
			languages.map( addLangDir ).forEach( ( language ) => {
				if ( hasOwn.call( frequentlyUsedLanguages, language.lang ) ) {
					language.frequency = frequentlyUsedLanguages[language.lang];
					suggestedLanguages.push( language );
				} else {
					allLanguages.push( language );
				}
			} );
		} else {
			allLanguages = languages.map( addLangDir );
		}

		// Add variants to the suggested languages list and assign the lowest
		// frequency because the variant hasn't been clicked on yet.
		// Note that the variants data doesn't contain the article title, thus
		// we cannot show it for the variants.
		if ( variants && showSuggestedLanguages ) {
			variants.map( addLangDir ).forEach( ( variant ) => {
				if ( hasOwn.call( frequentlyUsedLanguages, variant.lang ) ) {
					variant.frequency = frequentlyUsedLanguages[variant.lang];
				} else {
					variant.frequency = minFrequency - 1;
				}
				suggestedLanguages.push( variant );
			} );
		}

		// sort suggested languages in descending order by frequency
		suggestedLanguages = suggestedLanguages.sort( ( a, b ) => b.frequency - a.frequency );

		/**
		 * Compare language names lexicographically
		 *
		 * @param {Object} a first language
		 * @param {Object} b second language
		 * @return {number} Comparison value, 1 or -1
		 */
		function compareLanguagesByLanguageName( a, b ) {
			return a.autonym.toLocaleLowerCase() < b.autonym.toLocaleLowerCase() ? -1 : 1;
		}

		allLanguages = allLanguages.sort( compareLanguagesByLanguageName );
		return {
			suggested: suggestedLanguages,
			all: allLanguages
		};
	},

	/**
	 * Return a map of frequently used languages on the current device.
	 *
	 * @memberof util
	 * @instance
	 * @return {Object}
	 */
	getFrequentlyUsedLanguages: function () {
		const languageMap = mw.storage.get( 'langMap' );

		return languageMap ? JSON.parse( languageMap ) : {};
	},

	/**
	 * Save the frequently used languages to the user's device
	 *
	 * @memberof util
	 * @instance
	 * @param {Object} languageMap
	 */
	saveFrequentlyUsedLanguages: function ( languageMap ) {
		mw.storage.set( 'langMap', JSON.stringify( languageMap ) );
	},

	/**
	 * Increment the current language usage by one and save it to the device.
	 * Cap the result at 100.
	 *
	 * @memberof util
	 * @instance
	 * @param {string} languageCode
	 * @param {Object} frequentlyUsedLanguages list of the frequently used languages
	 */
	saveLanguageUsageCount: function ( languageCode, frequentlyUsedLanguages ) {
		let count = frequentlyUsedLanguages[ languageCode ] || 0;

		count += 1;
		// cap at 100 as this is enough data to work on
		frequentlyUsedLanguages[ languageCode ] = count > 100 ? 100 : count;
		this.saveFrequentlyUsedLanguages( frequentlyUsedLanguages );
	}
};
