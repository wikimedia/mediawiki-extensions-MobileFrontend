( function ( M, $ ) {

	var View = M.require( 'View' ),
		useMediaWikiUI = M.isAlphaGroupMember(),
		Icon;

	/**
	 * A wrapper for creating an icon.
	 * @class Icon
	 * @extends View
	 */
	Icon = View.extend( {
		defaults: {
			hasText: false,
			tagName: 'div',
			base: useMediaWikiUI ? 'mw-ui-icon' : 'icon',
			name: '',
			modifier: useMediaWikiUI ? 'mw-ui-icon-element' : '',
			title: ''
		},
		/**
		 * Return the full class name that is required for the icon to render
		 * @method
		 * @return {string}
		 */
		getClassName: function () {
			return this.$el.attr( 'class' );
		},
		/**
		 * Return the class that relates to the icon glyph
		 * @method
		 * @return {string}
		 */
		getGlyphClassName: function () {
			return this.options.base + '-' + this.options.name;
		},
		initialize: function ( options ) {
			if ( options.hasText ) {
				options.modifier = useMediaWikiUI ? 'mw-ui-icon-before' : 'icon-text';
			}
			View.prototype.initialize.call( this, options );
		},
		postRender: function () {
			View.prototype.postRender.apply( this, arguments );
			this.$el = this.$el.children( 0 );
		},
		toHtmlString: function () {
			return $( '<div>' ).append( this.$el ).html();
		},
		template: mw.template.get( 'mobile.startup', 'icon.hogan' )
	} );

	M.define( 'Icon', Icon );

}( mw.mobileFrontend, jQuery ) );
