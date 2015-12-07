<?php

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'MobileFrontend' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['MobileFrontend'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['MobileFrontendAlias'] = __DIR__ . '/MobileFrontend.alias.php';
	/* wfWarn(
		'Deprecated PHP entry point used for MobileFrontend extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	); */
	return true;
} else {
	die( 'This version of the MobileFrontend extension requires MediaWiki 1.25+' );
}
