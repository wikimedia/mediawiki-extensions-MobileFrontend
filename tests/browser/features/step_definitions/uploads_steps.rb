Given /^I am logged in as a new user$/ do
  visit(HomePage) do |page|
    page.mainmenu_button_element.when_present.click
    page.login_button
  end
  on(LoginPage).login_with("Selenium_newuser", ENV['MEDIAWIKI_PASSWORD'])
end

When(/^I go to uploads page$/) do
  visit(UploadsPage)
end

Then(/^I see a blue tutorial screen$/) do
  on(UploadsPage).tutorial_element.when_present.should exist
end

Then(/^I see a next button$/) do
  on(UploadsPage).next_button_element.when_present.should exist
end
