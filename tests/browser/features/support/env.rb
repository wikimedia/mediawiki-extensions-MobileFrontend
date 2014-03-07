require "mediawiki_selenium"

def local_browser(user_agent)
  if ENV["BROWSER"]
    browser_label = ENV["BROWSER"].to_sym
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
    browser.goto URL.url("Main_Page")
    # set a cookie forcing mobile mode
    browser.cookies.add "mf_useformat", "true"
    browser
  end
