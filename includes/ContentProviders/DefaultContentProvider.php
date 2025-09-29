<?php

namespace MobileFrontend\ContentProviders;

class DefaultContentProvider implements IContentProvider {

	/**
	 * @param string $html HTML relating to content
	 */
	public function __construct(
		private readonly string $html,
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function getHTML() {
		return $this->html;
	}
}
