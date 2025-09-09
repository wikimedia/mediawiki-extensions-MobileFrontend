<?php

namespace MobileFrontend\Tests;

/**
 * @coversNothing
 */
class OwnersStructureTest extends \PHPUnit\Framework\TestCase {
	/** @var array */
	private static $ownerSections;

	public static function setUpBeforeClass(): void {
		$lines = file( __DIR__ . '/../../../OWNERS.md', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES );
		self::$ownerSections = self::parseOwnersFile( $lines );
	}

	/**
	 * Parse the OWNERS.md file into structured sections.
	 *
	 * @param string[] $lines Lines from the OWNERS.md file
	 * @return array Associative array of sections, keyed by section title
	 */
	private static function parseOwnersFile( array $lines ): array {
		$sections = [];
		$currentSection = null;
		$currentListKey = null;

		foreach ( $lines as $line ) {
			if ( self::isSectionHeader( $line ) ) {
				// Save the previous section before starting a new one
				if ( $currentSection !== null ) {
					$sections[ $currentSection['title'] ] = $currentSection;
				}
				$currentSection = self::createNewSection( $line );
				$currentListKey = null;
			} elseif ( self::isMetadataLine( $line ) ) {
				[ $currentSection, $currentListKey ] = self::processMetadataLine(
					$line,
					$currentSection,
					$currentListKey
				);
			} elseif ( self::isBulletedListItem( $line ) ) {
				$currentSection = self::addBulletedItem( $line, $currentSection, $currentListKey );
			}
		}

		// Save the final section
		if ( $currentSection !== null ) {
			$sections[ $currentSection['title'] ] = $currentSection;
		}

		return $sections;
	}

	/**
	 * Check if a line is a section header (starts with "## ").
	 *
	 * @param string $line
	 * @return bool
	 */
	private static function isSectionHeader( string $line ): bool {
		return strpos( $line, '## ' ) === 0;
	}

	/**
	 * Check if a line is a metadata line (starts with "* ").
	 *
	 * @param string $line
	 * @return bool
	 */
	private static function isMetadataLine( string $line ): bool {
		return strpos( $line, '* ' ) === 0;
	}

	/**
	 * Check if a line is a bulleted list item (starts with "  - ").
	 *
	 * @param string $line
	 * @return bool
	 */
	private static function isBulletedListItem( string $line ): bool {
		return strpos( $line, '  - ' ) === 0;
	}

	/**
	 * Create a new section from a header line.
	 *
	 * @param string $line Section header line
	 * @return array New section array with title
	 */
	private static function createNewSection( string $line ): array {
		return [ 'title' => trim( substr( $line, 3 ) ) ];
	}

	/**
	 * Process a metadata line (e.g., "* Files:", "* Contact:", etc.).
	 *
	 * @param string $line The metadata line to process
	 * @param array|null $section Current section being built
	 * @param string|null $currentListKey Current list key being populated
	 * @return array Tuple of [updated section, updated currentListKey]
	 */
	private static function processMetadataLine(
		string $line,
		?array $section,
		?string $currentListKey
	): array {
		[ $label, $value ] = explode( ':', substr( $line, 2 ), 2 );
		$label = trim( $label );
		$value = trim( $value );

		if ( self::isListMetadata( $label ) ) {
			// Initialize array for bulleted list items
			$section[$label] = [];
			$currentListKey = $label;
			// If there's a value on the same line, include it
			if ( $value !== '' ) {
				$section[$label][] = $value;
			}
		} else {
			// Regular metadata field (Contact, Since, Phabricator, etc.)
			$section[$label] = $value;
			$currentListKey = null;
		}

		return [ $section, $currentListKey ];
	}

	/**
	 * Check if a metadata label expects a list of values.
	 *
	 * @param string $label
	 * @return bool
	 */
	private static function isListMetadata( string $label ): bool {
		return in_array( $label, [ 'Files', 'Folders', 'Modules' ] );
	}

	/**
	 * Add a bulleted list item to the current section.
	 *
	 * @param string $line The bulleted list line
	 * @param array|null $section Current section being built
	 * @param string|null $currentListKey Current list key being populated
	 * @return array|null Updated section
	 */
	private static function addBulletedItem(
		string $line,
		?array $section,
		?string $currentListKey
	): ?array {
		if ( $currentListKey !== null && $section !== null ) {
			$path = trim( substr( $line, 4 ) );
			$section[$currentListKey][] = $path;
		}
		return $section;
	}

	public function testOwnersFile() {
		$expectedResourceLabels = [ 'Modules', 'Folders', 'Files' ];

		foreach ( self::$ownerSections as $title => $section ) {
			$this->assertArrayHasKey( 'Contact', $section, "OWNERS.md § $title has Contact label" );
			$this->assertArrayHasKey( 'Since', $section, "OWNERS.md § $title has Since label" );

			$actualResourceLabels = array_intersect( $expectedResourceLabels, array_keys( $section ) );

			$this->assertTrue(
				count( $actualResourceLabels ) >= 1,
				"OWNERS.md § $title has either a Files, Folders, or Modules label"
			);
		}
	}

