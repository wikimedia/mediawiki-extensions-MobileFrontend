( function ( M, $ ) {

	var View = M.require( 'View' ),
		context = M.require( 'context' ),
		useMediaWikiUI = context.isBetaGroupMember(),
		Icon;

	/**
	 * A wrapper for creating an icon.
	 * @class Icon
	 * @extends View
	 */
	Icon = View.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.hasText Whether the icon has text.
		 * @cfg {String} defaults.tagName The name of the tag in which the icon is wrapped.
		 * @cfg {String} defaults.base String used as a base for generating class names.
		 * Defaults to 'mw-ui-icon' (alpha) or 'icon' (stable and beta).
		 * @cfg {String} defaults.name Name of the icon.
		 * @cfg {String} defaults.modifier Additional class name.
		 * Defaults to 'mw-ui-icon-element' (alpha) or '' (stable and beta).
		 * @cfg {String} defaults.title Tooltip text.
		 */
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
		 * @return {String}
		 */
		getClassName: function () {
			return this.$el.attr( 'class' );
		},
		/**
		 * Return the class that relates to the icon glyph
		 * @method
		 * @return {String}
		 */
		getGlyphClassName: function () {
			return this.options.base + '-' + this.options.name;
		},
		/** @inheritdoc */
		initialize: function ( options ) {
			if ( options.hasText ) {
				options.modifier = useMediaWikiUI ? 'mw-ui-icon-before' : 'icon-text';
			}
			View.prototype.initialize.call( this, options );
		},
		/** @inheritdoc */
		postRender: function () {
			View.prototype.postRender.apply( this, arguments );
			this.$el = this.$el.children( 0 );
		},
		/**
		 * Return the HTML representation of this view
		 * @method
		 * @return {String}
		 */
		toHtmlString: function () {
			return $( '<div>' ).append( this.$el ).html();
		},
		template: mw.template.get( 'mobile.startup', 'icon.hogan' )
	} );

	M.define( 'Icon', Icon );

}( mw.mobileFrontend, jQuery ) );
