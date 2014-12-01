( function ( $, M ) {

	var WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		settings = M.require( 'settings'),
		suggestions = [ {
			"id": "P106",
			"name": "occupations",
			"list": [ "Q285759" ]
		} ],
		labels = {
			Q285759: "insurance broker"
		},
		pageTitle = M.getCurrentPage().title || 'Some guy';

	function getPagesWithWikiGrokContributions () {
		return $.parseJSON(
			settings.get( 'pagesWithWikiGrokContributions', false ) || '{}'
		);
	}

	QUnit.module( 'MobileFrontend: WikiGrokDialog', {
		teardown: function () {
			this.wk.remove();
		},
		setup: function () {
			settings.remove( 'pagesWithWikiGrokContributions', false );
			this.$el = $( '<div id="test">' );
			this.wk = new WikiGrokDialog( {
				el: this.$el,
				itemId: '1234',
				title: pageTitle,
				userToken: 'token',
				testing: false,
				// Set suggestions to go to the second screen.
				suggestions: suggestions
			} );
			// don't run eventLogging
			this.stub( WikiGrokDialog.prototype, 'log' );
			this.stub( WikiGrokDialog.prototype, 'logError' );
		}
	} );

	QUnit.test( '#chooseRandomItemsFromArray - randomly choose items form array', 7, function ( assert ) {
		var array = [],
			chooseRandomItemsFromArray = WikiGrokDialog.prototype.chooseRandomItemsFromArray;

		assert.strictEqual(
			$.isEmptyObject( chooseRandomItemsFromArray( array, 1 ) ),
			true,
			'picking 1 element from an array with 0 elements'
		);

		array = [ 1 ];
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 1 ).length,
			1,
			'picking 1 element from an array with 1 element'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 2 ).length,
			1,
			'picking 2 elements from an array with 1 element'
		);

		array = [ 4, { 3: 2 }, [ 'a', 'b', 0 ], -1 ];
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 1 ).length,
			1,
			'picking 1 element from an array with 4 elements'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 2 ).length,
			2,
			'picking 2 elements from an array with 4 elements'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 4 ).length,
			4,
			'picking 4 elements from an array with 4 elements'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 10 ).length,
			4,
			'picking 10 elements from an array with 4 elements'
		);
	} );

	/**
	 * Debug the wikigrok dialog by showing it in screen
	 * Use in tests like:
	 *   debugDialog.apply( this );
	 */
	/*
	function debugDialog() {
		this.wk.remove = function() {};
		this.wk.prependTo( '#content' ).show();
	}
	*/

	QUnit.test( '#UI renders initial screen', 4, function ( assert ) {
		// Lets check that we've got the header, info, buttons and 'Tell me more'
		assert.strictEqual( this.$el.find( '.wg-header' ).length, 1 );
		assert.ok( this.$el.find( '.wg-content' ).text().length > 0 );
		assert.strictEqual( this.$el.find( '.wg-buttons button' ).length, 2 );
		assert.ok( this.$el.find( '.wg-notice>a' ).attr('href').length > 0 );
	} );

	QUnit.test( '#UI clicking no thanks hides the dialog', 1, function ( assert ) {
		var spy = this.sandbox.stub( WikiGrokDialog.prototype, 'hide' );
		this.$el.find('.cancel').click();
		assert.ok( spy.called );
	} );

	function getToQuestion() {
		this.sandbox.stub( WikiDataApi.prototype, 'getLabels' )
			.returns( $.Deferred().resolve( labels ) );

		this.$el.find('.proceed').click();
	}

	QUnit.test( '#UI clicking OK, takes you to the question dialog', 1, function ( assert ) {
		getToQuestion.apply(this);
		// The name of the page is on the question
		assert.ok( this.$el.text().indexOf(pageTitle) !== -1 );
	} );

	function answerQuestion( sel ) {
		this.sandbox.stub( WikiGrokResponseApi.prototype, 'recordClaims' )
			.returns( $.Deferred().resolve() );
		this.$el.find( sel ).click();
	}

	QUnit.test( '#UI - Question - Click Yes', 4, function ( assert ) {
		getToQuestion.apply( this );

		assert.equal(
			getPagesWithWikiGrokContributions()[pageTitle],
			undefined,
			"User's contribution to WikiGrok has not been saved locally yet."
		);

		answerQuestion.call( this, '.yes' );

		// I'm in thanks page now!
		assert.equal( this.$el.find( '.wg-link' ).length, 1 );
		assert.equal( this.$el.find( '.wg-link>a' ).length, 1 );

		assert.equal(
			getPagesWithWikiGrokContributions()[pageTitle],
			true,
			"User's contribution to WikiGrok has been saved locally correctly."
		);
	} );

	QUnit.test( '#UI - Question - Click No', 4, function ( assert ) {
		getToQuestion.apply( this );

		assert.equal(
			getPagesWithWikiGrokContributions()[pageTitle],
			undefined,
			"User's contribution to WikiGrok has not been saved locally yet."
		);

		answerQuestion.call( this, '.no' );

		// I'm in thanks page now!
		assert.equal( this.$el.find( '.wg-link' ).length, 1 );
		assert.equal( this.$el.find( '.wg-link>a' ).length, 1 );

		assert.equal(
			getPagesWithWikiGrokContributions()[pageTitle],
			true,
			"User's contribution to WikiGrok has been saved locally correctly."
		);
	} );

	QUnit.test( '#UI - Question - Click Not sure', 4, function ( assert ) {
		getToQuestion.apply( this );

		assert.equal(
			getPagesWithWikiGrokContributions()[pageTitle],
			undefined,
			"User's contribution to WikiGrok has not been saved locally yet."
		);

		answerQuestion.call( this, '.not-sure' );

		// I'm in thanks page now!
		assert.equal( this.$el.find( '.wg-link' ).length, 1 );
		assert.equal( this.$el.find( '.wg-link>a' ).length, 1 );
		assert.equal(
			getPagesWithWikiGrokContributions()[pageTitle],
			true,
			"User's contribution to WikiGrok has been saved locally correctly."
		);
	} );

}( jQuery, mw.mobileFrontend ) );
