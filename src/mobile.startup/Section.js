const util = require( './util.js' ),
	mfExtend = require( './mfExtend' ),
	View = require( './View' );

/**
 * Builds a section of a page
 *
 * @extends module:mobile.startup/View
 * @ignore
 * @param {Object} options Configuration options
 */
function Section( options ) {
	options.tag = 'h' + options.level;
	this.line = options.line;
	this.text = options.text;
	this.hasReferences = options.hasReferences || false;
	this.id = options.id || null;
	this.anchor = options.anchor;
	this.subsections = [];
	( options.subsections || [] ).forEach( ( section ) => this.subsections.push(
		new Section( section ) ) );
	View.call( this, options );
}

mfExtend( Section, View, {
	template: util.template( `
<h{{level}} id="{{anchor}}">{{{line}}}</h{{level}}>
{{{text}}}
	` ),
	/**
	 * @memberof Section
	 * @instance
	 * @mixes module:mobile.startup/View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.text Section text.
	 */
	defaults: {
		line: undefined,
		text: ''
	}
} );

module.exports = Section;
