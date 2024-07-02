<?php

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

namespace MobileFrontend\Amc;

use MediaWiki\ChangeTags\Hook\ChangeTagsListActiveHook;
use MediaWiki\ChangeTags\Hook\ListDefinedTagsHook;
use MediaWiki\ChangeTags\Taggable;
use MediaWiki\Hook\ManualLogEntryBeforePublishHook;
use MediaWiki\Hook\RecentChange_saveHook;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\User\Hook\UserGetDefaultOptionsHook;
use MediaWiki\User\User;
use MediaWiki\User\UserFactory;
use MediaWiki\User\UserIdentity;

/**
 * Hooks for Advanced Mobile Contributions
 *
 * @package MobileFrontend\Amc
 */
final class Hooks implements
	ListDefinedTagsHook,
	ChangeTagsListActiveHook,
	RecentChange_saveHook,
	GetPreferencesHook,
	UserGetDefaultOptionsHook,
	ManualLogEntryBeforePublishHook
{
	private UserFactory $userFactory;

	public function __construct(
		UserFactory $userFactory
	) {
		$this->userFactory = $userFactory;
	}

	/**
	 * Helper method to tag objects like Logs or Recent changes
	 * @param Taggable $taggable
	 * @param UserIdentity $performer
	 * @return bool
	 */
	private static function injectTagsIfPerformerUsesAMC( Taggable $taggable, UserIdentity $performer ) {
		$userMode = UserMode::newForUser( $performer );
		if ( $userMode->isEnabled() ) {
			$taggable->addTags( [ Manager::AMC_EDIT_TAG ] );
		}
		return true;
	}

	/**
	 * Register default preference value for AMC opt-in
	 *
	 * @param array &$defaultUserOptions Reference to default options array
	 */
	public function onUserGetDefaultOptions( &$defaultUserOptions ) {
		$defaultUserOptions[UserMode::USER_OPTION_MODE_AMC] = UserMode::OPTION_DISABLED;
	}

	/**
	 * Register AMC preference
	 * @param User $user
	 * @param array &$preferences
	 */
	public function onGetPreferences( $user, &$preferences ) {
		$preferences[UserMode::USER_OPTION_MODE_AMC] = [
			'type' => 'api',
			'default' => UserMode::OPTION_DISABLED
		];
	}

	/**
	 * ListDefinedTags hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 *
	 * @param array &$tags The list of tags. Add your extension's tags to this array.
	 */
	public function onListDefinedTags( &$tags ) {
		$tags[] = Manager::AMC_EDIT_TAG;
	}

	/**
	 * ChangeTagsListActive hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ChangeTagsListActive
	 *
	 * @param array &$tags The list of tags. Add your extension's tags to this array.
	 */
	public function onChangeTagsListActive( &$tags ) {
		$tags[] = Manager::AMC_EDIT_TAG;
	}

	/**
	 * ManualLogEntryBeforePublish hook handler that tags actions logged when user uses AMC mode
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ManualLogEntryBeforePublish
	 *
	 * @param \ManualLogEntry $logEntry
	 */
	public function onManualLogEntryBeforePublish( $logEntry ): void {
		$performer = $this->userFactory->
			newFromUserIdentity( $logEntry->getPerformerIdentity() );
		self::injectTagsIfPerformerUsesAMC( $logEntry, $performer );
	}

	/**
	 * RecentChange_save hook handler that tags changes performed when user uses AMC mode
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RecentChange_save
	 *
	 * @param \RecentChange $rc
	 */
	public function onRecentChange_save( $rc ) {
		// To be safe, we should use the User objected provided via RecentChange, not the
		// currently logged-in user.
		self::injectTagsIfPerformerUsesAMC( $rc, $rc->getPerformerIdentity() );
	}
}
