const util = require( './util.js' ),
	View = require( './View' );

/**
 * Builds a section of a page
 */
class Section extends View {
	/**
	 * @param {Object} options Configuration options
	 */
	constructor( options ) {
		options.tag = 'h' + options.level;
		super( options );
		this.line = options.line;
		this.text = options.text;
		this.hasReferences = options.hasReferences || false;
		this.id = options.id || null;
		this.anchor = options.anchor;
		this.subsections = [];
		( options.subsections || [] ).forEach( ( section ) => this.subsections.push(
			new Section( section ) ) );
	}

	get template() {
		return util.template( `
<h{{level}} id="{{anchor}}">{{{line}}}</h{{level}}>
{{{text}}}
	` );
	}

	/**
	 * @mixes module:mobile.startup/View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.text Section text.
	 */
	get defaults() {
		return {
			line: undefined,
			text: ''
		};
	}
}

module.exports = Section;
