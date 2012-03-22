<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

abstract class MobileFrontendTemplate {
	public $data;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->data = array();
	}

	/**
	 * Sets the value $value to $name
	 * @param $name
	 * @param $value
	 */
	public function set( $name, $value ) {
		$this->data[$name] = $value;
	}

	/**
	 * Sets the value $value to $name
	 * @param $name
	 * @param $value
	 */
	public function setByArray( $options ) {
		foreach ( $options as $name => $value ) {
			$this->set( $name, $value );
		}
	}

	/**
	 * Gets the value of $name
	 * @param $name
	 * @return string
	 */
	public function get( $name ) {
		return $this->data[$name];
	}

	/**
	 * Main function, used by classes that subclass MobileFrontendTemplate
	 * to show the actual HTML output
	 */
	abstract public function getHTML();
	
	/**
	 * Intended to override things like $skin->privacyLink() for custom link
	 * text of internal MW-generated links
	 * @param object Skin object
	 * @param string Mediawiki message key denoting the text of the link
	 * @param string Mediawiki message key denoting the page the link should point to
	 * @return string
	*/
	public function getCustomFooterLink( $skin, $linkText, $page ) {
		return $skin->footerLink( $linkText, $page );
	}
}
