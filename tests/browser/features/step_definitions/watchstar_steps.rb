Given(/^the page is unwatched$/) do
  unwatch_url = ENV["MEDIAWIKI_URL"] + @random_string + "?action=unwatch"
  @browser.goto(unwatch_url)
  on(ArticlePage).watch_confirm_element.when_present.click
end
