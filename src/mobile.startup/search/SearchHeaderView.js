const util = require( '../util' ),
	View = require( '../View' ),
	IconButton = require( '../IconButton' );

/**
 * @extends View
 */
class SearchHeaderView extends View {
	/**
	 * constructor
	 *
	 * @inheritdoc
	 * @param {Object} props
	 * @param {Function} props.onInput executed every time input changes
	 * @param {string} props.placeholderMsg
	 * @param {string} props.action
	 * @parm {string} [props.autocapitalize] none or sentences
	 * @param {string} [props.searchTerm] default
	 */
	constructor( props ) {
		super(
			util.extend( {
				autocapitalize: 'sentences'
			}, props, {
				events: {
					'input input': 'onInput'
				}
			} )
		);
	}

	/** @inheritdoc */
	onInput( ev ) {
		const query = ev.target.value;
		this.options.onInput( query );
		if ( query ) {
			this.clearIcon.$el.show();
		} else {
			this.clearIcon.$el.hide();
		}
	}

	/** @inheritdoc */
	get isTemplateMode() {
		return true;
	}

	/** @inheritdoc */
	get template() {
		return util.template( `<div class="overlay-title search-header-view">
		<form method="get" action="{{action}}" class="search-box">
		<input class="search mf-icon-search" type="search" name="search"
			autocapitalize="{{autocapitalize}}"
			autocomplete="off" placeholder="{{placeholderMsg}}" aria-label="{{placeholderMsg}}" value="{{searchTerm}}">
		<input type="hidden" name="title" value="{{defaultSearchPage}}">
		</form>
</div>` );
	}

	/** @inheritdoc */
	postRender() {
		const clearIcon = new IconButton( {
			tagName: 'button',
			icon: 'clear',
			size: 'medium',
			isSmall: true,
			label: mw.msg( 'mobile-frontend-clear-search' ),
			additionalClassNames: 'clear',
			events: {
				click: function () {
					this.$el.find( 'input' ).val( '' ).trigger( 'focus' );
					this.options.onInput( '' );
					clearIcon.$el.hide();
					// In beta the clear button is on top of the search input.
					// Stop propagation so that the input doesn't receive the click.
					return false;
				}.bind( this )
			}
		} );
		this.clearIcon = clearIcon;
		clearIcon.$el.hide();
		clearIcon.$el.attr( 'aria-hidden', 'true' );
		this.$el.find( 'form' ).append( clearIcon.$el );
	}
}

module.exports = SearchHeaderView;
