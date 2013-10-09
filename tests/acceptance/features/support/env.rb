# before all
require 'bundler/setup'
require 'page-object'
require 'page-object/page_factory'
require 'watir-webdriver'
require 'yaml'

World(PageObject::PageFactory)

def browser(environment, test_name, saucelabs_username, saucelabs_key, user_agent)
  if environment == :cloudbees
    sauce_browser(test_name, saucelabs_username, saucelabs_key, user_agent)
  else
    local_browser(user_agent)
  end
end
def environment
  if ENV['ENVIRONMENT'] == 'cloudbees'
    :cloudbees
  else
    :local
  end
end
def local_browser(user_agent)
  if ENV['BROWSER_LABEL']
    browser_label = ENV['BROWSER_LABEL'].to_sym
  else
    browser_label = :firefox
  end

  if user_agent =='default'
    browser = Watir::Browser.new browser_label
  else
    if browser_label == :firefox
      profile = Selenium::WebDriver::Firefox::Profile.new
      profile['general.useragent.override'] = user_agent
      browser = Watir::Browser.new browser_label, :profile => profile
    else
      raise "Changing user agent is currently supported only for Firefox!"
    end
  end

  # we can set cookies only for current domain
  # see http://code.google.com/p/selenium/issues/detail?id=1953
  browser.goto HomePage.url
  # set a cookie forcing mobile mode
  browser.cookies.add 'mf_useformat', 'true'
  browser
end

def sauce_api(json, saucelabs_username, saucelabs_key)
  %x{curl -H 'Content-Type:text/json' -s -X PUT -d '#{json}' http://#{saucelabs_username}:#{saucelabs_key}@saucelabs.com/rest/v1/#{saucelabs_username}/jobs/#{$session_id}}
end
def sauce_browser(test_name, saucelabs_username, saucelabs_key, user_agent)
  config = YAML.load_file('config/config.yml')
  browser_label = config[ENV['BROWSER_LABEL']]

  if user_agent == 'default'
    caps = Selenium::WebDriver::Remote::Capabilities.send(browser_label['name'])
  else browser_label['name'] == 'firefox'
    profile = Selenium::WebDriver::Firefox::Profile.new
    profile['general.useragent.override'] = user_agent
    caps = Selenium::WebDriver::Remote::Capabilities.firefox(:firefox_profile => profile)
  end

  caps.platform = browser_label['platform']
  caps.version = browser_label['version']
  caps[:name] = "#{test_name} #{ENV['JOB_NAME']}##{ENV['BUILD_NUMBER']}"

  require 'selenium/webdriver/remote/http/persistent' # http_client
  browser = Watir::Browser.new(
    :remote,
    http_client: Selenium::WebDriver::Remote::Http::Persistent.new,
    url: "http://#{saucelabs_username}:#{saucelabs_key}@ondemand.saucelabs.com:80/wd/hub",
    desired_capabilities: caps)

  browser.wd.file_detector = lambda do |args|
    # args => ['/path/to/file']
    str = args.first.to_s
    str if File.exist?(str)
  end

  browser
end
def test_name(scenario)
  if scenario.respond_to? :feature
    "#{scenario.feature.name}: #{scenario.name}"
  elsif scenario.respond_to? :scenario_outline
    "#{scenario.scenario_outline.feature.name}: #{scenario.scenario_outline.name}: #{scenario.name}"
  end
end

config = YAML.load_file('config/config.yml')
mediawiki_username = config['mediawiki_username']

secret = YAML.load_file('/private/wmf/secret.yml')
mediawiki_password = secret['mediawiki_password']
saucelabs_username = secret['saucelabs_username']
saucelabs_key = secret['saucelabs_key']

Before('@user_agent') do |scenario|
  @user_agent = true
  @saucelabs_username = saucelabs_username
  @saucelabs_key = saucelabs_key
  @scenario = scenario
end

Before do |scenario|
  @config = config
  @mediawiki_username = mediawiki_username
  @mediawiki_password = mediawiki_password
  unless @user_agent
    @browser = browser(environment, test_name(scenario), saucelabs_username, saucelabs_key, 'default') unless @user_agent
    $session_id = @browser.driver.instance_variable_get(:@bridge).session_id
  end
end

After do |scenario|
  $session_id = @browser.driver.instance_variable_get(:@bridge).session_id
  if environment == :cloudbees
    sauce_api(%Q{{"passed": #{scenario.passed?}}}, saucelabs_username, saucelabs_key)
    sauce_api(%Q{{"public": true}}, saucelabs_username, saucelabs_key)
  end
  @browser.close unless ENV['KEEP_BROWSER_OPEN'] == 'true'
end
