import util from '../../src/mobile.startup/util';
import { previewResponse, revisionResponse,
	blockResponse, saveSuccessResponse } from './data';

export const fakeApi = {
	// save
	postWithToken: () => util.Deferred().resolve( saveSuccessResponse ),
	// previews
	post: () => util.Deferred().resolve( previewResponse ),
	// get
	get: () => Promise.resolve( revisionResponse )
};

export const fakeFailToSaveApi = {
	// save
	postWithToken: () => util.Deferred().resolve( blockResponse ),
	// previews
	post: () => util.Deferred().resolve( previewResponse ),
	// get
	get: () => Promise.resolve( revisionResponse )
};

export const blockedApi = {
	// get
	get: () => Promise.resolve( blockResponse )
};
