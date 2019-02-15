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
		tocHeading: mw.template.get( 'mobile.startup', 'TableOfContentsHeading.hogan' )
	},
	/**
	 * @memberof TableOfContents
	 * @instance
	 */
	template: mw.template.get( 'mobile.startup', 'TableOfContents.hogan' ),
	/** @inheritdoc */
	postRender: function () {
		new Icon( {
			name: 'toc',
			additionalClassNames: 'toc-button'
		} ).$el.prependTo( this.$el.find( 'h2' ) );
	}
} );

module.exports = TableOfContents;
