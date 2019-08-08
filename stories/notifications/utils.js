/* global $ */
// eslint-disable-next-line no-jquery/no-parse-html-literal
const $notificationWrapperElement = $(
	'<div>mw-echo-notificationsWrapper provided and styled by Echo extension.</div>'
);

function FakeEchoController() {}
FakeEchoController.prototype = {
	updateSeenTime: () => {},
	manager: {
		hasLocalUnread: () => true,
		markLocalNotificationsRead: () => Promise.resolve( {} ),
		getLocalUnread: () => {
			return [];
		},
		getUnreadCounter: () => {
			return {
				getCappedNotificationCount: function () {
					return 100;
				}
			};
		}
	}
};

export const fakeEcho = {
	config: {},
	ui: {
		NotificationsWrapper: () => {
			return {
				$element: $notificationWrapperElement,
				populate: () => Promise.resolve( {} )
			};
		}
	},
	Controller: FakeEchoController,
	dm: {
		ModelManager: () => {
			return {
				on: () => {}
			};
		},
		UnreadNotificationCounter: () => {
			return {
				on: () => {}
			};
		}
	},
	api: {
		EchoApi: () => {}
	}
};
