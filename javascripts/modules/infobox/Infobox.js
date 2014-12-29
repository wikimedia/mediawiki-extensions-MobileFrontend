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
		typeDefaults: mw.config.get( 'wgMFInfoboxConfig' ),
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
			return this.typeDefaults[claims.instanceOf || 'default'];
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
		 * @param {Object} options for overlay
		 */
		_loadRest: function ( options ) {
			var self = this,
				_super = View.prototype.render;

			this.$( '.spinner' ).show();
			this.api.getClaims().done( function ( claims ) {
				var rows;
				options = $.extend( options, self.getDefaultsFromClaims( claims ) );
				if ( options.rows ) {
					rows = options.rows;
				} else {
					// FIXME: Show toast?
					throw 'Invalid configuration for infobox on this page.';
				}
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
