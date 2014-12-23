( function ( M, $ ) {
	var api = M.require( 'api' ),
		Api = api.Api,
		WikiDataApi;
	/**
	 * Gets claims and labels from the WikiData API
	 * @class WikiDataApi
	 * @extends Api
	 */
	WikiDataApi = Api.extend( {
		apiUrl: mw.config.get( 'wgMFWikiDataEndpoint' ),
		useJsonp: true,
		language: mw.config.get( 'wgUserLanguage' ),
		/**
		 * Get a central auth token from the current host for use on the foreign api.
		 * @return {jQuery.Deferred}
		 */
		getCentralAuthToken: function () {
			var data = {
				action: 'centralauthtoken'
			};
			return api.get( data ).then( function ( resp ) {
				return resp.centralauthtoken.centralauthtoken;
			} );
		},
		/**
		 * Get a token from a foreign API
		 * @param {String} type of token you want to retrieve
		 * @param {String} centralAuthToken to help get it
		 * @return {jQuery.Deferred}
		 */
		getToken: function ( type, centralAuthToken ) {
			var data = {
				action: 'query',
				meta: 'tokens',
				origin: this.getOrigin(),
				centralauthtoken: centralAuthToken,
				type: type
			};
			return this.get( data ).then( function ( resp ) {
				return resp.query.tokens[type + 'token'];
			} );
		},
		/**
		 * Post with support for central auth tokens
		 */
		post: function ( data ) {
			var self = this,
				d = $.Deferred();

			// first let's sort out the token
			self.getCentralAuthToken().done( function ( centralAuthTokenOne ) {
				self.getToken( 'csrf', centralAuthTokenOne ).done( function ( editToken ) {
					self.getCentralAuthToken().done( function ( centralAuthTokenTwo ) {
						data.format = 'json';
						data.centralauthtoken = centralAuthTokenTwo;
						data.token = editToken;
						data.origin = self.getOrigin();
						$.post( self.apiUrl, data ).done( function ( resp ) {
							d.resolve( resp );
						} );
					} );
				} );
			} );
			return d;
		},
		/** @inheritdoc */
		initialize: function ( options ) {
			this.subjectId = options.itemId;
			Api.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Get claims via the API
		 * @method
		 * @return {jQuery.Deferred}
		 */
		getClaims: function () {
			var self = this,
				id = this.subjectId;

			return this.ajax( {
				action: 'wbgetentities',
				ids: id,
				languages: this.language,
				props: [ 'descriptions', 'claims' ],
				format: 'json'
			} ).then( function ( data ) {
				var description, instanceClaims, entityClaims, instanceOf,
					claims = {};
				if (
					data.entities !== undefined &&
					data.entities[id].claims !== undefined
				) {
					entityClaims = data.entities[id].claims;

					// See if the page has any 'instance of' claims.
					if ( data.entities[id].claims.P31 !== undefined ) {
						instanceClaims = entityClaims.P31;

						// Examine claims closely
						$.each( instanceClaims, function ( i, claim ) {
							instanceOf = claim.mainsnak.datavalue.value['numeric-id'];
							if ( instanceOf === 5 ) {
								claims.isHuman = true;
							} else if ( instanceOf === 515 ) {
								claims.isCity = true;
							} else if ( instanceOf === 6256 ) {
								claims.isCountry = true;
							} else if ( instanceOf === 16521 ) {
								claims.isTaxon = true;
							} else if ( instanceOf === 11424 ) {
								claims.isMovie = true;
							} else if ( instanceOf === 5398426 ) {
								claims.isTVSeries = true;
							}
							// Note: bands are subclassed as rock band, punk band etc.. not sure how we want
							// to include them here.
						} );
					}
					claims.entities = entityClaims;
				}
				description = data.entities[ id ];

				if ( description && description.descriptions !== undefined ) {
					if ( description.descriptions[ self.language ] ) {
						claims.description = description.descriptions[ self.language ].value;
					}
				}
				return claims;
			} ).fail( function () {
				// FIXME: logError does not exist
				// self.logError( 'no-impression-cannot-fetch-claims' );
			} );
		},
		/**
		 * Get labels for an item from Wikidata
		 * See: https://www.wikidata.org/wiki/Help:Label
		 * @method
		 * @param {Array} itemIds for items in Wikidata
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		getLabels: function ( itemIds ) {
			var lang = this.language;
			return this.ajax( {
				action: 'wbgetentities',
				props: 'labels',
				languages: lang,
				ids: itemIds
			} ).then( function ( data ) {
				var map = {};
				$.each( itemIds, function ( i, itemId ) {
					if ( data.entities[ itemId ].labels &&
						data.entities[ itemId ].labels[ lang ] !== undefined
					) {
						map[ itemId ] = data.entities[ itemId ].labels[ lang ].value;
					} else {
						map[ itemId ] = null;
					}
				} );
				return map;
			} );
		},

		/**
		 * Store description.
		 *
		 * @param {string} value of new description
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		saveDescription: function ( value ) {
			var self = this,
				d = $.Deferred();

			this.getInfo().done( function ( info ) {
				self.post( {
						action: 'wbsetdescription',
						id: self.subjectId,
						value: value,
						summary: 'MobileFrontend Infobox alpha edit',
						language: self.language,
						baserevid: info.lastrevid,
						bot: 1
				} ).done( function ( resp ) {
					d.resolve( resp );
				} );
			} );
			return d;
		},
		/**
		 * Get information about current wikidata entity
		 *
		 * FIXME: add error handling.
		 */
		getInfo: function () {
			var id = this.subjectId;
			return this.get( {
				action: 'wbgetentities',
				ids: id,
				props: 'info'
			} ).then( function ( resp ) {
				return resp.entities[id];
			} );
		},
		/**
		 * Expand item ids to find associated data such as labels and urls
		 * for the wikidata entities for the current sitename.
		 * @method
		 * @param {Array} itemIds for items in Wikidata
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		getExpandedItemsData: function ( itemIds ) {
			var lang = this.language,
				wiki = mw.config.get( 'wgDBname' ) || 'enwiki';

			return this.ajax( {
				action: 'wbgetentities',
				sites: wiki,
				props: [ 'labels', 'sitelinks/urls' ],
				languages: lang,
				ids: itemIds
			} ).then( function ( data ) {
				var map = {};

				$.each( itemIds, function ( i, itemId ) {
					var item, sitelink;

					if ( data.entities[ itemId ].labels &&
						data.entities[ itemId ].labels[ lang ] !== undefined
					) {
						item = data.entities[ itemId ];
						if ( item.sitelinks && item.sitelinks[wiki] ) {
							sitelink = item.sitelinks[wiki];
						}

						map[ itemId ] = {
							label: sitelink ? sitelink.title : item.labels[ lang ].value
						};

						if ( sitelink && sitelink.url ) {
							map[ itemId ].url = sitelink.url;
						}
					} else {
						map[ itemId ] = null;
					}
				} );
				return map;
			} );
		}
	} );

	M.define( 'modules/wikigrok/WikiDataApi', WikiDataApi );

}( mw.mobileFrontend, jQuery ) );
