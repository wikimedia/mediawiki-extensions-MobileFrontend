When(/^I click on the view edit history link$/) do
  on(HomePage).edit_history_link_element.when_present.click
end

Then(/^I go to the edit history page$/) do
  @browser.url.should match Regexp.escape('Main_Page&action=history')
end

When /^I click on the desktop link$/ do
  on(HomePage).desktop_link_element.when_present.click
end

Then /^I go to the desktop wiki page$/ do
  @browser.url.should match Regexp.escape('toggle_view_desktop')
end

When /^I click on the CC BY\-SA link$/ do
  on(HomePage).content_link_element.when_present.click
end

Then /^I go to the CC BY\-SA page$/ do
  @browser.url.should match Regexp.escape('Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License?useformat=mobile')
end

When /^I click on the Terms of Use link$/ do
  on(HomePage).terms_link_element.when_present.click
end

Then /^I go to the Terms of Use page$/ do
  @browser.url.should match Regexp.escape('Terms_of_use?useformat=mobile')
end

When /^I click on the Privacy link$/ do
  on(HomePage).privacy_link_element.when_present.click
end

Then(/^I go to the Privacy page$/) do
  @browser.url.should match Regexp.escape('Privacy_policy')
end