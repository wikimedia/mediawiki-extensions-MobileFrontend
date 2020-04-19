<?php

namespace MobileFrontend\AMC;

use MediaWiki\ChangeTags\Taggable;
use User;

/**
 * Hooks for Advanced Mobile Contributions
 *
 * @package MobileFrontend\AMC
 */
final class Hooks {

	/**
	 * Helper method to tag objects like Logs or Recent changes
	 * @param Taggable $taggable
	 * @param \User $performer
	 * @return bool
	 */
	private static function injectTagsIfPerformerUsesAMC( Taggable $taggable, \User $performer ) {
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
	public static function onUserGetDefaultOptions( &$defaultUserOptions ) {
		$defaultUserOptions[UserMode::USER_OPTION_MODE_AMC] = UserMode::OPTION_DISABLED;
	}

	/**
	 * Register AMC preference
	 * @param User $user
	 * @param array &$preferences
	 */
	public static function onGetPreferences( User $user, array &$preferences ) {
		$preferences[ UserMode::USER_OPTION_MODE_AMC ] = [
			'type' => 'api',
			'default' => UserMode::OPTION_DISABLED
		];
	}

	/**
	 * ListDefinedTags and ChangeTagsListActive hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ChangeTagsListActive
	 *
	 * @param array &$tags The list of tags. Add your extension's tags to this array.
	 * @return bool
	 */
	public static function onListDefinedTags( &$tags ) {
		$tags[] = Manager::AMC_EDIT_TAG;
		return true;
	}

	/**
	 * ManualLogEntryBeforePublish hook handler that tags actions logged when user uses AMC mode
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ManualLogEntryBeforePublish
	 *
	 * @param \ManualLogEntry $logEntry
	 */
	public static function onManualLogEntryBeforePublish( \ManualLogEntry $logEntry ) {
		self::injectTagsIfPerformerUsesAMC( $logEntry, $logEntry->getPerformer() );
	}

	/**
	 * RecentChange_save hook handler that tags changes performed when user uses AMC mode
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RecentChange_save
	 *
	 * @param \RecentChange $rc
	 */
	public static function onRecentChangeSave( \RecentChange $rc ) {
		try {
			// To be safe, we should use the User objected provided via RecentChange, not the
			// currently logged-in user.
			self::injectTagsIfPerformerUsesAMC( $rc, $rc->getPerformer() );
		} catch ( \MWException $exception ) {
			// ignore when performer is not found
		}
	}
}
