( function ( M, $ ) {

var Page = M.require( 'page' ),
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

}( mw.mobileFrontend, jQuery ) );


