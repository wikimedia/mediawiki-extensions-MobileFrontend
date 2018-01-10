<?php

/**
 * Copyright (c) 2011 Patrick Reilly
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 */

namespace MobileFrontend\Devices;

use WebRequest;

/**
 * Detects the properties of the device that's making the request on behalf of
 * the user.
 *
 * @see DeviceProperties
 */
interface DeviceDetector {

	/**
	 * Report, if possible, the properties of the device that's being used to
	 * access the wiki.
	 *
	 * Because `WebRequest` doesn't currently provide read-only access to the
	 * `$_SERVER` superglobal within its API, it's expected to be passed as
	 * additional context.
	 *
	 * @param WebRequest $request for the current page view. The HTTP headers of this request
	 *  will be used to determine whether the page view should redirect to mobile
	 * @param array $server Per the above, the `$_SERVER` superglobal
	 * @return DeviceProperties|null
	 */
	public function detectDeviceProperties( WebRequest $request, array $server );
}
