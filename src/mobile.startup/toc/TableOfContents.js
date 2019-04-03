var View = require( '../View' ),
	mfExtend = require( '../mfExtend' ),
	util = require( '../util' ),
	Icon = require( '../Icon' );

/**
 * View for table of contents
 * @class TableOfContents
 * @extends View
 * @uses Icon
 * @param {Object} props
 * @param {Section[]} props.sections
 */
function TableOfContents( props ) {
	View.call( this, util.extend( {
		className: 'toc-mobile',
		contentsMsg: mw.msg( 'toc' )
	}, props ) );
}

mfExtend( TableOfContents, View, {
	/**
	 * @memberof TableOfContents
	 * @instance
	 */
	templatePartials: {
		tocHeading: util.template( `
<li>
	<a href="#{{anchor}}">{{{line}}}</a>
	<ul>
		{{#subsections}}
		{{>tocHeading}}
		{{/subsections}}
	</ul>
</li>
		` )
	},
	/**
	 * @memberof TableOfContents
	 * @instance
	 */
	template: util.template( `
<h2><span>{{contentsMsg}}</span></h2>
<div>
	<ul>
	{{#sections}}
	{{>tocHeading}}
	{{/sections}}
	</ul>
</div>
<div style="clear:both;"></div>
	` ),
	/** @inheritdoc */
	postRender: function () {
		new Icon( {
			name: 'toc',
			additionalClassNames: 'toc-button'
		} ).$el.prependTo( this.$el.find( 'h2' ) );
	}
} );

module.exports = TableOfContents;
