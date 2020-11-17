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

/**
 * A Data Transfer Object whose properties are whether the device making the
 * request is a mobile device, a tablet device, or neither.
 */
class DeviceProperties {
	/** @var bool */
	private $isMobileDevice;
	/** @var bool */
	private $isTabletDevice;

	/**
	 * @param bool $isMobileDevice
	 * @param bool $isTabletDevice
	 */
	public function __construct( $isMobileDevice, $isTabletDevice ) {
		$this->isMobileDevice = $isMobileDevice;
		$this->isTabletDevice = $isTabletDevice;
	}

	/**
	 * Is the device a mobile device?
	 *
	 * @return bool
	 */
	public function isMobileDevice() {
		return $this->isMobileDevice;
	}

	/**
	 * Is the device a tablet device?
	 *
	 * @return bool
	 */
	public function isTabletDevice() {
		return $this->isTabletDevice;
	}
}
