( function( M, $ ) {

	var
		View = M.require( 'view' ),
		Section, Page;

	Section = View.extend( {
		template: M.template.get( 'section' ),
		defaults: {
			line: '',
			text: '',
			editLabel: mw.msg( 'mobile-frontend-editor-edit' )
		},
		initialize: function( options ) {
			this.line = options.line;
			this.text = options.text;
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
			editLabel: mw.msg( 'mobile-frontend-editor-edit' ),
			// FIXME: this is not a useful default and asking for trouble (only valid on a just edited page)
			lastModifiedTimestamp: ( "" + new Date().getTime() ).substr( 0,10 ) // Default to current timestamp
		},

		isMainPage: function() {
			return this.options.isMainPage;
		},

		// FIXME: This assumes only one page can be rendered at one time - emits a page-loaded event and sets wgArticleId
		render: function( options ) {
			var pageTitle = options.title, self = this,
				$el = this.$el, _super = self._super;

			// FIXME: this is horrible, because it makes preRender run _during_ render...
			if ( !options.sections ) {
				$el.empty().addClass( 'spinner loading' );
				// FIXME: api response should also return last modified timestamp and page_top_level_section_count property
				M.pageApi.getPage( pageTitle ).done( function( pageData ) {
					options = $.extend( options, pageData );

					_super.call( self, options );

					// FIXME: currently wasteful due to bug 40678
					M.pageApi.getPageLanguages( pageTitle ).done( function( langlinks ) {
						var template = M.template.get( 'languageSection' ),
							data = {
								langlinks: langlinks,
								heading: mw.msg( 'mobile-frontend-language-article-heading' ),
								description: mw.msg( 'mobile-frontend-language-header', langlinks.length )
							};

						$el.find( '#mw-mf-language-section' ).html( template.render( data ) );
						M.emit( 'languages-loaded' );
					} );

					// reset loader
					$el.removeClass( 'spinner loading' );

					self.emit( 'ready', self );
				} ).fail( $.proxy( self, 'emit', 'error' ) );
			} else {
				self._super( options );
			}
		},

		// FIXME: [ajax page loading] Note this will not work when we ajax load namespaces other than main which we currently do not do.
		isTalkPage: function() {
			return mw.config.get( 'wgNamespaceIds' ).talk === mw.config.get( 'wgNamespaceNumber' );
		},

		preRender: function( options ) {
			var self = this;
			this.sections = [];
			this._sectionLookup = {};
			this.title = options.title;
			this.lead = options.lead;

			$.each( options.sections, function() {
				var section = new Section( this );
				self.sections.push( section );
				self._sectionLookup[section.id] = section;
			} );
		},

		getReferenceSection: function() {
			return this._referenceLookup;
		},

		// FIXME: rename to getSection
		// FIXME: Change function signature to take the anchor of the heading
		getSubSection: function( id ) {
			return this._sectionLookup[ id ];
		},

		// FIXME: rename to getSections
		getSubSections: function() {
			return this.sections;
		}
	} );

	M.define( 'Page', Page );
	M.define( 'Section', Section );

}( mw.mobileFrontend, jQuery ) );
