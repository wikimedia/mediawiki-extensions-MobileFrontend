( function( M,  $ ) {

	var
		View = M.require( 'view' ),
		Section, Page;

	Section = View.extend( {
		defaults: {
			heading: '',
			content: '',
			id: null
		},
		initialize: function( options ) {
			this.heading = options.heading;
			this.content = options.content;
			this.id = options.id;
		}
	} );

	Page = View.extend( {
		defaults: {
			heading: '',
			lead: '',
			sections: []
		},
		initialize: function( options ) {
			var s, i, level, text,
				$tmpContainer = $( '<div>' ),
				html,
				sectionNum = 0,
				lastId = 0,
				secs = options.sections,
				sectionData = {};

			for ( i = 0; i < secs.length; i++ ) {
				s = secs[ i ];
				level = s.level;
				text = s.text || '';

				if ( i === 0 ) { // do lead
					this.lead = text;
				}

				if ( level === '2' ) {
					lastId = s.id;
					sectionNum = sectionNum + 1;
					sectionData[ sectionNum ] = { content: text,
						id: s.id, heading: s.line };

				} else if ( level ) {
					$tmpContainer.html( text );
					$tmpContainer.prepend(
						$( '<h' + level + '>' ).attr( 'id', s.anchor ).html( s.line )
					);
					html = $tmpContainer.html();
					// deal with pages which have an h1 at the top
					if ( !sectionData[ sectionNum ] ) {
						this.lead += html;
					} else {
						sectionData[ sectionNum ].content += html;
					}
				}
			}
			this.sections = [];
			this._sectionLookup = {};
			for ( s in sectionData ) {
				if ( sectionData.hasOwnProperty( s ) ) {
					this.appendSection( sectionData[ s ] );
				}
			}
			this._lastSectionId = lastId;
		},
		appendSection: function( data ) {
			var section;
			if ( !data.id ) {
				data.id = ++this._lastSectionId;
			}
			section = new Section( data );
			this.sections.push( section );
			this._sectionLookup[ section.id ] = section; // allow easy lookup of section
			return section;
		},
		getSubSection: function( id ) {
			return this._sectionLookup[ id ];
		},
		getSubSections: function() {
			return this.sections;
		}
	} );

	M.define( 'page', Page );

}( mw.mobileFrontend, jQuery ) );
