( function ( $, M ) {

	var WikiGrokDialogC = M.require( 'modules/wikigrok/WikiGrokDialogC' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		wikiGrokCampaigns = M.require( 'modules/wikigrok/wikiGrokCampaigns' ),
		campaigns = {
			actor: {
				property: "P106",
				questions: {
					Q10798782: "television actor",
					Q10800557: "film actor"
				}
			}
		},
		suggestions = {
			actor: {
				id: 'P106',
				list: ['Q10798782', 'Q10800557'],
				name: 'actor'
			}
		},
		labels = {
			Q10798782: 'television actor',
			Q10800557: 'film actor'

		},
		pageTitle = 'Some guy';

	QUnit.module( 'MobileFrontend: WikiGrokDialogC', {
		teardown: function () {
			this.wk.remove();
		},
		setup: function () {
			// don't run eventLogging
			this.sandbox.stub( WikiGrokDialogC.prototype, 'log' );
			this.sandbox.stub( WikiGrokDialogC.prototype, 'logError' );

			this.sandbox.stub( mw.config, 'get').withArgs( 'wgWikiGrokCampaigns' )
				.returns( campaigns );
			this.sandbox.stub( WikiDataApi.prototype, 'getLabels' )
				.returns( $.Deferred().resolve( labels ) );
			this.sandbox.stub( WikiGrokResponseApi.prototype, 'recordClaims' )
				.returns( $.Deferred().resolve() );

			this.$el = $( '<div id="test">' );
			this.wk = new WikiGrokDialogC( {
				el: this.$el,
				campaign: wikiGrokCampaigns.getRandomCampaign(),
				itemId: '1234',
				title: pageTitle,
				userToken: 'token',
				testing: false,
				// Set suggestions to go to the second screen.
				suggestions: suggestions
			} );
		}
	} );

	QUnit.test( '#UI does not render initial screen from version B', 3, function ( assert ) {
		var tags = this.wk.$el.find( '.tags .ui-tag-button' ),
			labels = tags.find( 'label' );
		// the initial screen buttons are hidden
		assert.strictEqual( this.$el.find( '.wg-buttons' ).css( 'display' ), 'none');
		// The question is there
		assert.strictEqual( tags.length, 2, 'Correct number of tags' );
		assert.strictEqual( labels.first().text(), 'Profession', 'Correct label text' );
	} );

	QUnit.asyncTest( '#UI - Question - Answer correct', function ( assert ) {
		QUnit.expect( 1 );
		var spy = this.sandbox.stub( WikiGrokDialogC.prototype, 'postRecordClaims' );
		this.$el.find( '.ui-tag-button' ).trigger( 'click' );
		this.$el.find( '.save' ).trigger( 'click' );

		setTimeout( $.proxy( function () {
			assert.ok( spy.called, 'postRecordClaims is called.' );
			QUnit.start();
		}, this ), 0 );
	} );
}( jQuery, mw.mobileFrontend ) );
