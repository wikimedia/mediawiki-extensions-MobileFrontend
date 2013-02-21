<?php
/**
 * ResourceLoaderModule subclass for mobile
 * Allows basic parsing of messages without arguments
 */
class MFResourceLoaderModule extends ResourceLoaderModule {
	protected $dependencies = array();
	protected $parsedMessages = array();
	protected $messages = array();
	protected $templates = array();
	protected $localBasePath;
	protected $targets = array( 'mobile' );
	/** String: The local path to where templates are located, see __construct() */
	protected $localTemplateBasePath = '';

	/**
	 * Registers core modules and runs registration hooks.
	 */
	public function __construct( $options ) {
		foreach ( $options as $member => $option ) {
			switch ( $member ) {
				case 'localTemplateBasePath':
				case 'localBasePath':
					$this->{$member} = (string) $option;
					break;
				case 'templates':
				case 'dependencies':
					$this->{$member} = (array) $option;
					break;
				case 'messages':
					$this->processMessages( $option );
					break;
			}
		}

		// MFResourceLoaderModule must depend on mobile.startup because
		// mobile.startup contains code responsible for compiling templates
		if ( !in_array( 'mobile.startup', $this->dependencies ) ) {
			$this->dependencies[] = 'mobile.startup';
		}
	}

	/**
	 * Gets list of names of modules this module depends on.
	 *
	 * @return Array: List of module names
	 */
	public function getDependencies() {
		return $this->dependencies;
	}

	/**
	 * Returns the templates named by the modules
	 * Each template has a corresponding html file in includes/templates/
	 *
	 */
	function getTemplateNames() {
		return $this->templates;
	}

	/**
	 * @param $name string: name of template
	 * @return string
	 */
	protected function getLocalTemplatePath( $name ) {
		return "{$this->localTemplateBasePath}/$name.html";
	}

	/**
	 * Takes named templates by the module and adds them to the JavaScript output
	 *
	 * @return string: JavaScript
	 */
	function getTemplateScript() {
		$js = '';
		$templates = $this->getTemplateNames();

		foreach( $templates as $templateName ) {
			$localPath = $this->getLocalTemplatePath( $templateName );
			if ( file_exists( $localPath ) ) {
				$content = file_get_contents( $localPath );
				$js .= Xml::encodeJsCall( 'mw.mobileFrontend.template.add', array( $templateName, $content ) );
			} else {
				$msg = __METHOD__.": template file not found: \"$localPath\"";
				throw new MWException( $msg );
			}
		}
		return $js;
	}

	/**
	 * Processes messages which have been marked as needing parsing
	 *
	 * @return String: JavaScript code
	 */
	public function addParsedMessages() {
		$js = "\n";
		foreach( $this->parsedMessages as $key ) {
			$value = wfMessage( $key )->parse();
			$js .= Xml::encodeJsCall( 'mw.messages.set', array( $key, $value ) );
		}
		return $js;
	}

	/**
	 * Separates messages which have been marked as needing parsing from standard messages
	 *
	 */
	public function processMessages( $messages ) {
		foreach( $messages as $key => $value ) {
			if ( is_array( $value ) ) {
				foreach( $value as $directive ) {
					if ( $directive == 'parse' ) {
						$this->parsedMessages[] = $key;
					}
				}
			} else {
				$this->messages[] = $value;
			}
		}
	}

	/**
	 * Gets list of message keys used by this module.
	 *
	 * @return Array: List of message keys
	 */
	public function getMessages() {
		return $this->messages;
	}

	/**
	 * Gets all scripts for a given context concatenated together including processed messages
	 *
	 * @param $context ResourceLoaderContext: Context in which to generate script
	 * @return String: JavaScript code for $context
	 */
	public function getScript( ResourceLoaderContext $context ) {
		return $this->addParsedMessages() . $this->getTemplateScript();
	}

	/**
	 * Checks whether any resources used by module have changed
	 *
	 * @param $context ResourceLoaderContext: Context in which to generate script
	 * @return Integer: UNIX timestamp
	 */
	public function getModifiedTime( ResourceLoaderContext $context ) {
		global $IP;
		return max(
			filemtime( "$IP/extensions/MobileFrontend/MobileFrontend.php" ),
			filemtime( "$IP/extensions/MobileFrontend/MobileFrontend.i18n.php" )
		);
	}
}
