<?php

namespace MobileFrontend\ContentProviders;

interface IContentProvider {
	/**
	 * @return html for the current page
	 */
	public function getHTML();
}
