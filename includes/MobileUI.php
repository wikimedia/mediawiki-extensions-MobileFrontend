<?php

/**
 * MobileUI.php
 */

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
	 * @return string class name for use with HTML element
	 */
	public static function iconClass( $iconName, $iconType = 'element', $additionalClassNames = '' ) {
		$base = 'mw-ui-icon';
		$modifiers = 'mw-ui-icon-' . $iconType;
		if ( $iconName ) {
			$modifiers .= ' mw-ui-icon-' . $iconName;
		}
		return $base . ' ' . $modifiers . ' ' . $additionalClassNames;
	}

	/**
	 * Get CSS classes for a mediawiki ui semantic element
	 * @param string $base The base class
	 * @param string $modifier Type of anchor (progressive, constructive, destructive)
	 * @param string $additionalClassNames additional class names you want to associate
	 *  with the iconed element
	 * @return string class name for use with HTML element
	 */
	public static function semanticClass( $base, $modifier, $additionalClassNames = '' ) {
		$modifier = empty( $modifier ) ? '' : 'mw-ui-' . $modifier;
		return $base . ' ' . $modifier . ' ' . $additionalClassNames;
	}

	/**
	 * Get CSS classes for buttons
	 * @param string $modifier Type of button (progressive, constructive, destructive)
	 * @param string $additionalClassNames additional class names you want to associate
	 *  with the button element
	 * @return string class name for use with HTML element
	 */
	public static function buttonClass( $modifier = '', $additionalClassNames = '' ) {
		return self::semanticClass( 'mw-ui-button', $modifier, $additionalClassNames );
	}

	/**
	 * Get CSS classes for anchors
	 * @param string $modifier Type of anchor (progressive, constructive, destructive)
	 * @param string $additionalClassNames additional class names you want to associate
	 *  with the anchor element
	 * @return string class name for use with HTML element
	 */
	public static function anchorClass( $modifier = '', $additionalClassNames = '' ) {
		return self::semanticClass( 'mw-ui-anchor', $modifier, $additionalClassNames );
	}

	/**
	 * Return a message box.
	 * @param string $html of contents of box
	 * @param string $className corresponding to box
	 * @return string of html representing a box.
	 */
	public static function messageBox( $html, $className ) {
		$templateParser = new TemplateParser( __DIR__ . '/../resources/mobile.messageBox/' );

		return $templateParser->processTemplate( 'MessageBox', array(
			'className' => $className,
			'msg' => $html
		) );
	}

	/**
	 * Return a warning box.
	 * @param string $html of contents of box
	 * @return string of html representing a warning box.
	 */
	public static function warningBox( $html ) {
		return self::messageBox( $html, 'warningbox' );
	}

	/**
	 * Return an error box.
	 * @param string $html of contents of error box
	 * @return string of html representing an error box.
	 */
	public static function errorBox( $html ) {
		return self::messageBox( $html, 'errorbox' );
	}

	/**
	 * Return a success box.
	 * @param string $html of contents of box
	 * @return string of html representing a success box.
	 */
	public static function successBox( $html ) {
		return self::messageBox( $html, 'successbox' );
	}

	/**
	 * Mark some html as being content
	 * @param string $html
	 * @param string $className additional class names
	 * @return string of html
	 */
	public static function contentElement( $html, $className = '' ) {
		$className .= ' content ';
		return Html::openElement( 'div', array( 'class' => $className ) ) . $html .
			Html::closeElement( 'div' );
	}
}
