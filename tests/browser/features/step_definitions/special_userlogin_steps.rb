Then(/^I see a message box at the top of the login page$/) do
  on(LoginPage).message_box_element.should be_visible
end

Then /^I see the log in prompt message "(.+)"$/ do |text|
  on(LoginPage).login_head_message_element.when_present.text.should match text
end

Then(/^I do not see a message box at the top of the login page$/) do
  on(LoginPage).message_box_element.should_not be_visible
end

Then(/^I see a message warning me I am already logged in$/) do
  on(LoginPage).warning_box_element.should be_visible
end

Then(/^I do not see a message warning me I am already logged in$/) do
  on(LoginPage).warning_box_element.should_not be_visible
end

Then(/^I see a password reset link$/) do
   on(LoginPage).password_reset_element.should be_visible
end
