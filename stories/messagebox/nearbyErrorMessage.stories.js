import nearbyErrorMessage from '../../src/mobile.special.nearby.scripts/nearbyErrorMessage.js';
import '../../resources/mobile.special.nearby.styles/specialNearby.less';
import '../../.storybook/mediawiki.skinning/messageBoxes.less';

export default {
	title: 'messagebox'
};

export const NearbyErrorMessagePermission = () =>
	nearbyErrorMessage( 'permission' ).$el[0];

NearbyErrorMessagePermission.story = {
	name: 'nearbyErrorMessage (permission)'
};

export const NearbyErrorMessageLocation = () =>
	nearbyErrorMessage( 'location' ).$el[0];

NearbyErrorMessageLocation.story = {
	name: 'nearbyErrorMessage (location)'
};

export const NearbyErrorMessageEmpty = () => nearbyErrorMessage( 'empty' ).$el[0];

NearbyErrorMessageEmpty.story = {
	name: 'nearbyErrorMessage (empty)'
};

export const NearbyErrorMessageHttp = () => nearbyErrorMessage( 'http' ).$el[0];

NearbyErrorMessageHttp.story = {
	name: 'nearbyErrorMessage (http)'
};

export const NearbyErrorMessageIncompatible = () =>
	nearbyErrorMessage( 'incompatible' ).$el[0];

NearbyErrorMessageIncompatible.story = {
	name: 'nearbyErrorMessage (incompatible)'
};

export const NearbyErrorMessageDefault = () =>
	nearbyErrorMessage( 'blah' ).$el[0];

NearbyErrorMessageDefault.story = {
	name: 'nearbyErrorMessage (default)'
};
