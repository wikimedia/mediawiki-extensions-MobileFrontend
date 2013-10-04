<?php
/**
 * ResourceLoaderModule subclass for mobile
 * Allows basic parsing of messages without arguments
 */
class MFResourceLoaderModule extends ResourceLoaderFileModule {
	protected $dependencies = array();
	protected $parsedMessages = array();
	protected $messages = array();
	protected $templates = array();
	protected $localBasePath;
	protected $targets = array( 'mobile', 'desktop' );
	/** String: The local path to where templates are located, see __construct() */
	protected $localTemplateBasePath = '';
	private $hasParsedMessages = false;
	private $hasTemplates = false;

	/**
	 * Registers core modules and runs registration hooks.
	 */
	public function __construct( $options ) {
		foreach ( $options as $member => $option ) {
			switch ( $member ) {
				case 'localTemplateBasePath':
					$this->{$member} = (string) $option;
					break;
				case 'templates':
					$this->hasTemplates = true;
					$this->{$member} = (array) $option;
					break;
				case 'messages':
					$this->processMessages( $option );
					$this->hasParsedMessages = true;
					// Prevent them being reinitialised when parent construct is called.
					unset( $options[$member] );
					break;
			}
		}

		parent::__construct( $options );
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
				$js .= Xml::encodeJsCall( 'mw.template.add', array( $templateName, $content ) );
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

	public function supportsURLLoading() {
		// When templates or parsed messages are present in the module force load.php urls
		return $this->hasTemplates || $this->hasParsedMessages ? false : true;
	}

	/**
	 * Gets all scripts for a given context concatenated together including processed messages
	 *
	 * @param $context ResourceLoaderContext: Context in which to generate script
	 * @return String: JavaScript code for $context
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$script = parent::getScript( $context );
		return $this->addParsedMessages() . $this->getTemplateScript() . $script;
	}

	/**
	 * Checks whether any resources used by module have changed
	 *
	 * @param $context ResourceLoaderContext: Context in which to generate script
	 * @return Integer: UNIX timestamp
	 */
	public function getModifiedTime( ResourceLoaderContext $context ) {
		return max(
			filemtime( dirname( dirname( __DIR__ ) ) . "/MobileFrontend.php" ),
			filemtime( dirname( dirname( __DIR__ ) ) . "/MobileFrontend.i18n.php" )
		);
	}
}
