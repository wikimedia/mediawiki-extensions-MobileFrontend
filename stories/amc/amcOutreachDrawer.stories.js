import amcOutreachDrawer from '../../src/mobile.startup/amcOutreach/amcOutreachDrawer';
import { action } from '@storybook/addon-actions';
import '../../resources/mobile.startup/amcOutreach/amcOutreachDrawer.less';

export default {
	title: 'amc'
};

export const OutreachDrawer = () => {
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
		// toast
		{
			showOnPageReload: action( 'showOnPageReload' ),
			show: action( 'show' )
		},
		'csrfToken',
		action( 'onBeforeHide' ),
		'title'
	);
	drawer.show();
	return drawer.$el[0];
};

OutreachDrawer.story = {
	name: 'outreachDrawer'
};
