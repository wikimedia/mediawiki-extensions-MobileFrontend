<?php

/**
 * Provides information for creation of WML cards
 */
class WmlContext {
	private $requestedSegment;
	private $useFormat;
	private $currentUrl;
	private $onlyThisSegment = false;

	public function __construct( MobileContext $context = null ) {
		if ( $context ) {
			$request = $context->getRequest();
			$this->requestedSegment = $request->getInt( 'seg', 0 );
			$useFormat = $context->getUseFormat();
			if ( $useFormat ) {
				$this->useFormat = $useFormat;
			}
			$this->currentUrl = $context->getTitle()->getCanonicalURL();
		}
	}

	public function getRequestedSegment() {
		return $this->requestedSegment;
	}

	public function setRequestedSegment( $value ) {
		$this->requestedSegment = $value;
	}

	public function getUseFormat() {
		return $this->useFormat;
	}

	public function setUseFormat( $value ) {
		$this->useFormat = $value;
	}

	public function getCurrentUrl() {
		return $this->currentUrl;
	}

	public function setCurrentUrl( $value ) {
		$this->currentUrl = $value;
	}

	public function getOnlyThisSegment() {
		return $this->onlyThisSegment;
	}

	public function setOnlyThisSegment( $value ) {
		$this->onlyThisSegment = $value;
	}
}
