#!/usr/bin/env bash
set -eu

mkdir -p .storybook/resolve-less-imports

# Fetch resources via curl, `-sSL` silently, Show only errors, Location header and also on a 3XX response code.
# MediaWiki skin LESS variables, defaults in core
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.skin.defaults.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.skin.defaults.less.tmp
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.skin.variables.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.skin.variables.less
sed "s/..\/..\/lib\/codex/@wikimedia\/codex/g" .storybook/resolve-less-imports/mediawiki.skin.defaults.less.tmp > .storybook/resolve-less-imports/mediawiki.skin.defaults.less

# MediaWiki LESS mixins
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.less/mediawiki.mixins.less?format=TEXT" | base64 --decode > .storybook/resolve-less-imports/mediawiki.mixins.less

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
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/resources/skins.minerva.base.styles/icons.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/icons.less
curl -sSL "https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/skins/MinervaNeue/+/master/resources/skins.minerva.base.styles/content/tablet/common.less?format=TEXT" | base64 --decode > .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/content/tablet/common.less
