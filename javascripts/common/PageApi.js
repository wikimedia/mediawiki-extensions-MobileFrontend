( function( M, $ ) {
	var Api = M.require( 'api' ).Api, PageApi;

	function assignToParent( listOfSections, child ) {
		var section;
		if ( listOfSections.length === 0 ) {
			listOfSections.push( child );
		} else {
			// take a look at the last child
			section = listOfSections[listOfSections.length - 1];
			// If the level is the same as another section in this list it is a sibling
			if ( parseInt( section.level, 10 ) === parseInt( child.level, 10 ) ) {
				listOfSections.push( child );
			} else {
				// Otherwise take a look at that sections children recursively
				assignToParent( section.children, child );
			}
		}
	}

	function transformSections( sections ) {
		var
			collapseLevel = Math.min.apply( this, $.map( sections, function( s ) { return s.level; } ) ) + '',
			lastSection,
			result = [], $tmpContainer = $( '<div>' );

		$.each( sections, function( i, section ) {
			// Store text version so users of API do not have to worry about styling e.g. Table of Contents
			// FIXME: [API] should probably do this for us - we want to be able to control the styling of these headings - no inline styles!
			section.lineText = $( '<div>' ).html( section.line ).text();
			section.children = [];
			if ( !section.level || section.level === collapseLevel ) {
				result.push( section );
				lastSection = section;
			} else {
				// FIXME: ugly, maintain structure returned by API and use templates instead
				$tmpContainer.html( section.text );
				$tmpContainer.prepend(
					$( '<h' + section.level + '>' ).attr( 'id', section.anchor ).html( section.line )
				);
				assignToParent( lastSection.children, section );
				lastSection.text += $tmpContainer.html();
			}
		} );

		return result;
	}

	/**
	 * @class
	 * @name PageApi
	 * @extends Api
	 */
	PageApi = Api.extend( {
		initialize: function() {
			this._super();
			this.cache = {};
		},

		/**
		 * Retrieve a page from the api
		 *
		 * @name PageApi.prototype.getPage
		 * @function
		 * @param {string} title the title of the page to be retrieved
		 * @param {string} endpoint an alternative api url to retreive the page from
		 * @param {boolean} leadOnly When set only the lead section content is returned
		 * @return {jQuery.Deferred} with parameter page data that can be passed to a Page view
		 */
		getPage: function( title, endpoint, leadOnly ) {
			var options = endpoint ? { url: endpoint, dataType: 'jsonp' } : {}, page, timestamp;

			if ( !this.cache[title] ) {
				page = this.cache[title] = $.Deferred();
				this.get( {
					action: 'mobileview',
					page: title,
					variant: mw.config.get( 'wgPreferredVariant' ),
					redirect: 'yes',
					prop: 'id|sections|text|lastmodified|lastmodifiedby|languagecount|hasvariants|protection|displaytitle|revision',
					noheadings: 'yes',
					noimages: mw.config.get( 'wgImagesDisabled', false ) ? 1 : undefined,
					sectionprop: 'level|line|anchor',
					sections: leadOnly ? 0 : 'all'
				}, options ).done( function( resp ) {
					var sections, lastModified, resolveObj, mv;

					if ( resp.error || !resp.mobileview.sections ) {
						page.reject( resp );
					// FIXME: [LQT] remove when liquid threads is dead (see Bug 51586)
					} else if ( resp.mobileview.hasOwnProperty( 'liquidthreads' ) ) {
						page.reject( { error: { code: 'lqt' } } );
					} else {
						mv = resp.mobileview;
						sections = transformSections( mv.sections );
						// Assume the timestamp is in the form TS_ISO_8601 and we don't care about old browsers
						// change to seconds to be consistent with PHP
						timestamp = new Date( mv.lastmodified ).getTime() / 1000;
						lastModified = mv.lastmodifiedby;
						resolveObj = {
							title: title,
							id: mv.id,
							revId: mv.revId,
							// FIXME: [API] the API sometimes returns an object and sometimes an array
							// (Array seems to be a shorthand for apply this to everything)
							protection: $.isArray( mv.protection ) ? { edit:[ '*' ] } : mv.protection,
							lead: sections[0].text,
							sections: sections.slice( 1 ),
							isMainPage: mv.hasOwnProperty( 'mainpage' ) ? true : false,
							historyUrl: mw.util.getUrl( title, { action: 'history' } ),
							lastModifiedTimestamp: timestamp,
							languageCount: mv.languagecount,
							hasVariants: mv.hasOwnProperty( 'hasvariants' ),
							displayTitle: mv.displaytitle
						};
						// Add non-anonymous user information
						if ( lastModified ) {
							$.extend( resolveObj, {
								lastModifiedUserName: lastModified.name,
								lastModifiedUserGender: lastModified.gender
							} );
						}
						page.resolve( resolveObj );
					}
				} ).fail( $.proxy( page, 'reject' ) );
			}

			return this.cache[title];
		},

		/**
		 * Invalidate the internal cache for a given page
		 *
		 * @name PageApi.prototype.invalidatePage
		 * @function
		 * @param {string} title the title of the page who's cache you want to invalidate
		 */
		invalidatePage: function( title ) {
			delete this.cache[title];
		},

		/**
		 * Gets language list for a page; helper function for getPageLanguages()
		 *
		 * @name PageApi.prototype._getLanguagesFromApiResponse
		 * @function
		 * @param  {object} data Data from API
		 * @return {array} List of language objects
		 */
		_getLanguagesFromApiResponse: function( data ) {
			// allAvailableLanguages is a mapping of all codes to language names
			var pages, langlinks, allAvailableLanguages = {};
			data.query.languages.forEach( function( item ) {
				allAvailableLanguages[ item.code ] = item[ '*' ];
			} );

			// FIXME: API returns an object when a list makes much more sense
			pages = $.map( data.query.pages, function( v ) { return v; } );
			// FIXME: "|| []" wouldn't be needed if API was more consistent
			langlinks = pages[0] ? pages[0].langlinks || [] : [];

			langlinks.forEach( function( item, i ) {
				langlinks[ i ].langname = allAvailableLanguages[ item.lang ];
			} );

			return langlinks;
		},

		/**
		 * Gets language variant list for a page; helper function for getPageLanguages()
		 *
		 * @name PageApi.prototype._getLanguageVariantsFromApiResponse
		 * @function
		 * @param  {string} title Name of the page to obtain variants for
		 * @param  {object} data Data from API
		 * @return {array} List of language variant objects
		 */
		_getLanguageVariantsFromApiResponse: function( title, data ) {
			var generalData = data.query.general,
				variantPath = generalData.variantarticlepath,
				variants = [];

			if ( !generalData.variants ) {
				return false;
			}

			// Create the data object for each variant and store it
			generalData.variants.forEach( function( item ) {
				var variant = {
					langname: item.name,
					lang: item.code
				};
				if ( variantPath ) {
					variant.url = variantPath
						.replace( '$1', title )
						.replace( '$2', item.code );
				} else {
					variant.url = mw.util.getUrl( title, { 'variant' : item.code } );
				}
				variants.push( variant );
			} );

			return variants;
		},

		/**
		 * Retrieve available languages for a given title
		 *
		 * @name PageApi.prototype.getPageLanguages
		 * @function
		 * @param {string} title the title of the page languages should be retrieved for
		 * @return {jQuery.Deferred} which is called with an object containing langlinks and variant links
		 */
		getPageLanguages: function( title ) {
			var self = this, result = $.Deferred();

			self.get( {
					action: 'query',
					meta: 'siteinfo',
					siprop: 'general|languages',
					prop: 'langlinks',
					llurl: true,
					lllimit: 'max',
					titles: title
				} ).done( function( resp ) {
					result.resolve( {
						languages: self._getLanguagesFromApiResponse( resp ),
						variants: self._getLanguageVariantsFromApiResponse( title, resp )
					} );
				} ).fail( $.proxy( result, 'reject' ) );

			return result;
		},

		// FIXME: Where's a better place for these two functions to live?
		_getAPIResponseFromHTML: function( $el ) {
			var $headings = $el.find( 'h1,h2,h3,h4,h5,h6' ),
				sections = [];

			$headings.each( function() {
				var level = $( this )[0].tagName.substr( 1 ),
					$span = $( this ).find( 'span' );

				sections.push( { level: level, line: $span.html(), anchor: $span.attr( 'id' ) || '', text: '' } );
			} );
			return sections;
		},

		getSectionsFromHTML: function( $el ) {
			return transformSections( this._getAPIResponseFromHTML( $el ) );
		}
	} );

	M.define( 'PageApi', PageApi );
}( mw.mobileFrontend, jQuery ) );
