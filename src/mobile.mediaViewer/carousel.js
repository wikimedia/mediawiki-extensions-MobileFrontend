const
	View = require( '../mobile.startup/View' ),
	Icon = require( '../mobile.startup/Icon' ),
	util = require( '../mobile.startup/util' ),

	/**
	 * Handler that fires when user clicks the next navigation button
	 *
	 * @private
	 * @param {JQuery.Event} ev
	 * @param {Object} props
	 */
	handleNext = function ( ev, props ) {
		// don't bubble; we don't want the onClick prop callback fired here
		ev.stopPropagation();

		const newIndex = props.index === props.items.length - 1 ?
				0 : props.index + 1,
			next = props.items[ newIndex ];

		props.onSlide( ev, next );
	},
	/**
	 * Handler that fires when user clicks the previous navigation button
	 *
	 * @private
	 * @param {JQuery.Event} ev
	 * @param {Object} props
	 */
	handlePrevious = function ( ev, props ) {
		// don't bubble; we don't want the onClick prop callback fired here
		ev.stopPropagation();

		const newIndex = props.index === 0 ?
				props.items.length - 1 : props.index - 1,
			previous = props.items[ newIndex ];

		props.onSlide( ev, previous );
	},
	/**
	 * Renders the navigation buttons
	 *
	 * @private
	 * @param {Object} props
	 * @return {JQuery.Element[]}
	 */
	makeNavigation = function ( props ) {
		if ( !props.showNavigation || props.items.length < 2 ) {
			return;
		}

		const
			previousButton = util.parseHTML(
				'<button class="prev slider-button"></button>'
			)
				.on( 'click', function ( ev ) { handlePrevious( ev, props ); } )
				.append( new Icon( {
					rotation: 90,
					name: 'arrow-invert'
				} ).$el ),

			nextButton = util.parseHTML(
				'<button class="next slider-button"></button>'
			)
				.on( 'click', function ( ev ) { handleNext( ev, props ); } )
				.append( new Icon( {
					rotation: -90,
					name: 'arrow-invert'
				} ).$el );

		return [
			previousButton,
			nextButton
		];
	};

/**
 * A presentational component accepting an arbitrary array of items that a user
 * should be able to navigate through and a featured item that is currently on
 * display. When the user clicks one of the navigation arrows, the onSlide
 * callback will give you the next item as a param! This component does nothing
 * with the actual changing of items - that is left up to the client.
 *
 * @param {Object} props
 * @param {View} props.featured A featured item that will be displayed between
 * the navigation buttons. This should probably be related to `items[index]`,
 * but can be any View that you want the carousel to currently display - images,
 * videos, emojis, spinners - you name it! The only thing this component will do
 * with it is display it!
 * @param {*} props.items An array of arbitrary items. Only used by the onSlide
 * event to determine the next featured item.
 * @param {number} props.index Index of the items that is featured. Only used
 * by the onSlide event to determine the next featured item.
 * @param {boolean} [props.showNavigation] Toggles the visibility of the
 * navigation buttons
 * @param {Object} [props.style] Inline styles to render on the parent element.
 * Object will be passed to jQuery's .css() method and must be compatible with
 * that
 * @param {Function} [props.onClick] Callback that fires when the carousel is
 * clicked. Does not fire when the navigation buttons are clicked
 * @param {Function} [props.onSlide] Callback that fires when the carousel's
 * navigation buttons are clicked. The callback receives two params in this
 * order:
 * 1: JQuery.Event
 * 2: item object of the next slide that should be rendered
 * @return {View}
 */
function carousel( props ) {
	props = util.extend( {
		featured: '',
		items: [],
		index: 0,
		showNavigation: true,
		style: {},
		onClick: function () {},
		onSlide: function () {}
	}, props );

	const view = new View( {
		className: 'carousel',
		events: {
			click: props.onClick
		}
	} );

	view.$el.css( props.style );

	view.append(
		props.featured.$el,
		makeNavigation( props )
	);

	return view;
}

module.exports = carousel;
