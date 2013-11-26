Given /^I am logged into the mobile website$/ do
  visit(HomePage) do |page|
    page.mainmenu_button
    page.login_button
  end
  on(LoginPage) do |page|
  page.login_with(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
  if page.text.include? "There is no user by the name "
    puts ENV["MEDIAWIKI_USER"] + " does not exist... trying to add user"
    on(HomePage).create_account_element.when_present.click
    on(LoginPage) do |page|
      page.username_element.element.when_present.set ENV["MEDIAWIKI_USER"]
      page.signup_password_element.element.when_present.set ENV["MEDIAWIKI_PASSWORD"]
      page.confirm_password_element.element.when_present.set ENV["MEDIAWIKI_PASSWORD"]
      page.signup_submit_element.element.when_present.click
      page.text.should include "Welcome, " + ENV["MEDIAWIKI_USER"] + "!"
      #Can't get around captcha in order to create a user
    end
  end
  end
end

Given /^I am in beta mode$/ do
  visit(BetaPage) do |page|
    page.beta_element.click
    page.save_settings
  end
end

Given /^I am not logged in$/ do
  # nothing to do here, user in not logged in by default
end

When /^I go to random page$/ do
  visit(RandomPage)
end
