<?php

/**
 * Template overloader
 *
 * Facilitates hijacking an existing template object by copying
 * its properties to this new template.
 */
abstract class OverloadTemplate extends QuickTemplate {

	/**
	 * Overload the parent constructor
	 *
	 * Does not call the parent's constructor to prevent overwriting
	 * $this->data and $this->translatorobject since we're essentially
	 * just hijacking the existing template and its data here.
	 * @param QuickTemplate $template: The original template object to overwrite
	 */
	public function __construct( $template ) {
		$this->copyObjectProperties( $template );
	}

	/**
	 * Copy public properties of one object to this one
	 * @param object $obj: The object whose properties should be copied
	 */
	protected function copyObjectProperties( $obj ) {
		foreach( get_object_vars( $obj ) as $prop => $value ) {
			$this->$prop = $value;
		}
	}
}
