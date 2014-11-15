( function ( M, $ ) {
	var Infobox,
		md5fn = M.require( 'hex_md5' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		View = M.require( 'View' ),
		icons = M.require( 'icons' );

	/**
	 * A Wikidata generated infobox.
	 * FIXME: This currently requires 2 hits to the Wikidata API on every page load.
	 * @class Infobox
	 * @extends View
	 * @fires photo-loaded when all ajax requests have completed
	 */
	Infobox = View.extend( {
		template: mw.template.get( 'mobile.infobox', 'Infobox.hogan' ),

		className: 'wikidata-infobox',
		defaults: {
			spinner: icons.spinner().toHtmlString(),
			description: mw.config.get( 'wgMFDescription' ) ||
				'A Wikipedia page in need of a description.',
			rows: []
		},
		typeDefaults: {
			// FIXME: In future this should be configurable by Wikipedia admins
			human: {
				rows: [
					{
						id: 'P18'
					},
					{
						id: 'P569',
						label: 'Born'
					},
					{
						id: 'P19',
						label: 'Birthplace'
					},
					{
						id: 'P570',
						label: 'Died'
					},
					{
						id: 'P20',
						label: 'Place of death'
					},
					{
						id: 'P27',
						label: 'Country of citizenship'
					},
					// FIXME: Add political party
					{
						id: 'P26',
						label: 'Spouse(s)'
					}, {
						id: 'P25',
						label: 'Mother(s)'
					}, {
						id: 'P22',
						label: 'Father(s)'
					},
					//FIXME: Add Stepfather(s) (P43) and step mothers?
					{
						id: 'P9',
						label: 'Sister(s)'
					},
					{
						id: 'P7',
						label: 'Brother(s)'
					},
					{
						id: 'P40',
						label: 'Child(ren)'
					},
					// FIXME: add residence?
					{
						id: 'P69',
						label: 'Alma mater'
					},
					{
						id: 'P106',
						label: 'Occupation'
					},
					{
						id: 'P108',
						label: 'Employer(s)'
					},
					{
						id: 'P140',
						label: 'Religion'
					},
					// FIXME: add awards?
					{
						id: 'P109',
						label: 'Signature'
					},
					{
						id: 'P856',
						label: 'Official website'
					}
				]
			},
			default: {
				description: undefined,
				rows: [
					{
						id: 'P856',
						label: 'Official website'
					}
				]
			}
		},
		/**
		 * Given a title work out the url to the thumbnail for that image
		 * FIXME: This should not make its way into stable.
		 * @param {String} title of file page without File: prefix
		 * @return {String} url corresponding to thumbnail (size 160px)
		 */
		getImageUrl: function ( title ) {
			var md5, filename, source,
				path = 'https://upload.wikimedia.org/wikipedia/commons/';

			// uppercase first letter in file name
			filename = title.charAt( 0 ).toUpperCase() + title.substr( 1 );
			// replace spaces with underscores
			filename = filename.replace(/ /g, '_');
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
			var values = [], self = this;

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
				$.each( row.values, function ( i, value ) {
					if ( value.id ) {
						labelIds.push( value.id );
					}
				} );
			} );

			// work out what they all mean
			return this.api.getLabels( labelIds ).then( function ( labels ) {
				// map the property id to the actual label.
				$.each( rows, function ( i, row ) {
					$.each( row.values, function ( j, value ) {
						if ( labels[ value.id ] ) {
							value.value = labels[ value.id ];
							value.url = mw.util.getUrl( value.value );
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
			} else {
				return this.typeDefaults.default;
			}
		},
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			this.api = new WikiDataApi( {
				itemId: options.itemId
			} );

			View.prototype.initialize.apply( this, arguments );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var _loadRest = this._loadRest,
				self = this;

			this.$( '.spinner' ).hide();
			this.$( '.more' ).on( 'click', function () {
				$( this ).remove();
				_loadRest.call( self, options );
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
				options.description = claims.description;
				rows = options.rows;
				$.each( rows, function ( i, row ) {
					if ( claims.entities[ row.id ] ) {
						row.values = self._getValues( claims.entities[ row.id ] );
					} else {
						row.values = [];
					}
					row.isEmpty = !( row.values && row.values.length );
				} );

				self._mapLabels( rows ).done( function ( rows ) {
					options.rows = rows;
					_super.call( self, options );
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
