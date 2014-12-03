Then(/^I should not see a message warning me I am already logged in$/) do
  expect(on(SpecialUserLoginPage).warning_box_element).not_to be_visible
end

Then(/^I should see a message box at the top of the login page$/) do
  expect(on(SpecialUserLoginPage).message_box_element).to be_visible
end

Then(/^I should see a password reset link$/) do
  expect(on(SpecialUserLoginPage).password_reset_element).to be_visible
end

Then /^I should see the log in prompt message "(.+)"$/ do |text|
  expect(on(SpecialUserLoginPage).login_head_message_element.when_present.text).to match text
end
