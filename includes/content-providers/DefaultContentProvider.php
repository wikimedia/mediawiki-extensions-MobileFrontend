<?php

namespace MobileFrontend\ContentProviders;

class DefaultContentProvider implements IContentProvider {
	/**
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
