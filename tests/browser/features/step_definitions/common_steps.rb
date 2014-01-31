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

Given /^I am logged in as a new user$/ do
  visit(HomePage) do |page|
    page.mainmenu_button_element.when_present.click
    page.login_button
  end
  # FIXME: Actually create a new user instead of using an existing one
  on(LoginPage).login_with("Selenium_newuser", ENV["MEDIAWIKI_PASSWORD"])
end

Given(/^I am logged in as a user with a > (\d+) edit count$/) do |arg1|
  visit(HomePage) do |page|
    page.mainmenu_button_element.when_present.click
    page.login_button
  end
  # FIXME: Guarantee that MEDIAWIKI_USER has an edit count of > 0
  on(LoginPage).login_with(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
end

Given /^I am in beta mode$/ do
  visit(MobileOptions) do |page|
    page.beta_element.click
    page.save_settings
  end
end

Given /^I am in alpha mode$/ do
  visit(MobileOptions) do |page|
    page.beta_element.click
    page.save_settings
    visit(MobileOptions) do |page|
      page.alpha_element.click
      page.save_settings
    end
  end
end

Given /^I am not logged in$/ do
  # nothing to do here, user in not logged in by default
end

When /^I go to random page$/ do
  visit(RandomPage)
end

When(/^I go to an uncreated page using URL (.+)$/) do |article|
  visit(NonexistentPage, :using_params => {:article_name => article})
end

Then(/^the URL of of my page should contain (.+)$/) do |article|
  on(NonexistentPage).current_url.should match article
end

When(/^I am on the home page$/) do
  visit(HomePage)
end

When(/^I click the browser back button$/) do
  on(ArticlePage).back
end

When(/^I click the browser back button and confirm$/) do
  on(ArticlePage).confirm(true) do
    on(ArticlePage).back
  end
end
