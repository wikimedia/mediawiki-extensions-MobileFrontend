<?php

namespace MobileFrontend\ContentProviders;

use MobileFrontend\ContentProviders\IContentProvider;

class DefaultContentProvider implements IContentProvider {
	/**
	 * Constructor
	 *
	 * @param string $html HTML relating to content
	 * @return IContentProvider
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
