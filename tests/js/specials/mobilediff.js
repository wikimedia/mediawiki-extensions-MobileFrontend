( function( M, $ ) {

var m = M.require( 'diff' );

module( 'MobileFrontend: mobilediff.js', {} );

test( 'makePrettyDiff', function() {
	var testCases = [
		[ $( '<div><del>foo</del></div>' ), '<del>foo</del><br>' ],
		[
			$( '<div><del>Remove the one please</del><ins>Remove the please</ins></div>' ),
			'<span>Remove the </span><del>one </del><span>please</span><br>'
		],
		[
			$( '<div id="mw-mf-minidiff"><del>According to popular legend, the \'\'\'Shanghai Tunnels,\'\'\' less commonly known as the \'\'\'Portland Underground,\'\'\' are supposedly a group of passages running underneath [[Old Town Chinatown, Portland, Oregon|Old Town/Chinatown]] down to the central downtown section of [[Portland, Oregon|Portland]], [[Oregon]], [[United States]]. The tunnels connected the [[basement]]s of many downtown [[hotel]]s and [[bar (establishment)|bar]]s to the waterfront of the [[Willamette River]]. They were built to move goods from the ships docked on the Willamette to the basement storage areas, which allowed businesses to avoid streetcar and train traffic on the streets when delivering their goods.{{fact|date=March 2012}}</del><ins>According to popular legend, the \'\'\'Shanghai Tunnels,\'\'\' less commonly known as the \'\'\'Portland Underground,\'\'\' are a group of passages running underneath [[Old Town Chinatown, Portland, Oregon|Old Town/Chinatown]] down to the central downtown section of [[Portland, Oregon|Portland]], [[Oregon]], [[United States]]. The tunnels connected the [[basement]]s of many downtown [[hotel]]s and [[bar (establishment)|bar]]s to the waterfront of the [[Willamette River]]. They were built to move goods from the ships docked on the Willamette to the basement storage areas, which allowed businesses to avoid streetcar and train traffic on the streets when delivering their goods.{{fact|date=March 2012}}</ins></div>' ),
			'<span>According to popular legend, the \'\'\'Shanghai Tunnels,\'\'\' less commonly known as the \'\'\'Portland Underground,\'\'\' are </span><del>supposedly </del><span>a group of passages running underneath [[Old Town Chinatown, Portland, Oregon|Old Town/Chinatown]] down to the central downtown section of [[Portland, Oregon|Portland]], [[Oregon]], [[United States]]. The tunnels connected the [[basement]]s of many downtown [[hotel]]s and [[bar (establishment)|bar]]s to the waterfront of the [[Willamette River]]. They were built to move goods from the ships docked on the Willamette to the basement storage areas, which allowed businesses to avoid streetcar and train traffic on the streets when delivering their goods.{{fact|date=March 2012}}</span><br>'
		],
		[
			$( '<div id="mw-mf-minidiff"><del>A total of 40 consulates-generals and 24 honorary consulates have offices in the San Francisco Bay Area.</del><ins>A total of 41 consulates-generals and 24 honorary consulates have offices in the San Francisco Bay Area.</ins></div>' ),
			'<span>A total of 4</span><ins>1</ins><del>0</del><span> consulates-generals and 24 honorary consulates have offices in the San Francisco Bay Area.</span><br>'
		],
		[
			$( '<div id="mw-mf-minidiff"><del></del><del>== Fliberty gibbit ==</del><del>Foobar!</del></div>' ),
			'<del></del><br><del>== Fliberty gibbit ==</del><br><del>Foobar!</del><br>'
		]
	];

	$.each( testCases, function( i, test ) {
		strictEqual( m.makePrettyDiff( test[0] ).html(), test[1], 'Test case ' + i );
	} );
} );

} )( mw.mobileFrontend, jQuery );
