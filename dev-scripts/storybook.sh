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
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.mixins.animation.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.mixins.animation.less

# mediawiki.ui LESS mixins
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.ui/mixins.buttons.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui/mixins.buttons.less

# mediawiki.ui variables
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.ui/variables.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui/variables.less

# mediawiki ui
mkdir -p .storybook/resolve-less-imports/mediawiki.ui/components
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.ui/components/buttons.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui/components/buttons.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.ui/components/anchors.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui/components/anchors.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.ui/components/inputs.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.ui/components/inputs.less

# Minerva LESS
mkdir -p .storybook/mediawiki-skins-MinervaNeue
mkdir -p .storybook/mediawiki-skins-MinervaNeue/minerva.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/minerva.less/minerva.variables.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.variables.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/minerva.less/minerva.mixins.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.mixins.less

# Minerva skinStyles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mediawiki.ui.icon
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/skinStyles/mobile.startup/drawers.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/drawers.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/skinStyles/mobile.startup/Overlay.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/skinStyles/mobile.startup/search/SearchOverlay.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search/SearchOverlay.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/skinStyles/mediawiki.ui.icon/mediawiki.ui.icon.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/skinStyles/mediawiki.ui.icon/mediawiki.ui.icon.less

# Minerva UI
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.content.styles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.content.styles/tablet
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/resources/skins.minerva.base.styles/ui.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/ui.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/resources/skins.minerva.content.styles/tablet/common.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.content.styles/tablet/common.less
