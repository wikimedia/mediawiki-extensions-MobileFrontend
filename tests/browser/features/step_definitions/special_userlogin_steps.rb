Then(/^I see a message box at the top of the login page$/) do
  on(SpecialUserLoginPage).message_box_element.should be_visible
end

Then /^I see the log in prompt message "(.+)"$/ do |text|
  on(SpecialUserLoginPage).login_head_message_element.when_present.text.should match text
end

Then(/^I do not see a message box at the top of the login page$/) do
  on(SpecialUserLoginPage).message_box_element.should_not be_visible
end

Then(/^I see a message warning me I am already logged in$/) do
  on(SpecialUserLoginPage).warning_box_element.should be_visible
end

Then(/^I do not see a message warning me I am already logged in$/) do
  on(SpecialUserLoginPage).warning_box_element.should_not be_visible
end

Then(/^I see a password reset link$/) do
   on(SpecialUserLoginPage).password_reset_element.should be_visible
end
