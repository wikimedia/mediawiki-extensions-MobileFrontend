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
 * Detect mobile and tablet devices by testing whether the User-Agent request
 * header matches a list of regular expressions.
 */
class UADeviceDetector implements DeviceDetector {

	/**
	 * @inheritDoc
	 */
	public function detectDeviceProperties( WebRequest $request, array $server ) {
		$userAgent = $request->getHeader( 'User-Agent' );

		return new DeviceProperties(
			$this->detectMobileDevice( $userAgent ),
			$this->detectTabletDevice( $userAgent )
		);
	}

	/**
	 * Tests whether the UA is known to be sent on behalf of users using a mobile
	 * device.
	 *
	 * @author Patrick Reilly
	 *
	 * @param string $userAgent
	 * @return bool
	 */
	private function detectMobileDevice( $userAgent ) {
		$patterns = [
			'mobi',
			'240x240',
			'240x320',
			'320x320',
			'alcatel',
			'android',
			'audiovox',
			'bada',
			'benq',
			'blackberry',
			'cdm-',
			'compal-',
			'docomo',
			'ericsson',
			'hiptop',
			'htc[-_]',
			'huawei',
			'ipod',
			'kddi-',
			'kindle',
			'meego',
			'midp',
			'mitsu',
			'mmp\/',
			'mot-',
			'motor',
			'ngm_',
			'nintendo',
			'opera.m',
			'palm',
			'panasonic',
			'philips',
			'phone',
			'playstation',
			'portalmmm',
			'sagem-',
			'samsung',
			'sanyo',
			'sec-',
			'sendo',
			'sharp',
			'silk',
			'softbank',
			'symbian',
			'teleca',
			'up.browser',
			'webos',
		];
		$patternsStart = [
			'lg-',
			'sie-',
			'nec-',
			'lge-',
			'sgh-',
			'pg-',
		];
		$regex = '/^(' . implode( '|', $patternsStart ) . ')|(' . implode( '|', $patterns ) . ')/i';
		$exceptionRegex = '/SMART-TV.*SamsungBrowser/';

		return preg_match( $regex, $userAgent )
			&& !preg_match( $exceptionRegex, $userAgent );
	}

	/**
	 * Tests whether the UA is known to be sent on behalf of users using a tablet
	 * device.
	 *
	 * @author Patrick Reilly
	 *
	 * @param string $userAgent
	 * @return bool
	 */
	private function detectTabletDevice( $userAgent ) {
		// The only way to distinguish Android browsers on tablet from Android
		// browsers on mobile is that Android browsers on tablet usually don't
		// include the word "mobile". We look for "mobi" instead of "mobile" due to
		// Opera Mobile. Note that this test fails to detect some obscure tablets
		// such as older Xoom tablets and Portablet tablets. See
		// http://stackoverflow.com/questions/5341637 for more detail.
		if ( preg_match( '/Android/i', $userAgent ) ) {
			return !preg_match( '/mobi/i', $userAgent );
		}

		return (bool)preg_match( '/(iPad|Tablet|PlayBook|Wii|Silk)/i', $userAgent );
	}
}
