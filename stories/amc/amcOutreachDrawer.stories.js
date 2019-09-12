import { storiesOf } from '@storybook/html';
import amcOutreachDrawer from '../../src/mobile.amcOutreachDrawer/amcOutreachDrawer';
import { action } from '@storybook/addon-actions';
import '../../resources/mobile.amcOutreachDrawer/amcOutreachDrawer.less';

storiesOf( 'amc' )
	.add( 'outreachDrawer',
		() => {
			const drawer = amcOutreachDrawer(
				'action',
				{
					showIfEligible: () => {},
					makeActionIneligible: () => {},
					makeAllActionsIneligible: () => {},
					isCampaignActive: () => {}
				},
				mw.message,
				mw.util,
				{},
				// toast
				{
					showOnPageReload: action( 'showOnPageReload' ),
					show: action( 'show' )
				},
				'blah'
			);
			drawer.show();
			return drawer.$el[0];
		}
	);
