<?php

class SpecialMobileFeedback extends UnlistedSpecialMobilePage {
	public function __construct() {
		parent::__construct( 'MobileFeedback' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();
		$this->getOutput()->setPageTitle( $this->msg( 'mobile-frontend-leave-feedback-special-title' )->text() );
		$this->getOutput()->addHtml( Html::openElement( 'div', array( 'class' => 'content' ) ) );
		$context = MobileContext::singleton();
		$context->setForceMobileView( true );
		$context->setContentTransformations( false );

		if ( $par == 'thanks' ) {
			$this->showThanks();
		} elseif ( $par == 'error' ) {
			$this->showError();
		} else {
			$this->renderFeedbackHtml();
		}
	}

	protected function renderFeedbackHtml() {
		global $wgMFFeedbackLinks, $wgMFDisplayNonTechnicalFeedback;
		/** Section header text **/
		$technicalProblemSectionHeader = $this->msg( 'mobile-frontend-leave-feedback-technical-problem-section-header' )->escaped();

		wfRunHooks( 'MobileFrontendOverrideFeedbackLinks', array(
			$this->getRequest()->getText( 'feedbacksource', '' ),
			$this->getRequest()->getText( 'returnto', '' ),
			) );

		/** Links **/
		$allowedLinks = array(
			'Technical',
			'General',
			'ArticlePersonal',
			'ArticleFactual',
			'ArticleOther',
		);

		// get configured link values
		foreach ( $allowedLinks as $v ) {
			if ( !isset( $wgMFFeedbackLinks[ $v ] ) || !strlen( trim( $wgMFFeedbackLinks[ $v ] ) ) ) {
				$linkVal = '#';
			} else {
				$linkVal = htmlspecialchars( $wgMFFeedbackLinks[ $v ], ENT_QUOTES, 'UTF-8', false );
			}
			$varName = 'feedback' . $v . 'Link';
			$ { $varName } = $linkVal;
		}

		// Do we display the feedback form or use the link?
		if ( isset( $feedbackTechnicalLink ) && $feedbackTechnicalLink != '#' ) {
			$useFeedbackForm = false;
		} else {
			$useFeedbackForm = true;
		}

		/** Link text **/
		$feedbackTechnicalLinkText = ( $useFeedbackForm ) ? '' : $this->msg( 'mobile-frontend-leave-feedback-technical-link-text' )->escaped();

		$warning = $this->msg( 'mobile-frontend-leave-feedback-warning' );

		$html = <<<HTML
		{$warning}
		<div class='feedback'>
		<h2 class="section_heading" id="section_1">{$technicalProblemSectionHeader}</h2>
		<div class="content_block" id="content_1">
HTML;
		$this->getOutput()->addHtml( $html );

		if ( $useFeedbackForm ) {
			/** Fetch form HTML **/
			$form = new HTMLForm( $this->getForm(), $this );
			$form->setDisplayFormat( 'raw' );
			$form->setTitle( $this->getTitle() );
			$form->setId( 'mf-feedback-form' );
			$form->setSubmitText( $this->msg( 'mobile-frontend-leave-feedback-submit' )->escaped() );
			$form->setSubmitCallback( array( $this, 'postFeedback' ) );
			$form->setAction( $this->getRequest()->getRequestURL() . "#mf-feedback-form" );
			$form->show();
		} else {
			$html = <<<HTML
			<ul>
				<li><a href="{$feedbackTechnicalLink}">{$feedbackTechnicalLinkText}</a></li>
			</ul>
HTML;
			$this->getOutput()->addHtml( $html );
		}

		$html = "</div>";
		if ( $wgMFDisplayNonTechnicalFeedback ) {
			$generalSectionHeader = $this->msg( 'mobile-frontend-leave-feedback-general-section-header' )->escaped();
			$articleFeedbackSectionHeader = $this->msg( 'mobile-frontend-leave-feedback-article-feedback-section-header' )->escaped();
			$feedbackGeneralLinkText = $this->msg( 'mobile-frontend-leave-feedback-general-link-text' )->escaped();
			$feedbackArticlePersonalLinkText = $this->msg( 'mobile-frontend-leave-feedback-article-personal-link-text' )->escaped();
			$feedbackArticleFactualLinkText = $this->msg( 'mobile-frontend-leave-feedback-article-factual-link-text' )->escaped();
			$feedbackArticleOtherLinkText = $this->msg( 'mobile-frontend-leave-feedback-article-other-link-text' )->escaped();

			$html .= <<<HTML
			<h2 class="section_heading" id="section_2">{$generalSectionHeader}</h2>
			<div class="content_block" id="content_2">
				<ul>
					<li><a href="{$feedbackGeneralLink}">{$feedbackGeneralLinkText}</a></li>
				</ul>
			</div>
			<h2 class="section_heading" id="section_3">{$articleFeedbackSectionHeader}</h2>
			<div class="content_block" id="content_3">
				<ul>
					<li>
						<a href="{$feedbackArticlePersonalLink}">{$feedbackArticlePersonalLinkText}</a>
					</li>
					<li>
						<a href="{$feedbackArticleFactualLink}">{$feedbackArticleFactualLinkText}</a>
					</li>
					<li>
						<a href="{$feedbackArticleOtherLink}">{$feedbackArticleOtherLinkText}</a>
					</li>
				</ul>
			</div>
HTML;
		}
		$html .= "</div>"; // close .content
		$this->getOutput()->addHtml( $html );
	}

	protected function getForm( $displaySuffix = '' ) {
		$subjectPlaceholder = $this->msg( 'mobile-frontend-leave-feedback-form-subject-placeholder' )->escaped();
		$messagePlaceholder = $this->msg( 'mobile-frontend-leave-feedback-form-message-placeholder' )->escaped();
		return array(
			'returnto' => array(
				'type' => 'hidden' . $displaySuffix,
				'default' => $this->getRequest()->getText( 'returnto', '' ),
			),
			'source' => array(
				'type' => 'hidden' . $displaySuffix,
				'default' => $this->getRequest()->getText( 'feedbacksource', '' )
			),
			'subject' => array(
				'type' => 'text' . $displaySuffix,
				'maxlength' => 60,
				'validation-callback' => array( $this, 'validateSubject' ),
				'placeholder' => $subjectPlaceholder,
			),
			'message' => array(
				'type' => 'textarea' . $displaySuffix,
				'rows' => 5,
				'cols' => 60,
				'validation-callback' => array( $this, 'validateMessage' ),
				'placeholder' => $messagePlaceholder,
			),
		);
	}

	public function postFeedback( $form ) {
		global $wgMFRemotePostFeedback;

		$subject = $this->getFormattedSubject( $form );
		$message = $this->getFormattedMessage( $form );
		$returnTo = $form['returnto'];
		$context = MobileContext::singleton();
		if ( $wgMFRemotePostFeedback === true ) {
			$success = $this->postRemoteFeedback( $subject, $message );
		} else {
			$success = $this->postLocalFeedback( $subject, $message );
		}

		if ( $success === true ) {
			$location = $context->getMobileUrl(
				$this->getTitle( 'thanks' )->getFullURL( array( 'returnto' => $returnTo ) ) );
			$this->getRequest()->response()->header( 'Location: ' . $location );
			exit;
		} else {
			$location = $context->getMobileUrl(
				$this->getTitle( 'error' )->getFullURL( array( 'returnto' => $returnTo ) ) );
			$this->getRequest()->response()->header( 'Location: ' . $location );
			exit;
		}
	}

	protected function postLocalFeedback( $subject, $message ) {
		wfProfileIn( __METHOD__ );

		// Is this really right? Are people really checking all of the different
		// language variants of this page?
		// Perhaps this makes more sense as something non-language specific...
		$title = Title::newFromText( wfMessage( 'mobile-frontend-feedback-page' )->inContentLanguage()->plain() );

		if ( $title->userCan( 'edit' ) &&
			!$this->getUser()->isBlockedFrom( $title ) ) {
			$article = new Article( $title, 0 );
			$rawtext = $article->getRawText();
			$rawtext .= "\n== {$subject} ==\n";
			$rawtext .= $message;
			$article->doEdit( $rawtext,
				$this->msg( 'mobile-frontend-feedback-edit-summary', $subject )->inContentLanguage()->text()
			);
			$ret = true;
		} else {
			$ret = false;
		}

		wfProfileOut( __METHOD__ );
		return $ret;
	}

	protected function getFormattedSubject( $form ) {
		$subject = $form['subject']
			? $form['subject']
			: $this->msg( 'mobile-frontend-feedback-no-subject' )->inContentLanguage()->text();
		return $subject;
	}

	protected function getFormattedMessage( $form ) {
		$rawMsg = trim( $form['message'] );
		$feedbackSource = trim( $form['source'] );
		$returnTo = trim( $form['returnto'] );
		$msg = "{$rawMsg} ~~~~\n<br><small>User agent: <code>{$_SERVER['HTTP_USER_AGENT']}</code> Source: <code>{$feedbackSource}</code> Referring page: {$returnTo}</small> ";
		return $msg;
	}

	protected function postRemoteFeedback( $subject, $message ) {
		global $wgMFRemotePostFeedbackUrl, $wgMFRemotePostFeedbackUsername,
			$wgMFRemotePostFeedbackPassword, $wgMFRemotePostFeedbackArticle;

		try {
			$apiClient = new MobileFrontendMWApiClient( $wgMFRemotePostFeedbackUrl,
				$wgMFRemotePostFeedbackUsername, $wgMFRemotePostFeedbackPassword );
			return $apiClient->editArticle( $wgMFRemotePostFeedbackArticle, $subject, $message );
		} catch ( Exception $e ) {
			return false;
		}
	}

	public function validateSubject( $textfield ) {
		if ( mb_strlen( trim( $textfield ) ) < 1 ) {
			return $this->msg( 'mobile-frontend-feedback-no-subject-field' )->text();
		}
		return true;
	}

	public function validateMessage( $textarea ) {
		if ( mb_strlen( trim( $textarea ) ) < 1 ) {
			return $this->msg( 'mobile-frontend-feedback-no-message' )->text();
		}
		return true;
	}

	protected function showThanks() {
		$this->showPostFeedbackOutput( 'mobile-frontend-leave-feedback-thanks' );
	}

	protected function showError() {
		$this->showPostFeedbackOutput( 'mobile-frontend-leave-feedback-post-error' );
	}

	protected function showPostFeedbackOutput( $msg ) {
		$out = $this->getOutput();
		$out->addHtml( "<div class=mwm-message mwm-notice'>{$this->msg( $msg )->parse()}</div>" );
		$t = Title::newFromText( $this->getRequest()->getText( 'returnto' ) );
		if ( $t ) {
			$out->addReturnTo( $t );
		} else {
			$out->returnToMain();
		}
	}
}

class MobileFrontendMWApiClient {
	protected $username;
	protected $password;
	protected $cookieJar;
	protected $url;
	protected $loggedIn = false;

