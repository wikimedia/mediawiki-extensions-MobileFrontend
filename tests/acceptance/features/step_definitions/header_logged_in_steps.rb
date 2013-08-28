Then /^I click the enabled edit icon$/ do
  on(HomePage).edit_icon_enabled_element.when_present.click
end

Then /^I can click Cancel$/ do
  on(EditPage).edit_cancel_button_element.when_present.click
end

Then /^I receive the locked upload message (.+)$/ do |text|
  on(HomePage).rl_notification_element.when_present.text.should match text
end
