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
  on(HomePage).mobile_view_element.element.wait_until_present
end

When /^I click on the Content license link$/ do
  on(HomePage).content_link_element.when_present.click
end

Then /^I go to the Content license page$/ do
  @browser.url.should match Regexp.escape('creativecommons.org')
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