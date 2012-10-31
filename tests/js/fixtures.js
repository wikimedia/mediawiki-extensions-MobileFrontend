var mwMobileFrontendConfig = {
	messages: {
		showText: "show",
		hideText: "hide"
	},
	settings: {
		authenticated: true,
		scriptPath: "/"
	}
};

function _mwLogEvent() {}

window.MobileFrontendTests = {
	createFixtures: function () {
		$( '<div id="qunit-fixture-x">' ).html( [
			'<div id="test-env">',
			'	<div id="mw-mf-header">',
			'	<div id="mw-mf-searchForm">',
			'	<img id="mw-mf-logo" src="" alt="logo">',
			'	<div id="nav" style="display:none">',
			'		navigation menu',
			'		<select id="languageselection">',
			'			<option value="en">english</option>',
			'			<option value="de">deutsch</option>',
			'		</select>',
			'	</div>',
			'	</div>',
			'	</div>',
			'	<div id="zero-rated-banner">',
			'		banner',
			'		<a href="#" id="dismiss-notification">dismiss banner</button>',
			'	</div>',
			'	<div id="sq">',
			'	<input type="text" id="mw-mf-search">',
			'	</div>',
			'	<button id="mw-mf-clearsearch" title="Clear">clear</button>',
			'	<div id="results">search results here</div>',
			'	<div id="content_wrapper">',
			'	<div id="content">',
			'		<h2 class="section_heading" id="section_1">',
			'			<span id="First_Section">First Section</span>',
			'		</h2>',
			'		<div class="content_block" id="content_1" style="display:none">',
			'			<p>',
			'			Text',
			'			<span id="First_Section_2">2.1</span>',
			'			</p>',
			'		</div>',
			'		<div id="anchor_1" class="section_anchors" style="display:none">',
			'			<a href="#section_1" class="back_to_top">&#8593;Jump back a section</a>',
			'		</div>',
			'		<h2 class="section_heading" id="section_2">',
			'			<span id="Second_Section">Second Section</span>',
			'		</h2>',
			'		<div class="content_block" id="content_2"  style="display:none"><p>Text with a <a href="#First_Section">section 1</a> link! and to <a href="#First_Section_2">section 1.2</a></p></div>',
			'	</div>',
			'	</div>',
			'<div id="mfe-test-classes" class="test hello-world goodbye camelCase">for testing classes</div>',
			'</div>',
		].join( "" ) ).appendTo( "#qunit-fixture" );
	},
	triggerEvent: function ( el, eventName ) {
		// NOTE: this will not work on legacy browsers
		var ev = document.createEvent( "HTMLEvents" );
		ev.initEvent( eventName, true, true );
		el.dispatchEvent( ev );
	}
};