	/**
	 * @param array $moduleInfo module definition
	 * @return string[] of all frontend assets in the module.
	 */
	private static function getAssociatedFilesFromModule( array $moduleInfo ) {
		$files = [];
		foreach ( [ 'packageFiles', 'scripts', 'styles', 'skinStyles' ] as $key ) {
			$files = array_merge( $files, $moduleInfo[ $key ] ?? [] );
		}
		return $files;
	}

	/**
	 * @param string $folder
	 * @return string[] of all files and directories in the folder.
	 */
	private static function getFilesInFolder( string $folder ) {
		$handle = opendir( __DIR__ . '/../../../' . $folder );
		$files = [];
		$entry = readdir( $handle );
		while ( $entry ) {
			$path = $folder . '/' . $entry;
			if ( $entry != '.' && $entry != '..' ) {
				$files[] = $path;
			}
			$entry = readdir( $handle );
		}
		closedir( $handle );
		return $files;
	}

	/**
	 * @depends testOwnersFile
	 */
	public function testResourcesAreOwned() {
		$ownedModules = [];
		$ownedFolders = [];
		$ownedFiles = [];

		foreach ( self::$ownerSections as $section ) {
			if ( isset( $section['Modules'] ) ) {
				$ownedModules = array_merge( $ownedModules, array_fill_keys( $section['Modules'], true ) );
			}

			if ( isset( $section['Folders'] ) ) {
				foreach ( $section['Folders'] as $folder ) {
					if ( $folder ) {
						$ownedFolders[] = $folder;
					}
				}
			}

			if ( isset( $section['Files'] ) ) {
				$ownedFiles = array_merge( $ownedFiles, $section['Files'] );
			}
		}

		$extension = json_decode(
			file_get_contents( __DIR__ . '/../../../extension.json' ),
			JSON_OBJECT_AS_ARRAY
		);
		$modules = $extension['ResourceModules'];
		$resourceFileModulePaths = $extension['ResourceFileModulePaths'] ?? [];
		$globalLocalBasePath = $resourceFileModulePaths['localBasePath'] ?? '';
		foreach ( $modules as $moduleName => $moduleInfo ) {
			// #1: Is the module owned?
			if ( isset( $ownedModules[ $moduleName ] ) ) {
				continue;
			}
			// #2: are the associated files owned?
			// $relativePath is the path to the file relative to the project root.
			$localBasePath = $moduleInfo['localBasePath'] ?? $globalLocalBasePath;
			$this->checkFilesAreOwned(
				self::getAssociatedFilesFromModule( $moduleInfo ),
				$ownedFiles,
				$ownedFolders,
				$moduleName,
				$localBasePath
			);
		}

		$this->checkFilesAreOwned(
			self::getFilesInFolder( 'tests' ),
			$ownedFiles,
			$ownedFolders,
			'tests folder'
		);
		$this->checkFilesAreOwned(
			self::getFilesInFolder( 'includes' ),
			$ownedFiles,
			$ownedFolders,
			'includes folder'
		);
		$this->checkFilesAreOwned(
			self::getFilesInFolder( 'src' ),
			$ownedFiles,
			$ownedFolders,
			'src folder'
		);

		$this->assertTrue( true, 'OWNERS.md documents ownership of all resources' );
	}

	private function checkFilesAreOwned(
		$fileEntries,
		$ownedFiles,
		$ownedFolders,
		$moduleName = '',
		$localBasePath = '',
	) {
		foreach ( $fileEntries as $entry ) {
			$name = $entry;

			// support [ 'name' => 'file.js' ] as well as 'file.js'
			if ( is_array( $name ) ) {
				if ( !isset( $name['name'] ) ) {
					continue;
				}

				$name = $name['name'];
			}

			$relativePath = $localBasePath . '/' . $name;

			// #2: Is the resource in an owned folder?
			$found = false;

			foreach ( $ownedFolders as $ownedFolder ) {
				if ( str_starts_with( $relativePath, $ownedFolder ) ) {
					$found = true;

					break;
				}
			}

			// #3: Finally, is the resource an owned file?
			if ( !$found ) {
				foreach ( $ownedFiles as $ownedFile ) {
					if ( str_ends_with( $relativePath, $ownedFile ) ) {
						$found = true;

						break;
					}
				}
			}

			$ignoreExtensions = [ '.browserslistrc', '.md', '.eslintrc.json', '.htaccess' ];
			foreach ( $ignoreExtensions as $extension ) {
				if ( str_ends_with( $relativePath, $extension ) ) {
					$found = true;
				}
			}
			if ( !$found ) {
				$isDirectory = is_dir( __DIR__ . '/../../../' . $relativePath );
				if ( $isDirectory ) {
					$this->checkFilesAreOwned(
						self::getFilesInFolder( $name ),
						$ownedFiles,
						$ownedFolders,
						$moduleName,
						$localBasePath
					);
					// if this succeeds all files were accounted for so not needed.
				} else {
					$this->fail( "Resource $relativePath ($moduleName) isn't documented as owned in OWNERS.md" );
				}
			}
		}
	}
}
