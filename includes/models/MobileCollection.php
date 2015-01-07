<?php

/**
 * MobileCollection.php
 */

/**
 * A collection of pages, which are represented by the MobilePage class.
 */
class MobileCollection implements IteratorAggregate {

	/**
	 * The internal collection of pages.
	 *
	 * @var MobilePage[]
	 */
	protected $pages = array();

	/**
	 * Adds a page to the collection.
	 *
	 * @param MobilePage $page
	 */
	public function add( MobilePage $page ) {
		$this->pages[] = $page;
	}

	public function getIterator() {
		return new ArrayIterator( $this->pages );
	}
}
