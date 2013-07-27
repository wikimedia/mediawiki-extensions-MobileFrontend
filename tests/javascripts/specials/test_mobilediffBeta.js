( function( $, M ) {

var m = M.require( 'diff' );

QUnit.module( 'MobileFrontend: mobilediff.js' );

QUnit.test( 'makePrettyDiff', function() {
	var testCases = [
		[ $( '<div><del>foo</del></div>' ), '<del>foo</del>' ],
		[
			$( '<div><del>Remove the one please</del><ins>Remove the please</ins></div>' ),
			'<span>Remove the </span><del>one </del><span>please</span>'
		],
		[
			$( '<div><del>Here we go.</del><ins>Here we go. Ha!</ins></div>' ),
			'<span>Here we go.</span><ins> Ha!</ins>'
		],
		[
			$( '<div><ins>Added text</ins><ins>Blah, bloh, foo and bleh [[linkchange]]</ins><del>Blah, bloh and bleh [[link]]</del><ins>more text</ins></div>' ),
			'<ins>Added text</ins><br><span>Blah, bloh</span><ins>,</ins><span> </span><ins>foo </ins><span>and bleh [[</span><ins>linkchange</ins><del>link</del><span>]]</span><br><ins>more text</ins>'
		],
		[
			$( '<div id="mw-mf-minidiff"><del>According to popular legend, the \'\'\'Shanghai Tunnels,\'\'\' less commonly known as the \'\'\'Portland Underground,\'\'\' are supposedly a group of passages running underneath [[Old Town Chinatown, Portland, Oregon|Old Town/Chinatown]] down to the central downtown section of [[Portland, Oregon|Portland]], [[Oregon]], [[United States]]. The tunnels connected the [[basement]]s of many downtown [[hotel]]s and [[bar (establishment)|bar]]s to the waterfront of the [[Willamette River]]. They were built to move goods from the ships docked on the Willamette to the basement storage areas, which allowed businesses to avoid streetcar and train traffic on the streets when delivering their goods.{{fact|date=March 2012}}</del><ins>According to popular legend, the \'\'\'Shanghai Tunnels,\'\'\' less commonly known as the \'\'\'Portland Underground,\'\'\' are a group of passages running underneath [[Old Town Chinatown, Portland, Oregon|Old Town/Chinatown]] down to the central downtown section of [[Portland, Oregon|Portland]], [[Oregon]], [[United States]]. The tunnels connected the [[basement]]s of many downtown [[hotel]]s and [[bar (establishment)|bar]]s to the waterfront of the [[Willamette River]]. They were built to move goods from the ships docked on the Willamette to the basement storage areas, which allowed businesses to avoid streetcar and train traffic on the streets when delivering their goods.{{fact|date=March 2012}}</ins></div>' ),
			'<span>According to popular legend, the \'\'\'Shanghai Tunnels,\'\'\' less commonly known as the \'\'\'Portland Underground,\'\'\' are </span><del>supposedly </del><span>a group of passages running underneath [[Old Town Chinatown, Portland, Oregon|Old Town/Chinatown]] down to the central downtown section of [[Portland, Oregon|Portland]], [[Oregon]], [[United States]]. The tunnels connected the [[basement]]s of many downtown [[hotel]]s and [[bar (establishment)|bar]]s to the waterfront of the [[Willamette River]]. They were built to move goods from the ships docked on the Willamette to the basement storage areas, which allowed businesses to avoid streetcar and train traffic on the streets when delivering their goods.{{fact|date=March 2012}}</span>'
		],
		[
			$( '<div id="mw-mf-minidiff"><del>A total of 40 consulates-generals and 24 honorary consulates have offices in the San Francisco Bay Area.</del><ins>A total of 41 consulates-generals and 24 honorary consulates have offices in the San Francisco Bay Area.</ins></div>' ),
			'<span>A total of </span><ins>41</ins><del>40</del><span> consulates-generals and 24 honorary consulates have offices in the San Francisco Bay Area.</span>'
		],
		[
			$( '<div id="mw-mf-minidiff"><del></del><del>== Fliberty gibbit ==</del><del>Foobar!</del></div>' ),
			'<del>== Fliberty gibbit ==</del><br><del>Foobar!</del>'
		],
		[
			// no deletions
			$( '<div id="mw-mf-minidiff"><ins></ins><ins>French duo Daft Punk weren\'t named in the initial announcement, but added the festival to a list of shows on its official Vevo page on March 27. &lt;ref&gt;{{cite news| url= http://www.3news.co.nz/Daft-Punk-website-shows-Coachella-date/tabid/418/articleID/292127/Default.aspx|work=3 News NZ |title= Daft Punk website shows Coachella date| date=March 28, 2013}}&lt;/ref&gt;</ins></div></div>' ),
			'<ins>French duo Daft Punk weren\'t named in the initial announcement, but added the festival to a list of shows on its official Vevo page on March 27. &lt;ref&gt;{{cite news| url= http://www.3news.co.nz/Daft-Punk-website-shows-Coachella-date/tabid/418/articleID/292127/Default.aspx|work=3 News NZ |title= Daft Punk website shows Coachella date| date=March 28, 2013}}&lt;/ref&gt;</ins>'
		]
	];

	QUnit.expect( testCases.length );
	$.each( testCases, function( i, test ) {
		strictEqual( m.makePrettyDiff( test[0] ).html(), test[1], 'Test case ' + i );
	} );
} );

} )( jQuery, mw.mobileFrontend );
