( function ( $, M, mw ) {

	var wikiGrokCampaigns = M.require( 'modules/wikigrok/wikiGrokCampaigns'),
		campaigns = {
			author: {
				property: "P106",
				questions: {
					Q482980: "author"
				}
			},
			actor: {
				property: "P106",
				questions: {
					Q10798782: "television actor",
					Q10800557: "film actor"
				}
			},
			album: {
				property: "P31",
				questions: {
					Q208569: "studio album",
					Q209939: "live album"
				}
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

	QUnit.test( 'campaigns', 4, function ( assert ) {
		var campaign;

		assert.equal( wikiGrokCampaigns.getRandomCampaign(), null, 'no campaigns');

		this.sandbox.stub( mw.config, 'get').withArgs( 'wgWikiGrokCampaigns' )
			.returns( campaigns );

		campaign = wikiGrokCampaigns.getRandomCampaign();
		assert.equal( typeof campaign.name, 'string', 'campaign name exists' );
		assert.equal( typeof campaign.suggestions, 'object', 'suggestions exist' );
		assert.equal( typeof campaign.randomClaimId, 'string', 'random claim id exist' );
	} );

}( jQuery, mw.mobileFrontend, mw ) );
