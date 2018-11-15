/* eslint-env es6 */
var page, page2, skinPage, referencesPage, lazyLoadedReferencesPage;

/**
 * Important..
 * Even though this page supports ES6, it is still compiled to ES5
 * friendly JavaScript.
 * It is thus imperative you do not use substitution in these templates
 * or any other ES6 functions.
 * It is expected to run in Special:JavaScript/qunit/test.
 * A linter will bark at you if you break this.
 */

page = `<div>
	<h1><span class="mw-headline" id="1.0">A1</span></h1>
	<h2><span class="mw-headline">A2.1</span></h2>
	<h2><span class="mw-headline">A2.2</span></h2>
	<h1><span class="mw-headline">A2</span></h1>
	<h2><span class="mw-headline">A2.1</span><span>[<a href="#">edit</a>]</span></h2>
	<h1>Not to be shown in the TOC<span class="placeholder"></span></h1>
</div>`;

page2 = `<div>
<h2><span class="mw-headline" id="1.0">A1</span></h2>
<h3><span class="mw-headline">A2.1</span></h3>
<h2><span class="mw-headline">A2.2</span></h2>
<h1><span class="mw-headline">A2</span></h1>
<h2><span class="mw-headline">A2.1</span></h2>
</div>`;

skinPage = `<div id="mw-content-text">
	<h2 class="section-heading collapsible-heading open-block">
		<span class="mw-headline" id="Notes_and_references">Notes and references</span>
	</h2>
	<div class="mf-section-2 collapsible-block open-block" data-is-reference-section="1">
		<p>Text</p>
		<a class="mf-lazy-references-placeholder"></a>
		<h3><span class="mw-headline" id="Notes">Notes</span></h3>
		<a class="mf-lazy-references-placeholder"></a>
		<h4 class="in-block"><span class="mw-headline" id="Refs">Refs</span></h4>
		<a class="mf-lazy-references-placeholder"></a>
		<p>no forget</p>
		<h5 class="in-block"><span class="mw-headline" id="More_refs">More refs</span></h5>
		<p>1</p>
		<a class="mf-lazy-references-placeholder"></a>
		<p>2</p>
		<a class="mf-lazy-references-placeholder"></a>
		<p>3</p>
	</div>
</div>`;

referencesPage = `<div id="mfe-test-references">
<sup id="cite_ref-1" class="reference">
	<a href="#cite_note-1">[1]</a>
</sup>
<p>
	sup with encoded href attribute
	<sup id="cite_ref-Obama_1995,_2004,_pp._9–10_11-0" class="reference">
		<a href="#cite_note-Obama_1995,_2004,_pp._9%E2%80%9310-11">[11]</a>
	</sup>
</p>
<ol class="references">
	<li id="cite_note-1">
		<span class="mw-cite-backlink">
			<a href="#cite_ref-1">↑</a>
		</span> <span class="reference-text">hello</span>
	</li>
	<li id="cite_note-Obama_1995,_2004,_pp._9–10-11">
		<span class="mw-cite-backlink">
			<a href="#cite_ref-1">↑</a>
		</span> <span class="reference-text">found</span>
	</li>
</ol>
</div>`;

lazyLoadedReferencesPage = `<div>
<h2><span class="mw-headline" id="1.0">A1</span></h1>
<div>text</div>
<h2>references</h2>
<div>
	<a class="mf-lazy-references-placeholder">View citations</a>
</div>
</div>`;

module.exports = {
	lazyLoadedReferencesPage: lazyLoadedReferencesPage,
	referencesPage: referencesPage,
	skinPage: skinPage,
	page: page,
	page2: page2
};