	public function __construct( $url = null, $username = null, $password = null ) {
		$opts = array( 'url', 'username', 'password' );
		foreach ( $opts as $opt ) {
			if ( !is_null( $ { $opt } ) ) {
				$setMethodName = "set" . ucfirst( $opt );
				$this->$setMethodName( $ { $opt } );
			}
		}
	}

	public function setUsername( $username ) {
		if ( !strlen( $username ) ) {
			throw new Exception ( 'Invalid username' );
		}
		$this->username = $username;
	}

	public function getUsername() {
		return $this->username;
	}

	public function setCookieJar( $cookieJar ) {
		$this->cookieJar = $cookieJar;
	}

	public function getCookieJar() {
		return $this->cookieJar;
	}

	public function setPassword( $password ) {
		if ( !strlen( $password ) ) {
			throw new Exception ( 'Invalid password' );
		}
		$this->password = $password;
	}

	public function getPassword() {
		return $this->password;
	}

	public function setUrl( $url ) {
		if ( !strlen( $url ) ) {
			throw new Exception ( 'Invalid URL' );
		}
		$this->url = $url;
	}

	public function getUrl() {
		return $this->url;
	}

	public function login() {
		// login
		$options = array(
			'postData' => array(
				'action' => 'login',
				'lgname' => $this->getUsername(),
				'lgpassword' => $this->getPassword(),
				'format' => 'json',
			),
			'method' => 'POST',
		);
		$req = MwHttpRequest::factory( $this->getUrl(), $options );
		$status = $req->execute();
		if ( !$status->isGood() ) {
			throw new Exception( 'Remote posting login request failed.' );
		}
		$loginResponse = $req->getContent();
		$loginResponse = json_decode( $loginResponse, true );
		$loginResult = $loginResponse['login']['result'];
		if ( $loginResult == 'NeedToken' ) {
			// fetch cookie jar (session info needed for auth)
			$this->setCookieJar( $req->getCookieJar() );
			$token = $loginResponse['login']['token'];
			$options['postData']['lgtoken'] = $token;
			$req = MwHttpRequest::factory( $this->getUrl(), $options );
			// set cookie jar
			$req->setCookieJar( $this->getCookieJar() );
			$status = $req->execute();
			if ( !$status->isGood() ) {
				throw new Exception( 'Remote posting login failed after token.' );
			}
			$loginResponse = $req->getContent();
			$loginResponse = json_decode( $loginResponse, true );
			$loginResult = $loginResponse['login']['result'];
		}

		if ( $loginResult != 'Success' ) {
			// there's some kind of problem
			throw new Exception( 'Remote posting login failed.' );
		}
		$this->loggedIn = true;
		return true;
	}

