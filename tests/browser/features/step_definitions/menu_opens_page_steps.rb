When /^I click on Home from the left Nav$/  do
  on(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).home_link_element.when_present.click
end

When /^I click on Log In from the left Nav$/ do
  on(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).login_link_element.when_present.click
end
When /^I click on Nearby from the left Nav$/  do
  on(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).nearby_link_element.when_present.click
end

When /^I click on Random from the left Nav$/ do
  on(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).random_link_element.when_present.click
end

When /^I click on Settings from the left Nav$/  do
  on(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).settings_link_element.when_present.click
end

When /^I click on Uploads from the left Nav$/ do
  on(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).uploads_link_element.when_present.click
end

When /^I click on Watchlist from the left Nav$/ do
  on(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).watchlist_link_element.when_present.click
end

When /^I click on About Wikipedia from the left Nav$/ do
  on(HomePage).mainmenu_button_element.when_present.click
  on(HomePage).about_link_element.when_present.click
end


When /^I click on the Disclaimer link on the left Nav$/ do
  on(HomePage).mainmenu_button_element.when_present.click
  on(HomePage).disclaimer_link_element.when_present.click
end

Then /^my URL should be set to the Watchlist Page$/ do
  @browser.url.should match Regexp.escape('Special%3AWatchlist')
end

Then /^my URL should be set to the Home Page$/ do
  @browser.url.should match Regexp.escape('Main_Page')
end

Then /^my URL should be set to the Random Page$/  do
  @browser.url.should_not match Regexp.escape('Main_Page')
end

Then /^my URL should be set to the Nearby Page$/  do
  @browser.url.should match Regexp.escape('Special:Nearby')
end

Then /^my URL should be set to the Uploads Page$/  do
  @browser.url.should match Regexp.escape('Special%3AUploads')
end

Then /^my URL should be set to the Settings Page$/  do
  @browser.url.should match Regexp.escape('Special:MobileOptions')
end

Then /^my URL should be set to the Log In Page$/ do
  @browser.url.should match Regexp.escape('Special:UserLogin')
end

Then /^my URL should be set to the About Wikipedia Page$/ do
  @browser.url.should match Regexp.escape('Wikipedia:About')
end


Then /^my URL should be set to the Disclaimer Page$/ do
  @browser.url.should match Regexp.escape('Wikipedia:General_disclaimer')
end
