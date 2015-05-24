( function ( M, $ ) {

	var Overlay = M.require( 'Overlay' ),
		OtherProjectsOverlay;

	/**
	 * Overlay displaying list of site links to other projects
	 * @class OtherProjectsOverlay
	 * @extends Overlay
	 */
	OtherProjectsOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 */
		defaults: {
			heading: mw.msg( 'mobile-frontend-other-projects-overlay-heading' )
		},
		/** @inheritdoc */
		templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.otherProjects', 'content.hogan' )
		} )
	} );

	M.define( 'modules/projects/OtherProjectsOverlay', OtherProjectsOverlay );

}( mw.mobileFrontend, jQuery ) );