	public function getEditToken( $articleName ) {
		// get edit token
		$options = array(
			'postData' => array(
				'action' => 'query',
				'prop' => 'info|revisions',
				'intoken' => 'edit',
				'titles' => $articleName,
				'format' => 'json',
			),
			'method' => 'POST',
		);
		$req = MwHttpRequest::factory( $this->getUrl(), $options );
		$req->setCookieJar( $this->getCookieJar() );
		$status = $req->execute();

		if ( !$status->isGood() ) {
			// make some kind of error?
			throw new Exception( 'Failed fetching edit token.' );
		}
		$response = $req->getContent();
		$response = json_decode( $response, true );
		$pages = $response['query']['pages'];
		$editToken = null;
		foreach ( $pages as $page ) {
			if ( isset( $page['edittoken'] ) ) $editToken = $page['edittoken'];
			if ( !is_null( $editToken ) ) break;
		}
		// what happens if no edit token present?!
		return $editToken;
	}

	public function editArticle( $articleName, $sectionTitle, $text, $section = 'new' ) {
		if ( $this->shouldLogIn() ) {
			if ( !$this->login() ) {
				throw new Exception( 'Login failed.' );
			}
		}

		// edit page
		$options = array(
			'postData' => array(
				'action' => 'edit',
				'title' => $articleName,
				'section' => $section,
				'sectiontitle' => $sectionTitle, // change to be subject of form submit
				'text' => $text, // change to be message of form submit + incl UA (See old post method)
				'token' => $this->getEditToken( $articleName ),
				'bot' => true,
				'md5' => md5( $text ),
				'format' => 'json',
				// use timestamp options?
			),
			'method' => 'POST',
		);
		$req = MwHttpRequest::factory( $this->getUrl(), $options );
		$req->setCookieJar( $this->getCookieJar() );
		$status = $req->execute();
		if ( !$status->isGood() ) {
			return false;
		}
		$req->getContent();
		return true;
	}

	public function shouldLogIn() {
		if ( !$this->loggedIn && isset( $this->username ) && isset( $this->password ) ) {
			return true;
		}
		return false;
	}
}
