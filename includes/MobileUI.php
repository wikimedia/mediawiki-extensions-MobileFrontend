<?php

// FIXME: Use OOUI PHP when available.
/**
 * Helper methods for generating parts of the UI.
 */
class MobileUI {

	/**
	 * Get CSS classes for icons
	 * @param string $iconName
	 * @param string $iconType element or before
	 * @param string $additionalClassNames additional class names you want to associate
	 *  with the iconed element
	 * @param string $iconPrefix optional prefix for icons. Defaults to minerva.
	 * @return string class name for use with HTML element
	 */
	public static function iconClass( $iconName, $iconType = 'element', $additionalClassNames = '',
		$iconPrefix = 'mf'
	) {
		$base = 'mw-ui-icon';
		$modifiers = '';
		if ( $iconType ) {
			$modifiers .= 'mw-ui-icon-' . $iconType;
		}
		if ( $iconName ) {
			$modifiers .= ' mw-ui-icon-' . $iconPrefix . '-' . $iconName;
		}
		if ( $iconType === 'element' ) {
			$additionalClassNames .= ' mw-ui-button mw-ui-quiet';
		}
		return $base . ' ' . $modifiers . ' ' . $additionalClassNames;
	}

	/**
	 * Mark some html as being content
	 * @param string $html HTML content
	 * @param string $className additional class names
	 * @return string of html
	 */
	public static function contentElement( $html, $className = '' ) {
		$templateParser = new TemplateParser( __DIR__ . '/templates' );
		return $templateParser->processTemplate( 'ContentBox', [
			'className' => $className,
			'html' => $html,
		] );
	}
}
