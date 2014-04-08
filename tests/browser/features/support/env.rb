require "mediawiki_selenium"
require "mediawiki_api"

def set_cookie(browser)
  # we can set cookies only for current domain
  # see http://code.google.com/p/selenium/issues/detail?id=1953
  browser.goto URL.url("Main_Page")
  # set a cookie forcing mobile mode
  browser.cookies.add "mf_useformat", "true"
end
