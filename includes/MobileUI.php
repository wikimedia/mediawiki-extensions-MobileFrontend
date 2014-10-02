<?php

// FIXME: Use OOUI PHP when available.
class MobileUI {

	/**
	 * initialize various variables and generate the template
	 * @param string $iconName
	 * @param string $iconType element or before
	 * @param string $additionalClassNames additional class names you want to associate
	 *  with the iconed element
	 * @return string class name for use with HTML element
	 */
	public static function iconClass( $iconName, $iconType = 'element', $additionalClassNames = '' ) {
		$modifiers = $iconType === 'before' ? 'icon-text' : '';
		$modifiers .= ' icon-' . $iconName;

		return 'icon ' . $modifiers . ' ' . $additionalClassNames;
	}
}
