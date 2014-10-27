( function ( M, $ ) {

	var
		View = M.require( 'View' ),
		Section = M.require( 'Section' ),
		Page;

	/**
	 * @class Page
	 * @uses Section
	 * @extends View
	 */
	Page = View.extend( {
		defaults: {
			// id defaults to 0 which represents a new page. Be sure to override to avoid side effects.
			id: 0,
			/**
			 * Includes prefix where needed and is human readable.
			 * e.g. Talk:The man who lived
			 * @type {string}
			 */
			title: '',
			displayTitle: '',
			lead: '',
			protection: {
				edit: [ '*' ]
			},
			sections: [],
			inBetaOrAlpha: M.isBetaGroupMember(),
			isMainPage: false,
			userCanUpload: mw.config.get( 'wgUserCanUpload' ),
			talkLabel: mw.msg( 'mobile-frontend-talk-overlay-header' ),
			editLabel: mw.msg( 'mobile-frontend-editor-edit' ),
			languageLabel: mw.msg( 'mobile-frontend-language-article-heading' )
		},
		initialize: function ( options ) {
			// Fallback if no displayTitle provided
			options.displayTitle = options.displayTitle || options.title;
			options.languageUrl = mw.util.getUrl( 'Special:MobileLanguages/' + options.title );
			View.prototype.initialize.apply( this, arguments );
		},

		/**
		 * @method
		 * @return {Boolean}
		 */
		isWikiText: function () {
			return mw.config.get( 'wgPageContentModel' ) === 'wikitext';
		},

		/**
		 * @method
		 * @return {Boolean}
		 */
		isMainPage: function () {
			return this.options.isMainPage;
		},

		/**
		 * Checks whether the given user can edit the page.
		 * @method
		 * @param {mw.user} user Object representing a user
		 * @return {jQuery.Deferred} With parameter boolean
		 */
		isEditable: function ( user ) {
			var editProtection = this.options.protection.edit,
				resp = $.Deferred();

			user.getGroups().done( function ( groups ) {
				var editable = false;
				$.each( groups, function ( i, group ) {
					if ( $.inArray( group, editProtection ) > -1 ) {
						editable = true;
						return false;
					}
				} );
				resp.resolve( editable );
			} );
			return resp;
		},

		/**
		 * Return the latest revision id for this page
		 * @method
		 * @return {Number}
		 */
		getRevisionId: function () {
			return this.options.revId;
		},

		/**
		 * @method
		 * @return {string}
		 */
		getTitle: function () {
			return this.options.title;
		},

		/**
		 * @method
		 * @return {Number}
		 */
		getId: function () {
			return this.options.id;
		},

		/**
		 * @method
		 * @return {Number} namespace Number
		 */
		getNamespaceId: function () {
			var args = this.options.title.split( ':' ), nsId;
			if ( args[1] ) {
				nsId = mw.config.get( 'wgNamespaceIds' )[ args[0].toLowerCase().replace( ' ', '_' ) ] || 0;
			} else {
				nsId = 0;
			}
			return nsId;
		},

		/**
		 * @method
		 * @return {Boolean} Whether the page is a talk page or not
		 */
		isTalkPage: function () {
			var ns = this.getNamespaceId();
			// all talk pages are odd Numbers (except the case of special pages)
			return ns > 0 && ns % 2 === 1;
		},

		preRender: function ( options ) {
			var self = this;
			this.sections = [];
			this._sectionLookup = {};
			this.title = options.title;
			this.lead = options.lead;

			$.each( options.sections, function () {
				var section = new Section( this );
				self.sections.push( section );
				self._sectionLookup[section.id] = section;
			} );
		},

		/**
		 * @method
		 */
		getReferenceSection: function () {
			return this._referenceLookup;
		},

		/**
		 * FIXME: rename to getSection
		 * FIXME: Change function signature to take the anchor of the heading
		 * @method
		 * @return {Section}
		 */
		getSubSection: function ( id ) {
			return this._sectionLookup[ id ];
		},

		/**
		 * FIXME: rename to getSections
		 *
		 * @method
		 * @return Array
		 */
		getSubSections: function () {
			return this.sections;
		}
	} );

	M.define( 'Page', Page );

}( mw.mobileFrontend, jQuery ) );
