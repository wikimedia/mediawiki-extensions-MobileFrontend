<?php

namespace MobileFrontend\ContentProviders;

class DefaultContentProvider implements IContentProvider {

	private string $html;

	/**
	 * @param string $html HTML relating to content
	 */
	public function __construct( string $html ) {
		$this->html = $html;
	}

	/**
	 * @inheritDoc
	 */
	public function getHTML() {
		return $this->html;
	}
}
