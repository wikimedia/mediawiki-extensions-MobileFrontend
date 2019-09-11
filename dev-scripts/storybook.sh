#!/usr/bin/env bash
echo "Important: This should not be running in npm run doc. Please commit any changes you see in .storybook after running this script."
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.mixins.less -o .storybook/resolve-less-imports/mediawiki.mixins
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.mixins.animation.less -o .storybook/resolve-less-imports/mediawiki.mixins.animation.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.ui/variables.less -o .storybook/resolve-less-imports/mediawiki.ui/variables.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.ui/mixins.buttons.less -o .storybook/resolve-less-imports/mediawiki.ui/mixins.buttons

# mediawiki ui
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/buttons.less -o .storybook/resolve-less-imports/mediawiki.ui/components/buttons.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/anchors.less -o .storybook/resolve-less-imports/mediawiki.ui/components/anchors.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/inputs.less -o .storybook/resolve-less-imports/mediawiki.ui/components/inputs.less

# Minerva LESS
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/minerva.less/minerva.variables.less -o .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.variables.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/minerva.less/minerva.mixins.less -o .storybook/mediawiki-skins-MinervaNeue/minerva.less/minerva.mixins.less

# Minerva skinStyles
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mobile.startup/drawers.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/drawers.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mobile.startup/Overlay.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/Overlay.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mobile.startup/search/SearchOverlay.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search/SearchOverlay.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/skinStyles/mediawiki.ui.icon/mediawiki.ui.icon.less -o .storybook/mediawiki-skins-MinervaNeue/skinStyles/mediawiki.ui.icon/mediawiki.ui.icon.less

# Minerva UI
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/resources/skins.minerva.base.styles/ui.less -o .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.base.styles/ui.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki-skins-MinervaNeue/master/resources/skins.minerva.content.styles/tablet/common.less -o .storybook/mediawiki-skins-MinervaNeue/resources/skins.minerva.content.styles/tablet/common.less
