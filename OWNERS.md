# Code ownership for MobileFrontend

While overall architecture and vision of this repository is owned by the
[Reader Growth team][1], various folders are maintained by different teams.
This file helps identify appropriate Phabricator tags and teams.

## MobileFrontend core

Core architecture of MobileFrontend. Responsible for switching out mobile skin
on mobile devices; insertion of mobile / desktop view links at bottom of page;
support for web manifests; PHP redirect classes for historical special pages.

* Since: Sept 2025
* Files:
  - /includes/Api/ApiWebappManifest.php
  - /includes/BaseDomainExtractorInterface.php
  - /includes/MobileContext.php
  - /includes/MobileFrontendHooks.php
  - /includes/MobileFrontendSkinHooks.php
  - /includes/ServiceWiring.php
  - /includes/WMFBaseDomainExtractor.php
  - /tests/phpunit/Utils.php
  - /tests/phpunit/integration/MobileFrontendSkinHooksTest.php
  - /tests/phpunit/integration/WMFBaseDomainExtractorTest.php
  - /tests/phpunit/structure/OwnersStructureTest.php
  - includes/ResourceLoaderModules/MobileConfig.php
  - /includes/specials/SpecialMobileDiff.php
  - /includes/specials/SpecialMobileHistory.php
  - /includes/specials/SpecialMobileLanguages.php
  - /includes/specials/SpecialUploads.php
  - /tests/phpunit/unit/HookRunnerTest.php
* Folders:
  - /includes/ContentProviders
  - /includes/Devices
  - /includes/Features
  - /includes/Hooks
  - /tests/phpunit/integration/devices/
  - /tests/phpunit/integration/specials
  - /tests/phpunit/unit/content-providers
  - /tests/phpunit/unit/devices/
* Contact: [Reader Growth][1]
* Phabricator: https://phabricator.wikimedia.org/project/view/8174/

## MobileFrontend MobileFormatter
Modifies parser content for mobile devices to support lazy loading images;
moving the lead paragraph before infoboxes; section collapsing; removing mobile
incompatible content (via `.nomobile` class); injection of Wikidata descriptions
into articles; and modifications to user pages.

* Since: Sept 2025
* Files:
  - /includes/Api/ApiParseExtender.php
  - /includes/ExtMobileFrontend.php
  - /includes/MobileFormatter.php
  - /includes/templates/UserPageCta.mustache
  - /tests/node-qunit/mobile.init/Toggler.test.js
  - /tests/node-qunit/mobile.init/sectionCollapsing.test.js
  - /tests/phpunit/integration/MobileContextTest.php
  - /tests/phpunit/integration/MobileFormatterTest.php
  - /tests/phpunit/integration/api/ApiParseExtenderTest.php
  - /tests/phpunit/integration/context/MobileContextShouldDisplayMobileViewIntegrationTest.php
  - /tests/phpunit/integration/context/MobileContextWikibaseDescriptionsTest.php
  - /resources/mobile.init.styles/main.less
* Folders:
  - /includes/Transforms
  - /resources/mobile.init/
  - /resources/mobile.quickFacts
  - /resources/mobile.userpage.styles
  - /tests/phpunit/unit/transforms
* Contact: [Reader Growth][1]
* Phabricator: https://phabricator.wikimedia.org/project/view/8173/

## Mobile ResourceLoaderModules

Disables MediaWiki:Common.js from running on mobile site.

* Since: Sept 2025
* Folders:
  - /includes/ResourceLoaderModules
  - /tests/phpunit/integration/rlmodules
* Contact: [Reader Growth][1]
* Phabricator: https://phabricator.wikimedia.org/project/view/8280/

## Feature detection and Advanced mobile contributions mode

Provides an advanced mode for logged in users and encourages logged in users to use.

* Since: Sept 2025
* Folders:
  - /includes/Amc
  - /tests/phpunit/integration/amc/
  - /tests/phpunit/integration/features/
  - /tests/phpunit/integration/transforms
  - /tests/phpunit/unit/amc/
  - /tests/phpunit/unit/features
