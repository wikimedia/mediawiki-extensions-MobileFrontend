#!/usr/bin/env bash
echo "Important: This should not be running in npm run doc. Please commit any changes you see in .storybook after running this script."
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.mixins.less -o .storybook/resolve-less-imports/mediawiki.mixins
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.ui/variables.less -o .storybook/resolve-less-imports/mediawiki.ui/variables.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.less/mediawiki.ui/mixins.buttons.less -o .storybook/resolve-less-imports/mediawiki.ui/mixins.buttons

# mediawiki ui
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/buttons.less -o .storybook/resolve-less-imports/mediawiki.ui/components/buttons.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/icons.less -o .storybook/resolve-less-imports/mediawiki.ui/components/icons.less
curl https://raw.githubusercontent.com/wikimedia/mediawiki/master/resources/src/mediawiki.ui/components/anchors.less -o .storybook/resolve-less-imports/mediawiki.ui/components/anchors.less
