<?php

class SpecialMobileDiff extends UnlistedSpecialMobilePage {
	private $revId;
	/** @var Revision */
	private $rev;
	/** @var Revision */
	private $prevRev;
	/** @var Title */
	private $targetTitle;

	public function __construct() {
		parent::__construct( 'MobileDiff' );
	}

	function execute( $par ) {
		$output = $this->getOutput();

		$this->revId = intval( $par );
		$rev = Revision::newFromId( $this->revId );
		$this->rev = $rev;
		if ( !$rev ) {
			wfHttpError( 404, $this->msg( 'mobile-frontend-diffview-404-title' )->text(),
				$this->msg( 'mobile-frontend-diffview-404-desc' )->text() );
			return;
		}
		$this->prevRev = $this->rev->getPrevious();
		$this->targetTitle = $this->rev->getTitle();

		$output->setPageTitle( $this->msg( 'mobile-frontend-diffview-title', $this->targetTitle->getPrefixedText() ) );

		$output->addModules( 'mobile.watchlist' );

		$output->addHtml( '<div id="mw-mf-diffview"><div id="mw-mf-diffarea">' );

		$this->showHeader();
		$this->showDiff();
		$output->addHtml( '</div>' );

		$this->showFooter();

		$output->addHtml( '</div>' );
	}

	function showHeader() {
		$title = $this->targetTitle;

		if ( $this->prevRev ) {
			$bytesChanged = $this->rev->getSize() - $this->prevRev->getSize();
		} else {
			$bytesChanged = $this->rev->getSize();
		}
		if ( $bytesChanged >= 0 ) {
			$changeMsg = 'mobile-frontend-diffview-bytesadded';
			$sizeClass = 'mw-mf-bytesadded';
		} else {
			$changeMsg = 'mobile-frontend-diffview-bytesremoved';
			$sizeClass = 'mw-mf-bytesremoved';
			$bytesChanged = abs( $bytesChanged );
		}

		$ts = new MWTimestamp( $this->rev->getTimestamp() );
		$this->getOutput()->addHtml(
			Html::openElement( 'div', array( 'id' => 'mw-mf-diff-info' ) ) .
				Html::openElement( 'h2', array() ) .
				Html::element( 'a',
					array(
						'href' => $title->getLocalURL(),
					),
					$title->getPrefixedText()
				).
				Html::closeElement( 'h2' ) .
				Html::element( 'span', array( 'class' => $sizeClass ), $this->msg( $changeMsg, $bytesChanged )->text() ) .
				', ' .
				Html::element( 'span', array( 'class' => 'mw-mf-diff-date' ), $ts->getHumanTimestamp() ) .
			Html::closeElement( 'div' ) .
			Html::element( 'div', array( 'id' => 'mw-mf-diff-comment' ), $this->rev->getComment() )
		);
	}

	function showDiff() {
		if ( $this->prevRev ) {
			$prevId = $this->prevRev->getId();
			$contentHandler = $this->rev->getContentHandler();
			$de = $contentHandler->createDifferenceEngine( $this->getContext(), $prevId, $this->revId );
			$diff = $de->getDiffBody();
			$processedDiff = $this->processDiff( $diff );
		} else {
			$processedDiff = '<ins>' . htmlspecialchars( $this->rev->getText() ) . '</ins>';
		}
		$this->getOutput()->addHtml(
			'<div id="mw-mf-minidiff">' .
			$processedDiff .
			'</div>'
		);
	}

	function processDiff( $diff ) {
		$out = '';

		// haaaacccckkkkk
		$doc = new DOMDocument();
		$doc->loadHtml( '<?xml encoding="utf-8">' . $diff );
		$xpath = new DOMXpath( $doc );
		$els = $xpath->query( "//td[@class='diff-deletedline'] | //td[@class='diff-addedline']" );
		$out .= Html::element( 'div', array( 'class' => 'heading' ),
			$this->msg( 'mobile-frontend-diffview-explained' )->plain() );
		/** @var $el DOMElement */
		foreach( $els as $el ) {
			$name = $el->nodeName;
			$class = $el->getAttribute( 'class' );
			if ( $class === 'diff-deletedline' ) {
				$out .= Html::element( 'del', array(), $el->nodeValue );
			} else {
				$out .= Html::element( 'ins', array(), $el->nodeValue );
			}
		}

		return $out;
	}

	function showFooter() {
		$output = $this->getOutput();

		$output->addHtml(
			Html::openElement( 'div', array( 'id' => 'mw-mf-userinfo',
				'class' => 'position-fixed' ) )
		);

		$userId = $this->rev->getUser();
		if ( $userId ) {
			$user = User::newFromId( $userId );
			$edits = $user->getEditCount();
			$output->addHtml(
				'<div class="mw-mf-user">' .
					Linker::link( $user->getUserPage(), htmlspecialchars( $user->getName() ) ) .
				'</div>' .
				'<div class="mw-mf-roles">' .
					$this->listGroups( $user ) .
				'</div>' .
				'<div class="mw-mf-edit-count">' .
					$this->msg( 'mobile-frontend-diffview-editcount', '<div>' . $this->getLanguage()->formatNum( $edits ) . '</div>' )->parse() .
				'</div>'
			);
		} else {
			$ipAddr = $this->rev->getUserText();
			$userPage = Title::makeTitle( NS_USER, $ipAddr );
			$output->addHtml(
				'<div class="mw-mf-user mw-mf-anon">' .
					$this->msg( 'mobile-frontend-diffview-anonymous' )->escaped() .
				'</div>' .
				'<div>' .
					Linker::link( $userPage, htmlspecialchars( $ipAddr ) ) .
				'</div>'
			);
		}

		$output->addHtml(
			Html::closeElement( 'div' )
		);
	}

	function listGroups( User $user ) {
		# Get groups to which the user belongs
		$userGroups = $user->getGroups();
		$userMembers = array();
		foreach ( $userGroups as $n => $ug ) {
			$memberName = User::getGroupMember( $ug, $user->getName() );
			if ( $n == 0 ) {
				$memberName = $this->getLanguage()->ucfirst( $memberName );
			}
			$userMembers[] = User::makeGroupLinkHTML( $ug, $memberName );
		}

		return $this->getLanguage()->commaList( $userMembers );
	}
}
