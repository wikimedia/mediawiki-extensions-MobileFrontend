( function ( M, $ ) {
	var Infobox,
		md5fn = M.require( 'hex_md5' ),
		WikiDataApi = M.require( 'modules/WikiDataApi' ),
		View = M.require( 'View' ),
		user = M.require( 'user' ),
		icons = M.require( 'icons' ),
		months = [
			'january-date',
			'february-date',
			'march-date',
			'april-date',
			'may-date',
			'june-date',
			'july-date',
			'august-date',
			'september-date',
			'october-date',
			'november-date',
			'december-date'
		];

	/**
	 * A Wikidata generated infobox.
	 * Emits photo-loaded event when images in the infobox have loaded.
	 * @class Infobox
	 * @extends View
	 */
	Infobox = View.extend( {
		template: mw.template.get( 'mobile.infobox', 'Infobox.hogan' ),

		className: 'wikidata-infobox',
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
		/** @inheritdoc */
		events: {
			'click .more': 'onExpandInfobox'
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
						type: 'commonsMedia',
						url: mw.util.getUrl( 'File:' + value.value ),
						src: self.getImageUrl( value.value )
					} );
				} else if ( value.type === 'string' ) {
					values.push( {
						value: value.value
					} );
				} else if ( value.type === 'time' ) {
					values.push( {
						value: self._getFormattedTime( value.value )
					} );
				} else if ( value.type === 'wikibase-entityid' ) {
					values.push( {
						type: 'item',
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
		 * Return a user friendly version of time.
		 * @param {Object} time
		 * Example:
		 * {
		 *     after: 0,
		 *     before: 0,
		 *     calendarmodel: "http://www.wikidata.org/entity/Q1985727",
		 *     precision: 9,
		 *     time: "-00000000550-01-01T00:00:00Z",
		 *     timezone: 0
		 * }
		 * @returns {String} Formatted time
		 * Example: '550 BCE'
		 * @private
		 * FIXME: timezone is assumed to be UTC. Explore using http://momentjs.com/timezone/
		 */
		_getFormattedTime: function ( time ) {
			var formattedTime,
				date = new Date( time.time.substr( 8 ) ),
				year = date.getUTCFullYear().toString(),
				isBCE = time.time.charAt( 0 ) === '-',
				eraMessage = 'mobile-frontend-time-precision-' +
					( isBCE ? 'BCE-' : '' );
			// Precision Values:
			// 0 - billion years
			// 1 - hundred million years
			// 2...
			// 6 - millennium
			// 7 - century
			// 8 - decade
			// 9 - year
			// 10 - month
			// 11 - day
			// 12 - hour
			// 13 - minute
			// 14 - second
			switch ( time.precision ) {
				case 0:
					formattedTime = mw.msg( eraMessage + 'Gannum', year );
					break;
				case 1:
				case 2:
				case 3:
				case 4:
					formattedTime = mw.msg( eraMessage + 'Mannum', year );
					break;
				case 5:
					formattedTime = mw.msg( eraMessage + 'annum', year );
					break;
				case 6:
					formattedTime = mw.msg( eraMessage + 'millennium', year );
					break;
				case 7:
					formattedTime = mw.msg( eraMessage + 'century', year );
					break;
				case 8:
					formattedTime = mw.msg( eraMessage + '10annum', year );
					break;
				default:
					formattedTime = mw.msg( eraMessage + '0annum', year );
					break;
			}
			// month
			if ( time.precision === 10 ) {
				formattedTime = $.trim( mw.msg(
					months[date.getUTCMonth()],
					''
				) ) + ' ' + formattedTime;
				// date
			} else if ( time.precision > 10 ) {
				formattedTime = mw.msg(
					months[ date.getUTCMonth() ],
					date.getUTCDate().toString()
				) + ' ' + formattedTime;
			}
			// ignore time
			return formattedTime;
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
					var meta = labels[ row.id ];
					if ( meta ) {
						row.label = meta.label;
						row.type = meta.type;
					} else {
						row.label = 'No label.';
					}

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
			var defaults,
				self = this,
				fallback = this.typeDefaults['default'] ||
					{
						rows: []
					};

			// Iterate through instances assuming priority order
			$.each( claims.instanceTypes, function () {
				// Pick the first match
				if ( !defaults ) {
					defaults = self.typeDefaults[this];
				}
			} );
			return defaults || fallback;
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
		postRender: function () {
			if ( user.isAnon() ) {
				this.$( '.edit' ).remove();
			}
			this.$( '.spinner' ).hide();
		},
		/**
		 * Event handler that runs when the more button is clicked.
		 * @param {jQuery.Event} ev
		 */
		onExpandInfobox: function ( ev ) {
			$( ev.target ).remove();
			this.emit( 'load' );
			this.postRender( this.options );
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
				var rows,
					isEmptyInfobox = true,
					commonsCategory = mw.config.get( 'wgWikiBasePropertyConfig' ).commonsCategory;

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
					var claimRow = claims.entities[ row.id ];
					if ( claims.entities && claims.entities[ row.id ] ) {
						row.values = self._getValues( claimRow );
					} else {
						row.values = [];
					}
					if ( row.values && row.values.length ) {
						isEmptyInfobox = false;
					} else {
						row.isEmpty = true;
					}
				} );

				// check, if the wikidata item has a commons category and add the link to it
				if ( claims.entities.hasOwnProperty( commonsCategory ) ) {
					options.commonsLink = '#/commons-category/' + claims.entities[commonsCategory][0].mainsnak.datavalue.value;
				}

				options.isEmptyInfobox = isEmptyInfobox;
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

	M.define( 'modules/Infobox', Infobox );

}( mw.mobileFrontend, jQuery ) );