* Contact: [Reader Growth][1]
* Phabricator: https://phabricator.wikimedia.org/project/view/8175/


## MobileFrontend JavaScript core library

Deprecated MobileFrontend JS library. This should be decomissioned in favor of
Codex and upstreaming useful utility functionality to MediaWiki core.

* Since: Sept 2025
* Files:
  - /tests/node-qunit/importable.test.js
  - /tests/phpunit/structure/MobileFrontendBundleSizeTest.php
* Folders:
  - /tests/node-qunit/utils
  - /resources/mobile.startup
  - /tests/node-qunit/mobile.startup
* Contact: [Readers Growth][1]
* Phabricator: https://phabricator.wikimedia.org/project/view/8172/

## MobileFrontend citation drawer (reference drawer)

Pops up a reference drawer in article when a reference is clicked. At some point
should be handled by Extension:Popups or Extension:Cite.

* Since: Sept 2025
* Folders:
  - /resources/mobile.startup/references
  - /tests/node-qunit/mobile.startup/references
* Contact: [Readers Growth][1]
* Phabricator: https://phabricator.wikimedia.org/project/view/8171/


## MobileFrontend editor

The editor.

* Since: Sept 2025
* Files:
  - /includes/Api/ApiEditPageExtender.php
  - /includes/MobileFrontendEditorHooks.php
  - /tests/phpunit/integration/MobileFrontendHooksTest.php
  - /tests/node-qunit/mobile.init/editorLoadingOverlay.test.js
  - /tests/node-qunit/mobile.init/fakeToolbar.test.js
  - resources/mobile.init.styles/editor.less
* Folders:
  - /resources/mobile.editor.overlay
  - /resources/mobile.returnToApp
  - /resources/mobile.init/editor
  - /tests/node-qunit/mobile.returnToApp
  - /tests/node-qunit/mobile.editor.overlay/
* Contact: [Editing Team][2]
* Phabricator: https://phabricator.wikimedia.org/project/view/5654/

## Special:MobileOptions

Provides client side settings and user preference setting.

* Since: Sept 2025
* Files:
  - /resources/mobile.special.mobileoptions.scripts.js
  - /tests/node-qunit/mobile.special.mobileoptions.test.js
  - /includes/specials/SpecialMobileOptions.php
* Folders:
  - /resources/lib/mediawiki.skins.clientpreferences
  - /resources/mobile.special.mobileoptions.styles
* Contact: [Reader Experience][4]
* Phabricator: https://phabricator.wikimedia.org/project/view/8167/

## Mobile special page styles / scripts

This module shouldn't exist and styles here should be upstreamed to MediaWiki
core.  It applies globally to all special pages to make them a little more
mobile friendly and is an artifact of the past. Automatically checks "remember
my login" for mobile users.

* Since: Sept 2025
* Files:
  - /resources/mobile.special.userlogin.scripts.js
* Folders:
  - /resources/mobile.special.styles/
* Contact: [Reader Growth][1]
* Phabricator: https://phabricator.wikimedia.org/project/view/3707/

## Mobile editing anon warning experiment (T408484)

AB test code for a redesigned experience for the editing anon warning
that seeks to improve account and signup conversion rates. After experiment
results are analyzed a single experience for the anon warning should remain.

* Since: Jan 2026
* Files:
  - resources/mobile.editor.overlay/editor.less
  - resources/mobile.editor.overlay/EditorOverlayBase.js
  - resources/mobile.editor.overlay/SourceEditorOverlay.js
  - resources/mobile.editor.overlay/VisualEditorOverlay.js
* Contact: [Growth][5]
* Phabricator: https://phabricator.wikimedia.org/project/view/1114/

[1]: https://www.mediawiki.org/wiki/Readers/Reader_Growth
[2]: https://www.mediawiki.org/wiki/Editing_team
[3]: https://www.mediawiki.org/wiki/Wikimedia_Language_and_Product_Localization
[4]: https://www.mediawiki.org/wiki/Readers/Reader_Experience
[5]: https://www.mediawiki.org/wiki/Growth
