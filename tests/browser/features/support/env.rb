require_relative "hooks"
require "mediawiki_selenium"

def local_browser(user_agent)
  if ENV["BROWSER_LABEL"]
    browser_label = ENV["BROWSER_LABEL"].to_sym
  else
    browser_label = :firefox
  end

  if user_agent =="default" && !ENV["NEARBY_FIREFOX"]
    browser = Watir::Browser.new browser_label
  else
    if browser_label == :firefox && !ENV["NEARBY_FIREFOX"]
      profile = Selenium::WebDriver::Firefox::Profile.new
      profile["general.useragent.override"] = user_agent
      browser = Watir::Browser.new browser_label, :profile => profile
    else
      if ENV["NEARBY_FIREFOX"]
        permissions_file = "./features/support/permissions.sqlite"
        if RUBY_PLATFORM =~ /darwin/
          firefox_executable = "/Applications/Firefox.app/Contents/MacOS/firefox"
        elsif RUBY_PLATFORM =~ /linux/
          firefox_executable = '/usr/bin/firefox'
        else
          puts 'Cannot identify local OS, so cannot locate Firefox executable!'
        end
        profile_path = ("/tmp/NearbyProfile/")
        Dir.mkdir(profile_path) unless File.exists?(profile_path)
        system(firefox_executable + " -CreateProfile 'NearbyProfile " + profile_path + "'")
        system("cp " + permissions_file + " " + profile_path)
        browser = Watir::Browser.new :firefox, :profile => 'NearbyProfile'
      else
        raise "Changing user agent is currently supported only for Firefox!"
      end
    end
  end


    # we can set cookies only for current domain
    # see http://code.google.com/p/selenium/issues/detail?id=1953
    browser.goto HomePage.url
    # set a cookie forcing mobile mode
    browser.cookies.add "mf_useformat", "true"
    browser
  end

  def sauce_browser(test_name, user_agent)
    config = YAML.load_file("config/config.yml")
    browser_label = config[ENV["BROWSER_LABEL"]]

    if user_agent == "default"
      caps = Selenium::WebDriver::Remote::Capabilities.send(browser_label["name"])
    else
      browser_label["name"] == "firefox"
      profile = Selenium::WebDriver::Firefox::Profile.new
      profile["general.useragent.override"] = user_agent
      caps = Selenium::WebDriver::Remote::Capabilities.firefox(:firefox_profile => profile)
    end

    caps.platform = browser_label["platform"]
    caps.version = browser_label["version"]
    caps[:name] = "#{test_name} #{ENV['JOB_NAME']}##{ENV['BUILD_NUMBER']}"

    require "selenium/webdriver/remote/http/persistent" # http_client
    browser = Watir::Browser.new(
        :remote,
        http_client: Selenium::WebDriver::Remote::Http::Persistent.new,
        url: "http://#{ENV['SAUCE_ONDEMAND_USERNAME']}:#{ENV['SAUCE_ONDEMAND_ACCESS_KEY']}@ondemand.saucelabs.com:80/wd/hub",
        desired_capabilities: caps)

    browser.wd.file_detector = lambda do |args|
      # args => ["/path/to/file"]
      str = args.first.to_s
      str if File.exist?(str)
    end

    browser
  end
