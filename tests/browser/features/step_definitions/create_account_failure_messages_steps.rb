Given(/^I click Create Account$/) do
  on(SpecialUserLoginPage).create_account_link_element.when_present.click
end

Then(/^I see the refresh captcha icon$/) do
  on(SpecialUserLoginPage).refresh_captcha_element.when_present.should exist
end

Given(/^I type "(.+)" into Username field$/) do |username|
  on(SpecialUserLoginPage).username_element.when_present.send_keys(username)
end

Given(/^I type "(.+)" into Password field$/) do |password|
  on(SpecialUserLoginPage).password_element.when_present.send_keys(password)
end

Given(/^I type "(.+)" into Confirm password field$/) do |confirm|
  on(SpecialUserLoginPage).confirm_password_element.when_present.send_keys(confirm)
end

When(/^I click Sign up$/) do
  on(SpecialUserLoginPage).signup_submit_element.when_present.click
end

Given(/^I type (.+) into Enter confirmation code field$/) do |conf_code|
  on(SpecialUserLoginPage).confirmation_field_element.when_present.send_keys (conf_code)
end

