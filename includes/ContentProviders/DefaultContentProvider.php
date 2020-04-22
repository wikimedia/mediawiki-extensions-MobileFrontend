<?php

namespace MobileFrontend\ContentProviders;

class DefaultContentProvider implements IContentProvider {

	/**
	 * @var string
	 */
	private $html;

	/**
	 * @param string $html HTML relating to content
	 */
	public function __construct( $html ) {
		$this->html = $html;
	}

	/**
	 * @inheritDoc
	 */
	public function getHTML() {
		return $this->html;
	}
}
