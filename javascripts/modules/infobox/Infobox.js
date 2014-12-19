( function ( M, $ ) {
	var Infobox,
		md5fn = M.require( 'hex_md5' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		View = M.require( 'View' ),
		user = M.require( 'user' ),
		icons = M.require( 'icons' );

	/**
	 * A Wikidata generated infobox.
	 * Emits photo-loaded event when images in the infobox have loaded.
	 * FIXME: This currently requires 2 hits to the Wikidata API on every page load.
	 * @class Infobox
	 * @extends View
	 */
	Infobox = View.extend( {
		template: mw.template.get( 'mobile.infobox', 'Infobox.hogan' ),

		className: 'wikidata-infobox pre-content',
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.spinner HTML of the spinner icon.
		 * @cfg {String} defaults.description WikiData description.
		 * Defaults to 'A Wikipedia page in need of a description.'
		 * @cfg {Array} defaults.rows Description of rows to show in Wikidata infobox
		 * e.g. [
		 * {
		 *   id: "P18",
		 *   isEmpty: false,
		 *   values: [
		 *     {
		 *       src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/" +
		 *            "Anne_Dallas_Dudley_LOC.jpg/160px-Anne_Dallas_Dudley_LOC.jpg",
		 *       url: "/wiki/File:Anne_Dallas_Dudley_LOC.jpg"
		 *     }
		 *   ]
		 * },
		 * {
		 *   id: "P569",
		 *   isEmpty: false,
		 *   label: "Born"
		 * }
		 * ]
		 */
		defaults: {
			spinner: icons.spinner().toHtmlString(),
			description: mw.config.get( 'wgMFDescription' ) ||
				'A Wikipedia page in need of a description.',
			rows: []
		},
		typeDefaults: {
			// FIXME: In future this should be configurable by Wikipedia admins
			movie: {
				rows: [
					{
						// Director
						id: 'P57'
					},
					{
						// Produced by
						id: 'P162'
					},
					{
						// Story by
						id: 'P58'
					},
					{
						// Based on
						id: 'P144'
					},
					{
						// Starring
						id: 'P161'
					},
					{
						// Music by
						id: 'P86'
					},
					{
						// Cinematography
						id: 'P344'
					},
					{
						// Film editor
						id: 'P1040'
					},
					{
						// Production company
						id: 'P272'
					},
					{
						// Distributor
						id: 'P750'
					},
					{
						// Released'
						id: 'P577'
					},
					// FIXME: running time is not available on Wikidata
					{
						//Country of origin
						id: 'P495'
					},
					{
						//Original language
						id: 'P364'
					}
					// FIXME: budget is not available on Wikidata
					// FIXME: box office is not available on Wikidata
				]
			},
			taxon: {
				rows: [
					{
						// Conservation status
						id: 'P141'
					},
					{
						// Genus
						id: 'P171'
					},
					{
						// Species
						id: 'P225'
					},
					{
						// Geographic distribution
						id: 'P181'
					}
				]
			},
			country: {
				rows: [
					{
						// Flag
						id: 'P41'
					},
					{
						// Coat of arms
						id: 'P94'
					},
					// FIXME: add motto
					{
						// Anthem
						id: 'P85'
					},
					{
						// Location
						id: 'P242'
					},
					{
						// Languages
						id: 'P37'
					},
					{
						// Capital
						id: 'P36'
					},
					// FIXME: Add ethnic groups
					{
						// Basic form of government
						id: 'P122'
					},
					{
						// Legislature
						id: 'P194'
					},
					// FIXME: Add Area
					{
						// Population
						id: 'P1082'
					},
					// GDP
					{
						// Currency
						id: 'P38'
					},
					{
						// Timezone
						id: 'P421'
					},
					// FIXME: add Date format
					// FIXME: add Drives on the (left/right)
					{
						// Country calling code
						id: 'P474'
					},
					{
						// ISO 3166 code
						id: 'P297'
					},
					{
						// Internet TLD
						id: 'P78'
					}
				]
			},
			city: {
				rows: [
					{
						// Flag
						id: 'P41'
					},
					{
						// Coat of arms
						id: 'P94'
					},
					{
						// Coordinates
						id: 'P625'
					},
					{
						// State
						id: 'P131'
					},
					{
						// Country
						id: 'P17'
					},
					{
						// Founded
						id: 'P571'
					},
					{
						// Population
						id: 'P1082'
					},
					{
						// Timezone
						id: 'P421'
					},
					{
						// Born
						id: 'P569'
					}
				]
			},
			human: {
				rows: [
					{
						// Born
						id: 'P569'
					},
					{
						// Birthplace
						id: 'P19'
					},
					{
						// Died
						id: 'P570'
					},
					{
						// Place of death
						id: 'P20'
					},
					{
						// Country of citizenship
						id: 'P27'
					},
					// FIXME: Add political party
					{
						// Spouse(s)
						id: 'P26'
					}, {
						// Mother(s)
						id: 'P25'
					}, {
						// Father(s)
						id: 'P22'
					},
					//FIXME: Add Stepfather(s) (P43) and step mothers?
					{
						// Sister(s)
						id: 'P9'
					},
					{
						// Brother(s)
						id: 'P7'
					},
					{
						// Child(ren)
						id: 'P40'
					},
					// FIXME: add residence?
					{
						// Alma mater
						id: 'P69'
					},
					{
						// Occupation
						id: 'P106'
					},
					{
						// Employer(s)
						id: 'P108'
					},
					{
						// Religion
						id: 'P140'
					},
					// FIXME: add awards?
					{
						// Signature
						id: 'P109'
					},
					{
						// Official website
						id: 'P856'
					}
				]
			},
			default: {
				rows: [
					{
						// Official website
						id: 'P856'
					}
				]
			}
		},
		/**
		 * Given a title work out the url to the thumbnail for that image
		 * FIXME: This should not make its way into stable.
		 * @method
		 * @param {String} title of file page without File: prefix
		 * @return {String} url corresponding to thumbnail (size 160px)
		 */
		getImageUrl: function ( title ) {
			var md5, filename, source,
				path = 'https://upload.wikimedia.org/wikipedia/commons/';

			// uppercase first letter in file name
			filename = title.charAt( 0 ).toUpperCase() + title.substr( 1 );
			// replace spaces with underscores
			filename = filename.replace( / /g, '_' );
			md5 = md5fn( filename );
			source = md5.charAt( 0 ) + '/' + md5.substr( 0, 2 ) + '/' + filename;
			if ( filename.substr( filename.length - 3 ) !== 'svg' ) {
				return path + 'thumb/' + source + '/160px-' + filename;
			} else {
				return path + source;
			}
		},
		/**
		 * Parses a list of claims
		 *
		 * @private
		 * @method
		 * @param {Object} claims as returned by WikiData#getClaims
		 * @return {Array} List of values matching that claim
		 */
		_getValues: function ( claims ) {
			var values = [],
				self = this;

			$.each( claims, function ( i, claim ) {
				var snak = claim.mainsnak,
					value = snak.datavalue;
				if ( snak.snaktype === 'novalue' ) {
					values.push( {
						value: 'None'
					} );
				} else if ( snak.datatype === 'commonsMedia' ) {
					values.push( {
						url: mw.util.getUrl( 'File:' + value.value ),
						src: self.getImageUrl( value.value )
					} );
				} else if ( value.type === 'string' ) {
					values.push( {
						value: value.value
					} );
				} else if ( value.type === 'time' ) {
					values.push( {
						// FIXME: This should be more readable. Usually time is not important.
						value: new Date( value.value.time.substr( 8 ) )
					} );
				} else if ( value.type === 'wikibase-entityid' ) {
					values.push( {
						id: 'Q' + value.value[ 'numeric-id' ],
						isLink: true
					} );
				} else if ( value.type === 'globecoordinate' ) {
					values.push( {
						value: value.value.latitude + ', ' + value.value.longitude
					} );
				} else if ( value.type === 'quantity' ) {
					// FIXME: Deal with qualifiers
					values.push( {
						value: value.value.amount
					} );
				} else {
					console.log( value.type + ' unknown', value );
				}
			} );
			return values;
		},
		/**
		 * Translates IDs in the current row value to human readable text
		 *
		 * @private
		 * @method
		 * @param {Array} rows with id and label
		 * @return {Array} rows with human readable values
		 */
		_mapLabels: function ( rows ) {
			var labelIds = [];

			// collect all the label ids
			$.each( rows, function ( i, row ) {
				labelIds.push( row.id );
				$.each( row.values, function ( i, value ) {
					if ( value.id ) {
						labelIds.push( value.id );
					}
				} );
			} );

			// work out what they all mean
			return this.api.getExpandedItemsData( labelIds ).then( function ( labels ) {
				// map the property id to the actual label.
				$.each( rows, function ( i, row ) {
					row.label = labels[ row.id ].label;
					$.each( row.values, function ( j, value ) {
						var item = labels[ value.id ];
						if ( item ) {
							value.value = item.label;
							value.url = item.url;
						}
					} );
				} );
				return rows;
			} );
		},
		/**
		 * Decides based on the type of item what infobox to render
		 *
		 * @private
		 * @method
		 * @param {Object} claims as returned by WikiData#getClaims
		 * @return {Object} default option values
		 */
		getDefaultsFromClaims: function ( claims ) {
			if ( claims.isHuman ) {
				return this.typeDefaults.human;
			} else if ( claims.isCity ) {
				return this.typeDefaults.city;
			} else if ( claims.isCountry ) {
				return this.typeDefaults.country;
			} else if ( claims.isTaxon ) {
				return this.typeDefaults.taxon;
			} else if ( claims.isMovie ) {
				return this.typeDefaults.movie;
			} else {
				return this.typeDefaults.default;
			}
		},
		/**
		 * Get the deferred object associated with the infobox
		 *
		 * @return {jQuery.Deferred}
		 */
		getDeferred: function () {
			return this.$deferred;
		},
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			this.$deferred = $.Deferred();
			this.api = new WikiDataApi( {
				itemId: options.itemId
			} );

			View.prototype.initialize.apply( this, arguments );
			this.on( 'load', $.proxy( this, '_loadRest', options ) );
		},
		/**
		 * Get an instance of the wikidata api
		 *
		 * @return {WikiDataApi}
		 */
		getApi: function () {
			return this.api;
		},
		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var _postRender = this.postRender,
				_emit = this.emit,
				self = this;

			if ( user.isAnon() ) {
				this.$( '.edit' ).remove();
			}
			this.$( '.spinner' ).hide();
			this.$( '.more' ).on( 'click', function () {
				$( this ).remove();
				_emit.call( self, 'load' );
				_postRender.call( self, options );
			} );
		},
		/**
		 * Decides based on the type of item what infobox to render
		 *
		 * @private
		 * @method
		 */
		_loadRest: function ( options ) {
			var self = this,
				_super = View.prototype.render;

			this.$( '.spinner' ).show();
			this.api.getClaims().done( function ( claims ) {
				var rows;
				options = $.extend( options, self.getDefaultsFromClaims( claims ) );
				rows = options.rows;
				if ( claims.description ) {
					options.description = claims.description;
				}
				$.each( rows, function ( i, row ) {
					if ( claims.entities && claims.entities[ row.id ] ) {
						row.values = self._getValues( claims.entities[ row.id ] );
					} else {
						row.values = [];
					}
					row.isEmpty = !( row.values && row.values.length );
				} );

				self._mapLabels( rows ).done( function ( rows ) {
					options.rows = rows;
					self.options = options;
					self.$deferred.resolve();
					_super.call( self, options );
					self.$( '.hidden' ).removeClass( 'hidden' );
					M.emit( 'photo-loaded', self.$el );
				} );
			} ).fail( function () {
				// remove spinner
				self.$el.remove();
			} );
		}
	} );

	M.define( 'modules/wikigrok/Infobox', Infobox );

}( mw.mobileFrontend, jQuery ) );
