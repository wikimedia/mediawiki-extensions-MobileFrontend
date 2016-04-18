( function ( $, M ) {

	var ReferencesHtmlScraperGateway = M.require(
			'mobile.references.gateway/ReferencesHtmlScraperGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: htmlScraper references gateway', {
		setup: function () {
			this.$container = mw.template.get( 'tests.mobilefrontend', 'references.html' )
				.render().appendTo( '#qunit-fixture' );
			this.page = new Page( {
				el: this.$container,
				title: 'Reftest'
			} );
			this.referencesGateway = new ReferencesHtmlScraperGateway( new mw.Api() );
			// we use Page object which calls getUrl which uses config variables.
			this.sandbox.stub( mw.util, 'getUrl' ).returns( '/wiki/Reftest' );
		}
	} );

	QUnit.test( 'checking good reference', 1, function ( assert ) {
		var done = assert.async( 1 );
		this.referencesGateway.getReference( '#cite_note-1', this.page ).done( function ( ref ) {
			assert.strictEqual( $( '<div>' ).html( ref.text ).find( '.reference-text' ).text(), 'hello' );
			done();
		} );
	} );

	QUnit.test( 'checking bad reference', 1, function ( assert ) {
		var done = assert.async( 1 );
		this.referencesGateway.getReference( '#cite_note-bad', this.page ).done( function ( ref ) {
			assert.ok( ref === false, 'When bad id given false returned.' );
			done();
		} );
	} );

} )( jQuery, mw.mobileFrontend );
