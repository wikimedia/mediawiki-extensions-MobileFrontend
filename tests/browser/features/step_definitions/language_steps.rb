When /^I click the language button$/ do
  on(HomePage).language_button_element.when_present.click
end

Then(/^I see the language overlay$/) do
  on(HomePage).language_overlay_element.should be_visible
end

When(/^I click the language overlay close button$/) do
  on(HomePage).language_overlay_close_button_element.click
end

Then(/^I don't see the languages overlay$/) do
  on(HomePage).language_overlay_element.should_not be_visible
end
