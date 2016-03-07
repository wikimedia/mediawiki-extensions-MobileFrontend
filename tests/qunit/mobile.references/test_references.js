( function ( $, M ) {

	var R = mw.mobileFrontend.require( 'mobile.references/references' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend references.js', {
		setup: function () {
			this.$container = mw.template.get( 'tests.mobilefrontend', 'references.html' )
				.render().appendTo( '#qunit-fixture' );
			this.page = new Page( {
				el: this.$container,
				title: 'Reftest'
			} );
			// we use Page object which calls getUrl which uses config variables.
			this.sandbox.stub( mw.util, 'getUrl' ).returns( '/wiki/Reftest' );
		}
	} );

	QUnit.test( 'Standard', 1, function ( assert ) {
		this.sandbox.stub( mw.config, 'get' ).withArgs( 'wgMFLazyLoadReferences' ).returns( {
			beta: false,
			base: false
		} );
		R.getReference( '#cite_note-1', this.page ).done( function ( ref ) {
			assert.strictEqual( $( '<div>' ).html( ref.text ).find( '.reference-text' ).text(), 'hello' );
		} );
	} );

	QUnit.test( 'Lazy loaded', 1, function ( assert ) {
		this.sandbox.stub( mw.Api.prototype, 'get' ).returns(
			$.Deferred().resolve( {
				query: {
					pages: [
						{
							references: {
								'cite_note-1': {
									key: 1,
									// include html to avoid hitting EditorGateway
									html: '<i>so lazy</i>',
									text: '\'\'so lazy\'\''
								}
							}
						}
					]
				}
			} )
		);
		this.sandbox.stub( mw.config, 'get' ).withArgs( 'wgMFLazyLoadReferences' ).returns( {
			beta: true,
			base: true
		} );
		R.getReference( '#cite_note-1', this.page ).done( function ( ref ) {
			assert.strictEqual( ref.text, '<i>so lazy</i>' );
		} );
	} );

} )( jQuery, mw.mobileFrontend );
