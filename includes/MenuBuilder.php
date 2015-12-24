<?php

namespace MobileFrontend;

use DomainException;

/**
 * Model for a menu that can be presented in a skin.
 */
class MenuBuilder {
	private $entries = array();

	/**
	 * Get all entries represented as plain old PHP arrays.
	 *
	 * @return array
	 */
	public function getEntries() {
		$entryPresenter = function ( MenuEntry $entry ) {
			$result = array(
				'name' => $entry->getName(),
				'components' => $entry->getComponents(),
			);

			if ( $entry->isJSOnly() ) {
				$result['class'] = 'jsonly';
			}

			return $result;
		};

		return array_map( $entryPresenter, $this->entries );
	}

	/**
	 * Insert an entry into the menu.
	 *
	 * @param string $name A unique name identifying the menu entry
	 * @param boolean [$isJSOnly] Whether the menu entry works without JS
	 * @throws DomainException When the entry already exists
	 * @return MenuEntry
	 */
	public function insert( $name, $isJSOnly = false ) {
		if ( $this->search( $name ) !== -1 ) {
			throw new DomainException( "The \"${name}\" entry already exists." );
		}

		$this->entries[] = $entry = new MenuEntry( $name, $isJSOnly );

		return $entry;
	}

	/**
	 * Searches for a menu entry by name.
	 *
	 * @param string $name
	 * @return integer If the menu entry exists, then the 0-based index of the entry; otherwise, -1
	 */
	private function search( $name ) {
		$count = count( $this->entries );

		for ( $i = 0; $i < $count; ++$i ) {
			if ( $this->entries[$i]->getName() === $name ) {
				return $i;
			}
		}

		return -1;
	}

	/**
	 * Insert an entry after an existing one.
	 *
	 * @param string $targetName The name of the existing entry to insert
	 *  the new entry after
	 * @param string $name The name of the new entry
	 * @param boolean [$isJSOnly] Whether the entry works without JS
	 * @throws DomainException When the existing entry doesn't exist
	 * @return MenuEntry
	 */
	public function insertAfter( $targetName, $name, $isJSOnly = false ) {
		if ( $this->search( $name ) !== -1 ) {
			throw new DomainException( "The \"${name}\" entry already exists." );
		}

		$index = $this->search( $targetName );

		if ( $index === -1 ) {
			throw new DomainException( "The \"{$targetName}\" entry doesn't exist." );
		}

		$entry = new MenuEntry( $name, $isJSOnly );
		array_splice( $this->entries, $index + 1, 0, array( $entry ) );

		return $entry;
	}
}

/**
 * Model for a menu entry.
 */
class MenuEntry {
	private $name;
	private $isJSOnly;
	private $components;

	/**
	 * @param string $name
	 * @param boolean $isJSOnly Whether the entry works without JS
	 */
	public function __construct( $name, $isJSOnly ) {
		$this->name = $name;
		$this->isJSOnly = $isJSOnly;
		$this->components = array();
	}

	/**
	 * @return string
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Gets whether the entry should only be shown if JavaScript is disabled
	 * in the client.
	 *
	 * @return boolean
	 */
	public function isJSOnly() {
		return $this->isJSOnly;
	}

	/**
	 * @return array
	 */
	public function getComponents() {
		return $this->components;
	}

	/**
	 * Add a link to the entry.
	 *
	 * An entry can have zero or more links.
	 *
	 * @param string $label
	 * @param string $url
	 * @param string [$className] Any additional CSS classes that should added to the output,
	 *  separated by spaces
	 * @param array [$attrs] Additional data that can be associated with the component
	 *
	 * @return MenuEntry
	 */
	public function addComponent( $label, $url, $className = '', $attrs = array() ) {
		$this->components[] = array(
			'text' => $label,
			'href' => $url,
			'class' => $className,
		) + $attrs;

		return $this;
	}
}
