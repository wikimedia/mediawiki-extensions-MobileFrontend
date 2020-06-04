var
	prototype,
	actionParams = require( '../mobile.startup/actionParams' ),
	util = require( '../mobile.startup/util' ),
	SearchGateway = require( '../mobile.startup/search/SearchGateway' );

/**
 * Api for CategoryOverlay
 *
 * @class CategoryGateway
 * @extends SearchGateway
 */
function CategoryGateway() {
	CategoryGateway.parent.apply( this, arguments );
}
prototype = {
	/**
	 * @memberof CategoryGateway
	 * @instance
	 */
	continueParams: {},
	/**
	 * @memberof CategoryGateway
	 * @instance
	 */
	canContinue: true,
	/**
	 * @inheritdoc
	 * @memberof CategoryGateway
	 * @instance
	 */
	searchNamespace: 14,
	/**
	 * Saves the categories passed to this function to the page
	 *
	 * @memberof CategoryGateway
	 * @instance
	 * @param {string} title Title of the current page (to add the categories to)
	 * @param {string} categories List of Categories to add
	 * @return {jQuery.Deferred}
	 */
	save: function ( title, categories ) {
		return this.api.postWithToken( 'csrf', {
			action: 'edit',
			title: title,
			appendtext: categories,
			summary: mw.msg( 'mobile-frontend-categories-summary' )
		} );
	},
	/**
	 * Returns the categories the title belongs to.
	 *
	 * @memberof CategoryGateway
	 * @instance
	 * @param {string} title Title of the current page (to add the categories to)
	 * @return {jQuery.Deferred|boolean} False, if no further continuation is possible,
	 *                                   jQuery.Deferred otherwise.
	 */
	getCategories: function ( title ) {
		var self = this, params;

		if ( this.canContinue === false ) {
			return false;
		}

		params = util.extend( {}, {
			prop: 'categories',
			titles: title,
			clprop: 'hidden',
			cllimit: 50
		}, this.continueParams );
		return this.api.get( actionParams( params ) ).then( function ( data ) {
			if ( data.continue !== undefined ) {
				self.continueParams = data.continue;
			} else {
				self.canContinue = false;
			}

			return data;
		} );
	}
};

OO.inheritClass( CategoryGateway, SearchGateway );
util.extend( CategoryGateway.prototype, prototype );

module.exports = CategoryGateway;
