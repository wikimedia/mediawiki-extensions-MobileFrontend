#!/usr/bin/env bash
set -eu

mkdir -p .storybook/resolve-less-imports
mkdir -p .storybook/resolve-less-imports/mediawiki.ui

# Fetch resources via curl, `-sSL` silently, Show only errors, Location header and also on a 3XX response code.
# MediaWiki skin LESS variables, defaults in core
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.skin.defaults.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.skin.defaults.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.skin.variables.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.skin.variables.less

# MediaWiki LESS mixins
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.mixins.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.mixins.less

# mediawiki.ui LESS mixins
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.ui/mixins.buttons.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui/mixins.buttons.less

# mediawiki.ui variables
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.ui/variables.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui/variables.less

# mediawiki.ui icons
curl -sSL "https://en.wikipedia.org/w/load.php?modules=mediawiki.ui.icon&debug=true&only=styles" > .storybook/icons.less


# mediawiki ui
mkdir -p .storybook/resolve-less-imports/mediawiki.ui.button
mkdir -p .storybook/resolve-less-imports/mediawiki.ui.anchor
mkdir -p .storybook/resolve-less-imports/mediawiki.ui.input
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.ui.button/button.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui.button/button.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.ui.anchor/anchor.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui.anchor/anchor.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.ui.input/input.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui.input/input.less

# mediawiki skinning modules
mkdir -p .storybook/mediawiki.skinning
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.skinning/messageBoxes.less?format=TEXT" | base64 --decode > .storybook/mediawiki.skinning/messageBoxes.less

# Minerva LESS
mkdir -p .storybook/mediawiki-skins-MinervaNeue
mkdir -p .storybook/mediawiki-skins-MinervaNeue/minerva.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/minerva.less/minerva.variables.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.variables.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/minerva.less/minerva.mixins.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.mixins.less

# Minerva skinStyles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/skinStyles/mobile.startup/drawers.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/drawers.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/skinStyles/mobile.startup/Overlay.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/skinStyles/mobile.startup/search/SearchOverlay.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search/SearchOverlay.less

# Minerva UI
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/content
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/content/tablet
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/resources/skins.minerva.base.styles/ui.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/ui.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/resources/skins.minerva.base.styles/content/tablet/common.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/content/tablet/common.less
