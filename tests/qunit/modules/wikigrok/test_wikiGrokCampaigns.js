( function ( $, M, mw ) {

	var wikiGrokCampaigns = M.require( 'modules/wikigrok/wikiGrokCampaigns'),
		campaigns = {
			author: {
				property: "P106",
				questions: {
					Q482980: "author"
				},
				propertyId: "P106",
				propertyName: "occupation"
			},
			actor: {
				property: "P106",
				questions: {
					Q10798782: "television actor",
					Q10800557: "film actor"
				},
				propertyId: "P106",
				propertyName: "occupation"
			},
			album: {
				property: "P31",
				questions: {
					Q208569: "studio album",
					Q209939: "live album"
				},
				propertyId: "P31",
				propertyName: "instance of"
			}
		};
		// this can be used in new tests
		//suggestions = {
		//	author: {
		//		id: 'P106',
		//		list: ['Q482980'],
		//		name: 'author'
		//	},
		//	actor: {
		//		id: 'P106',
		//		list: ['Q10798782', 'Q10800557'],
		//		name: 'actor'
		//	},
		//	album: {
		//		id: 'P31',
		//		list: ['Q208569', 'Q209939'],
		//		name: 'album'
		//	}
		//};

	QUnit.module( 'MobileFrontend: WikiGrokCampaigns', {
		teardown: function () {
		},
		setup: function () {
		}
	} );

	QUnit.test( 'campaigns', 16, function ( assert ) {
		var campaign,
			_campaign,
			allSuggestions;

		assert.equal( wikiGrokCampaigns.getRandomCampaign(), null, 'no campaigns');

		this.sandbox.stub( mw.config, 'get').withArgs( 'wgWikiGrokCampaigns' )
			.returns( campaigns );

		campaign = wikiGrokCampaigns.getRandomCampaign();
		assert.equal( typeof campaign.name, 'string', 'campaign name exists' );
		assert.equal( typeof campaign.questions, 'object', 'questions exist' );
		assert.equal( typeof campaign.randomClaimId, 'string', 'randomClaimId exist' );

		allSuggestions = wikiGrokCampaigns.getAllSuggestions();
		assert.equal( typeof allSuggestions, 'object', 'suggestions exist' );
		// 5 = number of questions from campaigns above
		assert.equal( allSuggestions.length, 5, 'the number of suggestions is correct' );
		// test each question (5 * 2 = 10 tests in inside)
		$.each( allSuggestions, function (i, suggestion) {
			_campaign = campaigns[suggestion.campaign.name];
			assert.ok( suggestion.id in _campaign.questions, 'Generated suggestion ID is correct' );
			assert.equal( suggestion.label, _campaign.questions[suggestion.id],
				'Generated suggestion label is correct' );
		} );
	} );

}( jQuery, mw.mobileFrontend, mw ) );
