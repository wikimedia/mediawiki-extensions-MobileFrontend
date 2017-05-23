<?php

namespace MediaWiki\Minerva;

use IContextSource;
use Title;
use User;

class SkinUserPageHelper {
	/**
	 * @var Title
	 */
	private $title;
	/**
	 * @var bool
	 */
	private $fetchedData = false;

	/**
	 * @var User
	 */
	private $pageUser;

	/**
	 * SkinMinervaUserPageHelper constructor.
	 * @param IContextSource $context
	 */
	public function __construct( IContextSource $context ) {
		$this->title = $context->getTitle();
	}

	/**
	 * Fetch user data and store locally for perfomance improvement
	 */
	private function fetchData() {
		if ( $this->fetchedData === false ) {
			if ( $this->title->inNamespace( NS_USER ) && !$this->title->isSubpage() ) {
				$pageUserId = User::idFromName( $this->title->getText() );
				if ( $pageUserId ) {
					$this->pageUser = User::newFromId( $pageUserId );
				}
			}
			$this->fetchedData = true;
		}
	}

	/**
	 * @return User|null
	 */
	public function getPageUser() {
		$this->fetchData();
		return $this->pageUser;
	}

	/**
	 * @return bool
	 */
	public function isUserPage() {
		$this->fetchData();
		return $this->pageUser !== null;
	}
}
