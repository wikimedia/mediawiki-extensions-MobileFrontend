( function ( M, $ ) {

	var WikiDataApi,
		ForeignApi = M.require( 'modules/ForeignApi' ),
		config = mw.config.get( 'wgWikiBasePropertyConfig' ),
		endpoint = mw.config.get( 'wgMFWikiDataEndpoint' );

	/**
	 * Gets claims and labels from the WikiData API
	 * @class WikiDataApi
	 * @extends ForeignApi
	 */
	WikiDataApi = ForeignApi.extend( {
		propertyIdInstanceOf: config.instanceOf,
		apiUrl: endpoint,
		language: mw.config.get( 'wgUserLanguage' ),
		/** @inheritdoc */
		initialize: function ( options ) {
			this.subjectId = options.itemId;
			ForeignApi.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Get sitelinks for the item from api filtered to the current language.
		 * @method
		 * @return {jQuery.Deferred}
		 */
		getSiteLinks: function () {
			var id = this.subjectId,
				lang = this.language;

			return this.ajax( {
				ids: id,
				action: 'wbgetentities',
				props: 'sitelinks/urls',
				languages: lang
			} ).then( function ( data ) {
				var myLanguageProjects = [];
				// filter sitelinks to only show ones from my project
				$.each( data.entities[id].sitelinks, function () {
					var site = this;
					// FIXME: hacky. Assumes all projects begin with 'w' or followed by _
					if ( site.site.indexOf( lang + 'w' ) === 0 || site.site.indexOf( lang + '_' ) === 0 ) {
						myLanguageProjects.push( site );
					}
				} );
				return myLanguageProjects;
			} );
		},
		/**
		 * Get claims via the API
		 * @method
		 * @return {jQuery.Deferred}
		 */
		getClaims: function () {
			var self = this,
				instanceOfId = this.propertyIdInstanceOf,
				id = this.subjectId;

			return this.ajax( {
				action: 'wbgetentities',
				ids: id,
				languages: this.language,
				props: [ 'descriptions', 'claims' ],
				format: 'json'
			} ).then( function ( data ) {
				var description, instanceClaims, entityClaims,
					claims = {};
				if (
					data.entities !== undefined &&
					data.entities[id].claims !== undefined
				) {
					entityClaims = data.entities[id].claims;

					// See if the page has any 'instance of' claims.
					if ( data.entities[id].claims[instanceOfId] !== undefined ) {
						instanceClaims = entityClaims[instanceOfId];

						// Examine claims closely
						claims.instanceTypes = $.map( instanceClaims, function ( claim ) {
							return claim.mainsnak.datavalue.value[ 'numeric-id' ];
						} );
						if ( claims.instanceTypes.length > 0 ) {
							claims.instanceOf = claims.instanceTypes[ 0 ];
						}
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
		 * @param {String} value of new description
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		saveDescription: function ( value ) {
			var self = this,
				d = $.Deferred();

			this.getInfo().done( function ( info ) {
				self.postWithToken( 'csrf', {
						action: 'wbsetdescription',
						id: self.subjectId,
						value: value,
						language: self.language,
						baserevid: info.lastrevid,
						bot: 1
				} ).done( function ( resp ) {
					d.resolve( resp );
				} ).fail( $.proxy( d, 'reject' ) );
			} );
			return d;
		},

		/**
		 * Save a claim to the current item associated with the api.
		 * @param {String} property id of the property claim you want to update
		 * @param {String} value of claim you want to save including the Q prefix e.g. Q1
		 * @returns {jQuery.Deferred}
		 */
		saveClaim: function ( property, value ) {
			var self = this,
				d = $.Deferred();

			self.postWithToken( 'csrf', {
					action: 'wbcreateclaim',
					entity: self.subjectId,
					snaktype: 'value',
					property: property,
					value: JSON.stringify( {
						'entity-type': 'item',
						// FIXME: yuk.
						'numeric-id': value.replace( 'Q', '' )
					} ),
					summary: 'MobileFrontend Infobox alpha edit'
			} ).done( function ( resp ) {
				d.resolve( resp );
			} ).fail( $.proxy( d, 'reject' ) );
			return d;
		},

		/**
		 * Search for a wikidata item that matches the current term
		 * @param {String} term
		 * @returns {jQuery.Deferred}
		 */
		searchForItem: function ( term ) {
			return this.get( {
				action: 'wbsearchentities',
				search: term,
				language: this.language,
				type: 'item'
			} ).then( function ( data ) {
				return data.search;
			} );
		},

		/**
		 * Get information about current wikidata entity.
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
				props: [ 'labels', 'sitelinks/urls', 'datatype' ],
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
							id: itemId,
							type: item.datatype,
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

	M.define( 'modules/WikiDataApi', WikiDataApi );

}( mw.mobileFrontend, jQuery ) );
