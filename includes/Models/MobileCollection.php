<?php

namespace MobileFrontend\Models;

use ArrayIterator;
use Countable;
use IteratorAggregate;
use MediaWiki\Libs\Emptiable;

/**
 * A collection of pages, which are represented by the MobilePage class.
 */
class MobileCollection implements IteratorAggregate, Countable, Emptiable {

	/**
	 * The internal collection of pages.
	 *
	 * @var MobilePage[]
	 */
	protected $pages = [];

	/**
	 * Return size of the collection
	 * @return int
	 */
	public function count(): int {
		return count( $this->pages );
	}

	/**
	 * Return size of the collection
	 * @return bool
	 */
	public function isEmpty() {
		return !$this->pages;
	}

	/**
	 * Adds a page to the collection.
	 *
	 * @param MobilePage $page Page to add
	 */
	public function add( MobilePage $page ) {
		$this->pages[] = $page;
	}

	/**
	 * @return ArrayIterator
	 */
	public function getIterator(): ArrayIterator {
		return new ArrayIterator( $this->pages );
	}
}
