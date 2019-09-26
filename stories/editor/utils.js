/* eslint-disable valid-jsdoc */
import util from '../../src/mobile.startup/util';
import { previewResponse, revisionResponse,
	abuseFilterWarning, abuseFilterDisallowed, spamBlacklist, editConflict, readOnly, captcha,
	blockResponse, saveSuccessResponse } from './data';

/**
 * @param {Function} onSave what happens when you save
 * @param {Function} [onPreview] what happens when you preview
 * @param {Function} [onGet] what happens when you request wikitext content
 */
const makeFakeApi = ( onSave, onPreview, onGet ) => {
	return {
		// save
		postWithToken: onSave,
		// previews
		post: onPreview || ( () => util.Deferred().resolve( previewResponse ) ),
		// get
		get: onGet || ( () => Promise.resolve( revisionResponse ) )
	};
};

export const fakeApi = makeFakeApi(
	() => util.Deferred().resolve( saveSuccessResponse ),
	() => util.Deferred().resolve( previewResponse ),
	() => Promise.resolve( revisionResponse )
);

export const abuseFilterWarningApi = makeFakeApi(
	() => util.Deferred().resolve( abuseFilterWarning )
);

export const abuseFilterDisallowedApi = makeFakeApi(
	() => util.Deferred().resolve( abuseFilterDisallowed )
);

export const abuseFilterSpamApi = makeFakeApi(
	() => util.Deferred().resolve( spamBlacklist )
);

export const editConflictApi = makeFakeApi(
	() => util.Deferred().resolve( editConflict )
);

export const readOnlyApi = makeFakeApi(
	() => util.Deferred().resolve( readOnly )
);

export const triggerCaptchaApi = makeFakeApi(
	( _token, data ) => {
		if ( data.captchaword === 'captcha' ) {
			return util.Deferred().resolve( saveSuccessResponse );
		} else {
			return util.Deferred().resolve( captcha );
		}
	}
);

export const fakeFailToSaveApi = makeFakeApi(
	() => util.Deferred().resolve( blockResponse )
);

export const blockedApi = makeFakeApi(
	null,
	null,
	() => Promise.resolve( blockResponse )
);
