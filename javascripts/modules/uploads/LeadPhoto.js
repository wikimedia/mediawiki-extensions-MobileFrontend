( function( M ) {

	var View = M.require( 'view' ), LeadPhoto;

	LeadPhoto = View.extend( {
		template: M.template.get( 'leadPhoto' ),

		animate: function() {
			this.$el.hide().slideDown();
		}
	} );

	M.define( 'modules/uploads/LeadPhoto', LeadPhoto );

}( mw.mobileFrontend ) );
