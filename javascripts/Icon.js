( function( M ) {

	var View = M.require( 'View' ),
		Icon;

	/**
	 * A {@link View} that pops up from the bottom of the screen.
	 * @class Drawer
	 * @extends Panel
	 */
	Icon = View.extend( {
		defaults: {
			hasText: false,
			tagName: 'div',
			base: 'icon',
			name: '',
			modifier: '',
			title: ''
		},
		initialize: function( options ) {
			if ( options.hasText ) {
				options.modifier = 'icon-text';
			}
			View.prototype.initialize.call( this, options );
		},
		toHtmlString: function() {
			return this.$el.html();
		},
		template: M.template.get( 'icon.hogan' )
	} );

	M.define( 'Icon', Icon );

}( mw.mobileFrontend ) );
