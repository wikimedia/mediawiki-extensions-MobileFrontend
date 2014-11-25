( function ( $, M ) {

	var WikiGrokDialogB = M.require( 'modules/wikigrok/WikiGrokDialogB' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		WikiGrokSuggestionApi = M.require( 'modules/wikigrok/WikiGrokSuggestionApi' ),
		WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		claims = JSON.parse( '{"isHuman":true,"hasOccupation":false,"hasCountryOfCitizenship":true,"hasDateOfBirth":true,"hasDateOfDeath":true,"entities":{"P18":[{"id":"q3784220$8E93773C-9D9F-40E7-B570-941D49157250","mainsnak":{"snaktype":"value","property":"P18","datatype":"commonsMedia","datavalue":{"value":"Anne Dallas Dudley LOC.jpg","type":"string"}},"type":"statement","rank":"normal","references":[{"hash":"7eb64cf9621d34c54fd4bd040ed4b61a88c4a1a0","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":328},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P21":[{"id":"q3784220$3bbdabca-47f4-023a-56da-cc5faeceee76","mainsnak":{"snaktype":"value","property":"P21","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":6581072},"type":"wikibase-entityid"}},"type":"statement","rank":"normal"}],"P373":[{"id":"q3784220$6F08ECAF-748D-4844-ADDB-B8F3B0CEFFE8","mainsnak":{"snaktype":"value","property":"P373","datatype":"string","datavalue":{"value":"Anne Dallas Dudley","type":"string"}},"type":"statement","rank":"normal","references":[{"hash":"3f12e959c196a5a4adc7f7d1ba480c2629b550f8","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":565},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P31":[{"id":"Q3784220$145FD1EB-53A0-47CE-B964-2D6C9F380738","mainsnak":{"snaktype":"value","property":"P31","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":5},"type":"wikibase-entityid"}},"type":"statement","rank":"normal","references":[{"hash":"7eb64cf9621d34c54fd4bd040ed4b61a88c4a1a0","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":328},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P19":[{"id":"Q3784220$34CF719D-DC0C-4115-AB38-077F2E903068","mainsnak":{"snaktype":"value","property":"P19","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":23197},"type":"wikibase-entityid"}},"type":"statement","rank":"normal","references":[{"hash":"7eb64cf9621d34c54fd4bd040ed4b61a88c4a1a0","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":328},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P20":[{"id":"Q3784220$A7563BBC-8FE1-41E1-B2F0-384C28A2CEFF","mainsnak":{"snaktype":"value","property":"P20","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":2195766},"type":"wikibase-entityid"}},"type":"statement","rank":"normal","references":[{"hash":"7eb64cf9621d34c54fd4bd040ed4b61a88c4a1a0","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":328},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P570":[{"id":"Q3784220$57C383D1-6936-4DB3-A920-38EBF90344A0","mainsnak":{"snaktype":"value","property":"P570","datatype":"time","datavalue":{"value":{"time":"+00000001955-09-13T00:00:00Z","timezone":0,"before":0,"after":0,"precision":11,"calendarmodel":"http://www.wikidata.org/entity/Q1985727"},"type":"time"}},"type":"statement","rank":"normal","references":[{"hash":"7eb64cf9621d34c54fd4bd040ed4b61a88c4a1a0","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":328},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P569":[{"id":"Q3784220$4FFA323F-9D0F-4F6D-8076-15DFCBE2BFCB","mainsnak":{"snaktype":"value","property":"P569","datatype":"time","datavalue":{"value":{"time":"+00000001876-11-13T00:00:00Z","timezone":0,"before":0,"after":0,"precision":11,"calendarmodel":"http://www.wikidata.org/entity/Q1985727"},"type":"time"}},"type":"statement","rank":"normal","references":[{"hash":"7eb64cf9621d34c54fd4bd040ed4b61a88c4a1a0","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":328},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P735":[{"id":"Q3784220$22758370-00AA-4378-BA0F-384CF1CC0480","mainsnak":{"snaktype":"value","property":"P735","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":564684},"type":"wikibase-entityid"}},"type":"statement","rank":"normal","references":[{"hash":"50f57a3dbac4708ce4ae4a827c0afac7fcdb4a5c","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":11920},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}],"P27":[{"id":"Q3784220$8EC66D5F-07EE-4951-86D7-A508E777C733","mainsnak":{"snaktype":"value","property":"P27","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":30},"type":"wikibase-entityid"}},"type":"statement","rank":"normal","references":[{"hash":"50f57a3dbac4708ce4ae4a827c0afac7fcdb4a5c","snaks":{"P143":[{"snaktype":"value","property":"P143","datatype":"wikibase-item","datavalue":{"value":{"entity-type":"item","numeric-id":11920},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]}]}]},"description":"American women\'s suffrage activist"}' ),
		suggestions = JSON.parse( '{"occupations":{"id":"P106","name":"occupations","list":["Q285759"]},"nationalities":{"id":"P27","name":"nationality","list":[]},"schools":{"id":"P69","name":"schools","list":[]}}' ),
		labels = {
			Q285759: 'insurance broker'
		},
		pageTitle = 'Some guy';

	/**
	 * Debug the wikigrok dialogs by showing it in screen
	 * active when debug=true in location
	 */
	function debugDialog() {
		if (
			mw.mobileFrontend.query &&
			Boolean( mw.mobileFrontend.query.debug ) === true
		) {
			this.wk.remove = function () {};
			this.wk.prependTo( '#content' ).show();
		}
	}

	QUnit.module( 'MobileFrontend: WikiGrokDialogB', {
		teardown: function () {
			this.wk.remove();
		},
		setup: function () {
			this.sandbox.stub( WikiDataApi.prototype, 'getClaims' )
				.returns( $.Deferred().resolve( claims ) );
			this.sandbox.stub( WikiGrokSuggestionApi.prototype, 'getSuggestions' )
				.returns( $.Deferred().resolve( suggestions ) );
			// don't run eventLogging
			this.sandbox.stub( WikiGrokDialogB.prototype, 'log' );
			this.sandbox.stub( WikiGrokDialogB.prototype, 'logError' );
			this.sandbox.stub( WikiDataApi.prototype, 'getLabels' )
				.returns( $.Deferred().resolve( labels ) );
			this.sandbox.stub( WikiGrokResponseApi.prototype, 'recordClaims' )
				.returns( $.Deferred().resolve() );
			this.$el = $( '<div id="test">' );
			this.wk = new WikiGrokDialogB( {
				el: this.$el,
				itemId: '1234',
				title: pageTitle,
				userToken: 'token',
				testing: false,
				// Set suggestions to go to the second screen.
				suggestions: suggestions
			} );
			debugDialog.apply( this );
		}
	} );

	QUnit.test( '#UI renders initial screen', 3, function ( assert ) {
		// Lets check that we've got the info, buttons and 'Tell me more'
		assert.ok( this.$el.find( '.wg-content' ).text().length > 0 );
		assert.strictEqual( this.$el.find( '.wg-buttons button' ).length, 2 );
		assert.ok( this.$el.find( '.wg-notice>a' ).attr( 'href' ).length > 0 );
	} );

	QUnit.test( '#UI clicking no thanks hides the dialog', 1, function ( assert ) {
		var spy = this.sandbox.stub( WikiGrokDialogB.prototype, 'hide' );
		this.$el.find( '.cancel' ).trigger( 'click' );
		assert.ok( spy.called );
	} );

	QUnit.asyncTest( '#UI clicking OK, takes you to the question dialog', function ( assert ) {
		QUnit.expect( 4 );
		this.wk.$el.find( '.proceed' ).trigger( 'click' );
		// The name of the page is on the question
		assert.ok( this.wk.$el.text().indexOf( pageTitle ) !== -1 );
		// After loading
		setTimeout( $.proxy( function () {
			// The question is there
			var tags = this.wk.$el.find( '.tags .ui-tag-button' ),
				labels = tags.find( 'label' );
			assert.strictEqual( tags.length, 1 );
			assert.strictEqual( labels.first().text(), 'Profession' );
			assert.strictEqual( labels.last().text(), 'insurance broker' );
			QUnit.start();
		}, this ), 0 );
	} );

	QUnit.asyncTest( '#UI - Question - Answer correct', function ( assert ) {
		QUnit.expect( 1 );
		this.wk.$el.find( '.proceed' ).trigger( 'click' );
		this.$el.find( '.ui-tag-button' ).trigger( 'click' );
		this.$el.find( '.save' ).trigger( 'click' );

		setTimeout( $.proxy( function () {
			// I'm in thanks page now!
			assert.notEqual( this.$el.find( '.wg-link' ).css( 'display' ), 'none' );
			QUnit.start();
		}, this ), 0 );
	} );

	QUnit.asyncTest( '#UI - Question - Answer incorrect', function ( assert ) {
		QUnit.expect( 1 );
		this.wk.$el.find( '.proceed' ).trigger( 'click' );
		this.$el.find( '.save' ).trigger( 'click' );

		setTimeout( $.proxy( function () {
			// I'm in thanks page now!
			assert.notEqual( this.$el.find( '.wg-link' ).css( 'display' ), 'none' );
			QUnit.start();
		}, this ), 0 );
	} );

	QUnit.module( 'MobileFrontend: WikiGrokDialogB', {
		setup: function () {
			var noSuggestionResponse = $.Deferred().resolve( {
				suggestions: {
					occupations: {
						id: 'P106', list: []
					},
					nationalities: {
						id: 'P27', list: []
					}
				}
			} );

			this.$el = $( '<div id="test">' );
			this.wk = new WikiGrokDialogB( {
				el: this.$el,
				itemId: '1234',
				title: pageTitle,
				userToken: 'token',
				testing: false,
				// Set suggestions to go to the second screen.
				suggestions: suggestions
			} );
			// don't run eventLogging
			this.sandbox.stub( WikiDataApi.prototype, 'getClaims' )
				.returns( $.Deferred().resolve( { isHuman: true } ) );
			this.logError = this.sandbox.stub( WikiGrokDialogB.prototype, 'logError' );
			this.sandbox.stub( WikiGrokSuggestionApi.prototype, 'getSuggestions' )
				.returns( noSuggestionResponse );
		}
	} );

	QUnit.test( '#UI should not display when there are no suggestions', 2, function ( assert ) {
		var spy = this.sandbox.stub( WikiGrokDialogB.prototype, 'show' );
		this.wk.reveal( {} );
		assert.ok( spy.notCalled, 'We do not call if the response provides no suggestions.' );
		assert.ok( this.logError.called, 'Make sure we log an error.' );
	} );

}( jQuery, mw.mobileFrontend ) );
