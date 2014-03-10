Given(/^I click Create Account$/) do
  on(LoginPage).create_account_link_element.when_present.click
end

Then(/^I see the refresh captcha icon$/) do
  on(CreateAccountPage).refresh_captcha_element.when_present.should exist
end

Given(/^I type (.+) into Username field$/) do |username|
  on(CreateAccountPage).username_field_element.when_present.send_keys(username)
end

Given(/^I type (.+) into Password field$/) do |password|
  on(CreateAccountPage).password_field_element.when_present.send_keys(password)
end

Given(/^I type (.+) into Confirm password field$/) do |confirm|
  on(CreateAccountPage).confirm_password_field_element.when_present.send_keys(confirm)
end

When(/^I click Sign up$/) do
  on(CreateAccountPage).sign_up_element.when_present.click
end

Then(/^I should see the message (.+)$/) do |error_message|
  on(CreateAccountPage).error_message.should match (error_message)
end

Given(/^I type (.+) into Enter confirmation code field$/) do |conf_code|
  on(CreateAccountPage).confirmation_field_element.when_present.send_keys (conf_code)
end

