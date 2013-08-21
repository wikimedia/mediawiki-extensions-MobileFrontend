( function( M, $ ) {

	var
		View = M.require( 'view' ),
		Section, Page;

	Section = View.extend( {
		template: M.template.get( 'section' ),
		defaults: {
			heading: '',
			content: ''
		},
		initialize: function( options ) {
			this.heading = options.heading;
			// index of this section in the given page
			this.index = options.index || -1;
			this.content = options.content;
			// flag for references
			this.hasReferences = options.hasReferences || false;
			this.id = options.id || null;
			this.anchor = options.anchor;
			this._super( options );
		}
	} );

	Page = View.extend( {
		template: M.template.get( 'page' ),
		defaults: {
			// For titles from other namespaces use a prefix e.g. Talk:Foo
			title: '',
			lead: '',
			isMainPage: false,
			talkLabel: mw.msg( 'mobile-frontend-talk-overlay-header' ),
			// FIXME: this is not a useful default and asking for trouble (only valid on a just edited page)
			lastModifiedTimestamp: ( "" + new Date().getTime() ).substr( 0,10 ) // Default to current timestamp
		},

		render: function( options ) {
			var pageTitle = options.title, self = this,
				$el = this.$el, _super = self._super;

			if ( !options.sections ) {
				$el.empty().addClass( 'loading' );
				// FIXME: api response should also return last modified timestamp and page_top_level_section_count property
				M.history.retrievePage( pageTitle ).done( function( pageData ) {
					options = $.extend( options, pageData );
					_super.call( self, options );

					// FIXME: currently wasteful due to bug 40678
					M.history.retrieveAllLanguages().done( function( languages ) {
						M.history.retrievePageLanguages( pageTitle, languages ).done( function( langlinks ) {
							var template = M.template.get( 'languageSection' ),
								data = {
									langlinks: langlinks,
									heading: mw.msg( 'mobile-frontend-language-article-heading' ),
									description: mw.msg( 'mobile-frontend-language-header', langlinks.length )
								};

							$el.find( '#mw-mf-language-section' ).html( template.render( data ) );
							M.emit( 'languages-loaded' );
						} );
					} );

					// reset loader
					$el.removeClass( 'loading' );

					// emit events so that modules can reinitialise
					M.emit( 'page-loaded', self );
				} ).fail( $.proxy( self, 'emit', 'error' ) );
			} else {
				self._super( options );
			}
		},
		// FIXME: [ajax page loading] Note this will not work when we ajax load namespaces other than main which we currently do not do.
		isTalkPage: function() {
			return mw.config.get( 'wgNamespaceIds' ).talk === mw.config.get( 'wgNamespaceNumber' );
		},
		// FIXME: Move to an api object
		preRender: function( options ) {
			var s, i, level, text,
				$tmpContainer = $( '<div>' ),
				html,
				sectionNum = 0,
				lastId = 0,
				secs = options.sections,
				sectionData = {};

			this._anchorSection = {};
			this.title = options.title;
			options.isTalkPage = this.isTalkPage();
			for ( i = 0; i < secs.length; i++ ) {
				s = secs[ i ];
				level = s.level;
				text = s.text || '';

				if ( i === 0 ) { // do lead
					this.lead = text;
				}

				if ( level === '2' ) {
					sectionNum += 1;
					lastId = s.id;
					this._anchorSection[ 'section_' + sectionNum ] = lastId;
					sectionData[ sectionNum ] = { content: text,
						id: lastId, heading: s.line, anchor: s.anchor };
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
				if ( s.hasOwnProperty( 'references' ) ) {
					sectionData[ sectionNum ].hasReferences = true;
				}
				this._anchorSection[ s.anchor ] = lastId;
			}
			this.sections = [];
			this._sectionLookup = {};
			for ( s in sectionData ) {
				if ( sectionData.hasOwnProperty( s ) ) {
					this.appendSection( sectionData[ s ] );
				}
			}
			this._lastSectionId = lastId;
			options = $.extend( options, {
				sections: this.sections,
				lead: this.lead,
				historyUrl: M.history.getArticleUrl( options.title, { action: 'history' } ),
				lastModifiedTimestamp: options.timestamp
			} );
		},
		appendSection: function( data ) {
			var section;
			if ( !data.id ) {
				data.id = ++this._lastSectionId;
			}
			data.index = this.sections.length + 1;
			section = new Section( data );
			if ( data.hasReferences ) {
				this._referenceLookup = section;
			}
			this.sections.push( section );
			this._sectionLookup[ section.id ] = section; // allow easy lookup of section
			return section;
		},
		/**
		 * Given an anchor that belongs to a heading
		 * find the Section it belongs to
		 *
		 * @param {string} an anchor associated with a section heading
		 * @return {Section} Section object that it belongs to
		 */
		getSectionFromAnchor: function( anchor ) {
			var parentId = this._anchorSection[ anchor ];
			if ( parentId ) {
				return this.getSubSection( parentId );
			}
		},
		getReferenceSection: function() {
			return this._referenceLookup;
		},
		getSubSection: function( id ) {
			return this._sectionLookup[ id ];
		},
		getSubSections: function() {
			return this.sections;
		}
	} );

	M.define( 'page', Page );
	M.define( 'Section', Section );

}( mw.mobileFrontend, jQuery ) );
