( function ( $, M ) {

	var ReferencesHtmlScraperGateway = M.require(
			'mobile.references.gateway/ReferencesHtmlScraperGateway' ),
		ReferencesGateway = M.require( 'mobile.references.gateway/ReferencesGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: htmlScraper references gateway', {
		beforeEach: function () {
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

	QUnit.test( 'checking good reference', function ( assert ) {
		return this.referencesGateway.getReference( '#cite_note-1', this.page ).then( function ( ref ) {
			assert.strictEqual( $( '<div>' ).html( ref.text ).find( '.reference-text' ).text(), 'hello' );
		} );
	} );

	QUnit.test( 'checking bad reference', function ( assert ) {
		return this.referencesGateway.getReference( '#cite_note-bad', this.page ).catch( function ( err ) {
			assert.strictEqual( err, ReferencesGateway.ERROR_NOT_EXIST, 'When bad id given false returned.' );
		} );
	} );

	QUnit.test( 'checking encoded reference', function ( assert ) {
		var id = '#cite_note-Obama_1995,_2004,_pp._9%E2%80%9310-11';
		return this.referencesGateway.getReference( id, this.page ).then( function ( ref ) {
			assert.strictEqual( $( '<div>' ).html( ref.text ).find( '.reference-text' ).text(), 'found',
				'If an encoded ID parameter is given it still resolves correctly.' );
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
