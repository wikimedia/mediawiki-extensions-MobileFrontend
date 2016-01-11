( function ( M, $ ) {

	var View = M.require( 'mobile.view/View' );

	/**
	 * A wrapper for creating an icon.
	 * @class Icon
	 * @extends View
	 */
	function Icon( options ) {
		if ( options.hasText ) {
			options.modifier = 'mw-ui-icon-before';
		}
		if ( options.href ) {
			options.tagName = 'a';
		}
		View.call( this, options );
	}

	OO.mfExtend( Icon, View, {
		/** @inheritdoc */
		isTemplateMode: true,
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.hasText Whether the icon has text.
		 * @cfg {String} [defaults.href] value of href attribute, when set tagName will default to anchor tag
		 * @cfg {String} defaults.tagName The name of the tag in which the icon is wrapped. Defaults to 'a' when href option present.
		 * @cfg {String} defaults.base String used as a base for generating class names.
		 * Defaults to 'mw-ui-icon'.
		 * @cfg {String} defaults.name Name of the icon.
		 * @cfg {String} defaults.modifier Additional class name.
		 * Defaults to 'mw-ui-icon-element'.
		 * @cfg {String} defaults.title Tooltip text.
		 */
		defaults: {
			hasText: false,
			href: undefined,
			tagName: 'div',
			base: 'mw-ui-icon',
			name: '',
			modifier: 'mw-ui-icon-element',
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

	M.define( 'mobile.startup/Icon', Icon );

}( mw.mobileFrontend, jQuery ) );
