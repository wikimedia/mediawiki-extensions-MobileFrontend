#!/usr/bin/env bash
set -eu

mkdir -p .storybook/resolve-less-imports
mkdir -p .storybook/resolve-less-imports/mediawiki.ui
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.mixins.less -o .storybook/resolve-less-imports/mediawiki.mixins.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.mixins.animation.less -o .storybook/resolve-less-imports/mediawiki.mixins.animation.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.ui/variables.less -o .storybook/resolve-less-imports/mediawiki.ui/variables.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.ui/mixins.buttons.less -o .storybook/resolve-less-imports/mediawiki.ui/mixins.buttons.less

# mediawiki ui
mkdir -p .storybook/resolve-less-imports/mediawiki.ui/components
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/buttons.less -o .storybook/resolve-less-imports/mediawiki.ui/components/buttons.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/anchors.less -o .storybook/resolve-less-imports/mediawiki.ui/components/anchors.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/inputs.less -o .storybook/resolve-less-imports/mediawiki.ui/components/inputs.less

# Minerva LESS
mkdir -p .storybook/mediawiki-skins-MinervaNeue
mkdir -p .storybook/mediawiki-skins-MinervaNeue/minerva.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/minerva.less/minerva.variables.less -o .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.variables.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/minerva.less/minerva.mixins.less -o .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.mixins.less

# Minerva skinStyles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mediawiki.ui.icon
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup
mkdir -p .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mobile.startup/drawers.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/drawers.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mobile.startup/Overlay.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mobile.startup/search/SearchOverlay.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search/SearchOverlay.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mediawiki.ui.icon/mediawiki.ui.icon.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mediawiki.ui.icon/mediawiki.ui.icon.less

# Minerva UI
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.content.styles
mkdir -p .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.content.styles/tablet
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/resources/skins.minerva.base.styles/ui.less -o .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/ui.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/resources/skins.minerva.content.styles/tablet/common.less -o .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.content.styles/tablet/common.less
