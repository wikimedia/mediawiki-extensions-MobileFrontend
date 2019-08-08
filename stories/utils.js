import { action } from '@storybook/addon-actions';

/**
 * Make sure components are styled correctly.
 * This should not be necessary. A story using this indicates that
 * a component has problematic CSS.
 * @param {View} view
 * @param {string} [className]
 * @param {string} [id] of container
 * @param {string} [style] attribute of container
 * @return {Element}
 */
function wrap( view, className, id, style ) {
	const container = document.createElement( 'div' );
	container.setAttribute( 'class', className );
	if ( id ) {
		container.setAttribute( 'id', id );
	}
	if ( style ) {
		container.setAttribute( 'style', style );
	}
	if ( view.$el ) {
		container.appendChild( view.$el[0] );
	} else {
		container.appendChild( view );
	}
	return container;
}

/**
 * Show a warning to communicate something about a component to the reader.
 * @param {string} text
 * @return {Element}
 */
function warning( text ) {
	const node = document.createElement( 'div' );
	node.setAttribute( 'class', 'warningbox' );
	node.textContent = text;
	return node;
}

const fakeEventBus = {
	emit: action( 'eventEmitter.emit' ),
	on: () => {},
	off: () => {}
};

export { wrap, fakeEventBus, warning };
