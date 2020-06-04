const util = require( '../util' ),
	View = require( '../View' ),
	Icon = require( '../Icon' );

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
	 * @param {string} [props.searchTerm] default
	 */
	constructor( props ) {
		super(
			util.extend( {}, props, {
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
		<input class="search" type="search" name="search" autocomplete="off" placeholder="{{placeholderMsg}}" aria-label="{{placeholderMsg}}" value="{{searchTerm}}">
		</form>
</div>` );
	}
	/** @inheritdoc */
	postRender() {
		const clearIcon = new Icon( {
			tagName: 'button',
			name: 'clear',
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
		this.$el.find( 'form' ).append( clearIcon.$el );
	}
}

module.exports = SearchHeaderView;
