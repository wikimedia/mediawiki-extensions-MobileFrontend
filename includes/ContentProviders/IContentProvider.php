<?php

namespace MobileFrontend\ContentProviders;

interface IContentProvider {
	/**
	 * @return string HTML for the current page
	 */
	public function getHTML();
}
