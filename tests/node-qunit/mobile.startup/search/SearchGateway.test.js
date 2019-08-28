var
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	mediaWiki = require( '../../utils/mw' ),
	oo = require( '../../utils/oo' ),
	SearchGateway,
	sandbox,
	sinon = require( 'sinon' ),
	util = require( '../../../../src/mobile.startup/util' );

QUnit.module( 'MobileFrontend: SearchGateway',
	{
		beforeEach: function () {
			sandbox = sinon.sandbox.create();
			dom.setUp( sandbox, global );
			jQuery.setUp( sandbox, global );
			oo.setUp( sandbox, global );

			// Additional CtaDrawer global dependency.
			mediaWiki.setUp( sandbox, global );

			SearchGateway = require( '../../../../src/mobile.startup/search/SearchGateway' );

			sandbox.stub( mw.util, 'getUrl' ).returns( 'Title' );
			sandbox.stub( mw.config, 'get' ).callsFake( function ( name ) {
				switch ( name ) {
					case 'wgMFDisplayWikibaseDescriptions': return { search: '' };
					case 'wgMFSearchGenerator': return { prefix: '' };
				}
			} );

			this.gateway = new SearchGateway( new mw.Api() );
			sandbox.stub( this.gateway.api, 'get' ).callsFake( function () {
				return util.Deferred().resolve( {
					warnings: {
						query: {
							'*': 'Formatting of continuation data will be changing soon. To continue using the current formatting, use the "rawcontinue" parameter. To begin using the new format, pass an empty string for "continue" in the initial query.'
						}
					},
					query: {
						pages: {
							2: {
								index: 1,
								pageid: 2,
								ns: 0,
								title: 'Claude Monet',
								thumbnail: {
									source: 'http://127.0.0.1:8080/images/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/80px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg',
									width: 80,
									height: 62
								}
							},
							60: {
								index: 2,
								pageid: 60,
								ns: 0,
								title: 'Barack Obama',
								thumbnail: {
									source: 'http://127.0.0.1:8080/images/thumb/8/8d/President_Barack_Obama.jpg/64px-President_Barack_Obama.jpg',
									width: 64,
									height: 80
								}
							}
						}
					}
				} );
			} );
		},

		afterEach: function () {
			SearchGateway = undefined;
			jQuery.tearDown();
			sandbox.restore();
		}
	},
	function () {
		QUnit.test( '._highlightSearchTerm', function ( assert ) {
			var data,
				gateway = this.gateway;

			data = [
				[ 'Hello World', 'Hel', '<strong>Hel</strong>lo World' ],
				[ 'Hello kitty', 'el', 'Hello kitty' ], // not at start
				[ 'Hello worl', 'hel', '<strong>Hel</strong>lo worl' ],
				[ 'Belle & Sebastian', 'Belle & S', '<strong>Belle &amp; S</strong>ebastian' ],
				[ 'Belle & the Beast', 'Belle &amp;', 'Belle &amp; the Beast' ],
				[ 'with ? in it', 'with ?', '<strong>with ?</strong> in it' ], // not at start
				[ 'Title with ? in it', 'with ?', 'Title with ? in it' ], // not at start
				[ 'AT&T', 'a', '<strong>A</strong>T&amp;T' ],
				[ 'AT&T', 'at&', '<strong>AT&amp;</strong>T' ],
				[ '<tag', '&lt;tag', '&lt;tag' ],
				[ '& this is a weird title', '&', '<strong>&amp;</strong> this is a weird title' ],
				[ '& this is a weird title', '&a', '&amp; this is a weird title' ],
				[ '&lt;t', '<t', '&amp;lt;t' ],
				[ '<script>alert("FAIL")</script> should be safe',
					'<script>alert("FAIL"', '<strong>&lt;script&gt;alert("FAIL"</strong>)&lt;/script&gt; should be safe' ]
			];
			data.forEach( function ( item, i ) {
				assert.strictEqual( gateway._highlightSearchTerm( item[ 0 ], item[ 1 ] ), item[ 2 ], 'highlightSearchTerm test ' + i );
			} );
		} );

		QUnit.test( 'show redirect targets', function ( assert ) {
			return this.gateway.search( 'barack' ).then( function ( response ) {
				assert.strictEqual( response.query, 'barack' );
				assert.strictEqual( response.results.length, 2 );
				assert.strictEqual( response.results[ 0 ].displayTitle, 'Claude Monet' );
				assert.strictEqual( response.results[ 0 ].thumbnail.width, 80 );
				assert.strictEqual( response.results[ 1 ].displayTitle, '<strong>Barack</strong> Obama' );
				assert.strictEqual( response.results[ 1 ].title, 'Barack Obama' );
			} );
		} );

		QUnit.module( 'MobileFrontend SearchGateway (Wikidata Descriptions)', {
			beforeEach: function () {
				var data = {
					query: {
						pages: {
							2: {
								pageid: 2,
								ns: 0,
								title: 'Brad Pitt',
								index: 2,
								description: 'American actor'
							},
							4: {
								pageid: 4,
								ns: 0,
								title: 'Bradley Cooper',
								index: 3,
								description: 'American actor and film producer'
							},
							5: {
								pageid: 5,
								ns: 0,
								title: 'Braddy',
								index: 1
							}
						}
					}
				};
				sandbox.stub( mw.Api.prototype, 'get' ).returns( util.Deferred().resolve( data ) );
			}
		} );

		QUnit.test( 'Wikidata Description in search results', function ( assert ) {
			var searchApi = new SearchGateway( new mw.Api() );
			return searchApi.search( 'brad' ).then( function ( resp ) {
				var results = resp.results;
				assert.strictEqual(
					results[0].wikidataDescription,
					undefined,
					'Braddy does not have a Wikidata description.'
				);
				assert.strictEqual(
					results[1].wikidataDescription,
					'American actor',
					'Yes, Brad Pitt is an actor.'
				);
				assert.strictEqual(
					results[2].wikidataDescription,
					'American actor and film producer',
					'Yes, Cooper is an actor.'
				);
			} );
		} );
	} );
