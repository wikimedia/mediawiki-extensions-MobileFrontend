<?php

namespace MobileFrontend\Browse;

use Title;

/**
 * Always returns an empty set of tags for all articles/pages.
 */
class NullTagService extends TagService {

	/** @inheritdoc */
	public function getTags( Title $title ) {
		return array();
	}
}
