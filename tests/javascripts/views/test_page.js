( function ( M, $ ) {

var Page = M.require( 'page' ),
	$container = $( '<div>' ),
	nonStandardPage = [{"id":0,"text":""},{"level":"1","line":"Test heading h1","anchor":"Test_heading_h1","id":1,"text":"<p>another h1?git fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEADgit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEAD\ngit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEAD\ngit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEAD\nv\nv\nv\nvgit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEADgit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEAD\ngit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEADgit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEADgit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEAD\nvgit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEAD\ngit fetch ssh:\/\/user@gerrit.wikimedia.org:29418\/mediawiki\/extensions\/MobileFrontend refs\/changes\/39\/54139\/8 &amp;&amp; git checkout FETCH_HEAD\n<\/p>"},{"level":"2","line":"Test heading h2 (1)","anchor":"Test_heading_h2_.281.29","id":2,"text":"<p>1: You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. You're on your own. And you know what you know. And YOU are the one who'll decide where to go...\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?\n<\/p>"},{"level":"2","line":"Test heading h2 2)","anchor":"Test_heading_h2_2.29","id":3,"text":"<p>2: You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. You're on your own. And you know what you know. And YOU are the one who'll decide where to go...\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?\n<\/p>"},{"level":"2","line":"Test heading h2 (3)","anchor":"Test_heading_h2_.283.29","id":4,"text":"<p>3: You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. You're on your own. And you know what you know. And YOU are the one who'll decide where to go...\n<\/p>"}],
	referenceSections = [
		{
			"id": 0,
			"text": "lead section"
		},
		{
			"level": "2",
			"line": "References",
			"anchor": "References",
			"id": 1,
			"references": '',
			"text": "1"
		},
		{
			"level": "3",
			"line": "B",
			"anchor": "B",
			"id": 2,
			"text": "2"
		}
	],
	apiSections =
		[ {
			"id": 0,
			"text": "lead section"
		},
		{
			"level": "2",
			"line": "A",
			"anchor": "A",
			"id": 1,
			"text": "<p>a</p>"
		},
		{
			"level": "3",
			"line": "B",
			"anchor": "B",
			"id": 2,
			"text": "<p>b<\/p>"
		},
		{
			"level": "3",
			"line": "C",
			"id": 3,
			"text": "<p>c<\/p>"
		},
		{
			"level": "4",
			"line": "D",
			"anchor": 'DifferentAnchor',
			"id": 4,
			"text": "<div>d<\/div>"
		},
		{
			"level": "2",
			"line": "F",
			"id": 5,
			"text": "<p>f<\/p>"
		} ];

QUnit.module( 'MobileFrontend: page.js', {} );

QUnit.test( 'Page', 9, function() {
	var p = new Page( { sections: apiSections } ),
		sections = p.getSubSections();

	strictEqual( p.lead, 'lead section', 'lead section set' );
	strictEqual( sections.length, 2, '2 sub sections found' );
	strictEqual( sections[ 0 ].heading, 'A' );
	strictEqual( sections[ 0 ].content,
		'<p>a</p><h3 id="B">B</h3><p>b</p><h3>C</h3><p>c</p><h4 id="DifferentAnchor">D</h4><div>d</div>' );
	strictEqual( sections[ 1 ].heading, 'F' );
	strictEqual( sections[ 1 ].content, '<p>f</p>' );
	strictEqual( sections[ 1 ].hasReferences, false, 'Check not incorrectly marked as reference' );
	strictEqual( p.getSubSection( 5 ).heading, 'F', 'check correct sub section with id 5 found' );
	strictEqual( p.getSubSection( 1 ).heading, 'A', 'check correct sub section with id 1 found' );
} );

QUnit.test( 'NonStandardPage', 3, function() {
	var p = new Page( { sections: nonStandardPage } ),
		$lead = $( '<div>' ).html( p.lead );
	strictEqual( $lead.find( 'h1' ).length, 1, 'The h1 is thrown into the lead section' );
	strictEqual( $lead.find( 'h1' ).text(), 'Test heading h1', 'Check text of h1' );
	strictEqual( p.getSubSections().length, 3, 'There are 3 h2s inside the content' );
} );


QUnit.test( 'getSectionFromAnchor', 5, function() {
	var p = new Page( { sections: apiSections } );
	strictEqual( p.getSectionFromAnchor( 'section_1' ).heading, 'A', 'Check anchor is saved for actual section' );
	strictEqual( p.getSectionFromAnchor( 'A' ).heading, 'A', 'Finds correct parent section (same section)' );
	strictEqual( p.getSectionFromAnchor( 'B' ).heading, 'A', 'Finds correct parent section' );
	strictEqual( p.getSectionFromAnchor( 'DifferentAnchor' ).heading, 'A', 'Finds correct parent section' );
	strictEqual( typeof p.getSectionFromAnchor( 'NonExistantSection' ), 'undefined', 'Returns nothing if non-existant' );
} );

QUnit.test( 'getReferences', 3, function() {
	var p = new Page( { sections: referenceSections } ),
		sections = p.getSubSections();
	strictEqual( sections.length, 1, 'Check references are recorded as a section' );
	strictEqual( sections[ 0 ].hasReferences, true, 'Check it is flagged as being loaded so as not to interfere with toggle-dynamic' );
	strictEqual( sections[ 0 ].content, '1<h3 id="B">B</h3>2', 'Check references html set to content' );
} );

QUnit.module( 'MobileFrontend: page.js (retrieve from api)', {
	setup: function() {
		var
			pageLeadOnly = $.Deferred().resolve( {
				isMainPage: false,
				title: 'John Smith (Explorer)',
				sections: [
					{
						id: 0,
						text: 'Lead section'
					}
				]
			} ),
			pageLong = $.Deferred().resolve( {
				title: 'San Francisco',
				sections: [
					{
						id: 0,
						text: '<p>Lead section</p>'
					},
					{
						id: 1,
						level: '2',
						line: 'History',
						text: '<p>History section</p>'
					},
					{
						id: 2,
						level: '2',
						line: 'Geography',
						text: '<p>Geography section</p>'
					},
					{
						id: 3,
						level: '3',
						line: 'Climate',
						text: '<p>Climate section</p>'
					},
					{
						id: 4,
						level: '2',
						line: 'Cityscape',
						text: '<p>Cityscape section</p>'
					}
				]
			} ),
			languageMap = {
				en: 'English',
				fr: 'French',
				it: 'Italian'
			},
			languages = $.Deferred().resolve( languageMap ),
			noPageLanguages = $.Deferred().resolve( [] ),
			sanFranciscoLanguages = $.Deferred().resolve( [
				{ lang: 'fr', langname: 'French', url: 'http://fr.wikipedia.org', '*': 'bonjour' },
				{ lang: 'it', langname: 'Italian', url: 'http://it.wikipedia.org', '*': 'ciao' },
				{ lang: 'es', langname: 'Spanish', url: 'http://es.wikipedia.org', '*': 'hola' }
			] ),
			retrievePageStub = sinon.stub( M.history, 'retrievePage' ),
			retrieveAllLanguagesStub = sinon.stub( M.history, 'retrieveAllLanguages' ),
			retrievePageLanguagesStub = sinon.stub( M.history, 'retrievePageLanguages' );

		retrievePageStub.withArgs( 'John Smith' ).returns( pageLeadOnly );
		retrievePageStub.withArgs( 'San Francisco' ).returns( pageLong );
		retrieveAllLanguagesStub.returns( languages );
		retrievePageLanguagesStub.withArgs( 'San Francisco', languageMap ).returns( sanFranciscoLanguages );
		retrievePageLanguagesStub.withArgs( 'John Smith', languageMap ).returns( noPageLanguages );
	},
	teardown: function() {
		$container.empty();
		M.history.retrievePage.restore();
		M.history.retrieveAllLanguages.restore();
		M.history.retrievePageLanguages.restore();
	}
} );

QUnit.test( 'render page from api (lead only)', 4, function() {
	var page = new Page( { title: 'John Smith', el: $container } );

	strictEqual( page.options.isMainPage, false, 'Is not main page' );
	strictEqual( $container.find( 'h1' ).text(), 'John Smith (Explorer)', 'The page title can be different from the passed argument' );
	strictEqual( $container.find( '#content_0' ).text(), 'Lead section' );
	strictEqual( $container.find( '.section' ).last().find( 'li' ).length, 0, 'No languages' );
} );

QUnit.test( 'render page from api (multiple sections)', 21, function() {
	var $langs, $content;
	new Page( { title: 'San Francisco', el: $container } );
	strictEqual( $container.find( 'h1' ).text(), 'San Francisco', 'Check page title' );
	strictEqual( $container.find( 'h2' ).length, 4, '4 h2 present' );
	strictEqual( $container.find( 'h2' ).last().text(), mw.msg( 'mobile-frontend-language-article-heading' ), 'Language heading is the last' );
	strictEqual( $container.find( 'h3' ).length, 0, 'No h3 present due to lazy loading' );
	strictEqual( $container.find( '#content_0' ).find( 'p' ).text(), 'Lead section' );
	strictEqual( $.trim( $container.find( 'h2#section_1' ).text() ), 'History' );
	$content = $container.find( '#content_1' ).data( 'content' );
	strictEqual( $( '<div>' ).html( $content ).text(), 'History section' );
	strictEqual( $.trim( $container.find( 'h2#section_2' ).text() ), 'Geography' );
	$content = $( '<div>' ).html( $container.find( '#content_2' ).data( 'content' ) );
	strictEqual( $content.find( 'h3' ).length, 1, 'h3 is present but not loaded into DOM yet' );
	strictEqual( $content.find( 'p' ).length, 2, '1 for Geography and 1 for climate' );
	$content = $container.find( '#content_2' ).data( 'content' );
	strictEqual( $( '<div>' ).html( $content ).find( 'h3' ).text(), 'Climate' );
	$content = $( '<div>' ).html( $container.find( '#content_3' ).data( 'content' ) );
	strictEqual( $content.find( 'p' ).text(), 'Cityscape section' );
	// languages
	$langs = $container.find( '.section' ).last().find( 'li' );
	strictEqual( $langs.length, 3, '3 languages printed in list' );
	strictEqual( $langs.eq( 0 ).find( 'a' ).attr( 'title' ), 'bonjour' );
	strictEqual( $langs.eq( 1 ).find( 'a' ).attr( 'title' ), 'ciao' );
	strictEqual( $langs.eq( 2 ).find( 'a' ).attr( 'title' ), 'hola' );
	strictEqual( $langs.eq( 0 ).find( 'a' ).text(), 'French' );
	strictEqual( $langs.eq( 1 ).find( 'a' ).text(), 'Italian' );
	strictEqual( $langs.eq( 2 ).find( 'a' ).text(), 'Spanish' );
	strictEqual( $langs.eq( 0 ).find( 'a' ).attr( 'href' ), 'http://fr.wikipedia.org' );
	strictEqual( $langs.eq( 0 ).find( 'a' ).attr( 'lang' ), 'fr' );
} );

}( mw.mobileFrontend, jQuery ) );


