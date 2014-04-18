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
	 * Array: Cache for mtime of templates
	 * @par Usage:
	 * @code
	 * array( [hash] => [mtime], [hash] => [mtime], ... )
	 * @endcode
	 */
	protected $templateModifiedTime = array();

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
	 * @return Array List of module names
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
	 * @param string $name of template
	 * @return string
	 */
	protected function getLocalTemplatePath( $name ) {
		return "{$this->localTemplateBasePath}/$name.html";
	}

	/**
	 * Takes named templates by the module and adds them to the JavaScript output
	 *
	 * @return string JavaScript code
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
				$msg = __METHOD__.": template not found: \"$templateName\"";
				$js .= Xml::encodeJsCall( 'throw', array( $msg ) );
			}
		}
		return $js;
	}

	/**
	 * Processes messages which have been marked as needing parsing
	 *
	 * @return string JavaScript code
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
	 * @return array List of message keys
	 */
	public function getMessages() {
		return $this->messages;
	}

	/**
	 * Gets all scripts for a given context concatenated together including processed messages
	 *
	 * @param ResourceLoaderContext $context Context in which to generate script
	 * @return string JavaScript code for $context
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$script = parent::getScript( $context );
		return $this->addParsedMessages() . $this->getTemplateScript() . $script;
	}

	/**
	 * @param ResourceLoaderContext $context
	 * @return array
	 */
	public function getScriptURLsForDebug( ResourceLoaderContext $context ) {
		if ( $this->hasParsedMessages || $this->hasTemplates ) {
			$urls = array(
				ResourceLoader::makeLoaderURL(
					array( $this->getName() ),
					$context->getLanguage(),
					$context->getSkin(),
					$context->getUser(),
					$context->getVersion(),
					true, // debug
					// @todo FIXME: Make this templates and update
					// makeModuleResponse so that it only outputs template code.
					// When this is done you can merge with parent array and
					// retain file names.
					'scripts', // only
					$context->getRequest()->getBool( 'printable' ),
					$context->getRequest()->getBool( 'handheld' )
				),
			);
		} else {
			$urls = parent::getScriptURLsForDebug( $context );
		}
		return $urls;
	}

	/**
	 * Checks whether any templates used by module have changed
	 *
	 * @param ResourceLoaderContext $context Context in which to generate script
	 * @return int UNIX timestamp
	 */
	public function getModifiedTimeTemplates( ResourceLoaderContext $context ) {
		$hash = $context->getHash();
		if ( isset( $this->templateModifiedTime[$hash] ) ) {
			$tlm = $this->templateModifiedTime[$hash];
		} else {
			// Get local paths to all templates
			$files = array_map(
				array( $this, 'getLocalTemplatePath' ),
				$this->getTemplateNames()
			);

			// Store for quicker future lookup
			if ( count( $files ) === 0 ) {
				$tlm = 1;
			} else {
				// check the last modified time of them
				wfProfileIn( __METHOD__ . '-filemtime' );
				$tlm = max( array_map( array( __CLASS__, 'safeFilemtime' ), $files ) );
				wfProfileOut( __METHOD__ . '-filemtime' );
			}
			// store for future lookup
			$this->templateModifiedTime[$hash] = $tlm;
		}
		return $tlm;
	}

	/**
	 * Checks whether any resources used by module have changed
	 *
	 * @param ResourceLoaderContext $context in which to generate script
	 * @return int UNIX timestamp
	 */
	public function getModifiedTime( ResourceLoaderContext $context ) {
		return max( parent::getModifiedTime( $context ),
			$this->getModifiedTimeTemplates( $context ) );
	}
}
