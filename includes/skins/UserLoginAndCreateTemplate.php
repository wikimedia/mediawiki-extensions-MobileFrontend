<?php

/**
 * Template overloader for user login and account cration templates
 *
 * Facilitates hijacking existing account creation/login template objects
 * by copying their properties to this new template, and exposing some
 * special mobile-specific magic.
 */
abstract class UserLoginAndCreateTemplate extends QuickTemplate {

	/**
	 * Overload the parent constructor
	 *
	 * Does not call the parent's constructor to prevent overwriting
	 * $this->data and $this->translatorobject since we're essentially
	 * just hijacking the existing template and its data here.
	 * @param QuickTemplate $template: The original template object to overwrite
	 */
	public function __construct( $template ) {
		$this->copyObjectProperties( $template );
	}

	/**
	 * Copy public properties of one object to this one
	 * @param object $obj: The object whose properties should be copied
	 */
	protected function copyObjectProperties( $obj ) {
		foreach( get_object_vars( $obj ) as $prop => $value ) {
			$this->$prop = $value;
		}
	}

	/**
	 * Get the current RequestContext
	 * @return RequestContext
	 */
	public function getRequestContext() {
		return RequestContext::getMain();
	}

	/**
	 * Prepare template data if an anon is attempting to log in after watching an article
	 */
	protected function getArticleTitleToWatch() {
		$ret = '';
		$request = $this->getRequestContext()->getRequest();
		if ( $request->getVal( 'returntoquery' ) == 'article_action=watch' &&
			!is_null( $request->getVal( 'returnto' ) ) ) {
			$ret = $request->getVal( 'returnto' );
		}
		return $ret;
	}

	/**
	 * Determine whether or not we should attempt to 'stick https'
	 *
	 * If wpStickHTTPS is set as a value in login requests, when a user
	 * is logged in to HTTPS and if they attempt to view a page on http,
	 * they will be automatically redirected to HTTPS.
	 * @see https://gerrit.wikimedia.org/r/#/c/24026/
	 * @return bool
	 */
	protected function doStickHTTPS() {
		global $wgMFForceSecureLogin;
		$request = $this->getRequestContext()->getRequest();
		if ( $wgMFForceSecureLogin && $request->detectProtocol() === 'https' ) {
			return true;
		}
		return false;
	}

	protected function getHeadMsg() {
		$req = $this->getRequestContext()->getRequest();
		if ( $req->getVal( 'returnto' ) && ( $title = Title::newFromText( $req->getVal( 'returnto' ) ) ) ) {
			list( $returnto, /* $subpage */ ) = SpecialPageFactory::resolveAlias( $title->getDBkey() );
		} else {
			$returnto = '';
		}
		$returntoQuery = $req->getVal( 'returntoquery' );
		if ( $returnto == 'Uploads' ) {
			$key = 'mobile-frontend-donate-image-login';
		} elseif ( strstr( $returntoQuery, 'article_action=watch' ) ) {
			$key = 'mobile-frontend-watch-login';
		} elseif ( strstr( $returntoQuery, 'article_action=photo-upload' ) ) {
			$key = 'mobile-frontend-photo-upload-login';
		} else {
			return '';
		}
		return wfMessage( $key )->plain();
	}
}
