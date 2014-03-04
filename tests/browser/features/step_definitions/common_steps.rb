Given /^I am using user agent "(.+)"$/ do |user_agent|
  @user_agent = user_agent
  @browser = browser(environment, test_name(@scenario), user_agent)
  @browser.window.resize_to(480, 800)
  $session_id = @browser.driver.instance_variable_get(:@bridge).session_id
end

Given /^I am logged into the mobile website$/ do
  step 'I am on the "Main Page" page'
  step 'I click on "Log in" in the main navigation menu'
  on(LoginPage) do |page|
  page.login_with(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
  if page.text.include? "There is no user by the name "
    puts ENV["MEDIAWIKI_USER"] + " does not exist... trying to add user"
    on(LoginPage).create_account_element.when_present.click
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

# Note: Used by "I have just registered a new account"
Given(/^I register a new account with a random username$/) do
  username = 'NewUser' + Time.now.to_i.to_s
  #the call to Random creates a long string of the form "0.10879935166988186"
  pwd = Random.new.rand.to_s
  visit(CreateAccountPage) do |page|
    # undo auto complete
    page.username_field_element.when_present.send_keys(username)
    page.password_field_element.when_present.send_keys(pwd)
    page.confirm_password_field_element.when_present.send_keys(pwd)
    page.sign_up_element.when_present.click
    step 'I am on the "Special:UserLogout" page'
    visit(LoginPage) do |page|
      page.login_with(username, pwd)
    end
  end
end

Given(/^I have just registered a new account$/) do
  # Note the fact that we log in first means we can avoid needing to fill in a captcha
  step 'I am logged into the mobile website'
  step 'I am on the "Special:Userlogin" page'
  step 'I click Create Account'
  step 'I register a new account with a random username'
end

Given /^I am logged in as a new user$/ do
  step 'I am on the "Main Page" page'
  step 'I click on "Log in" in the main navigation menu'
  # FIXME: Actually create a new user instead of using an existing one
  on(LoginPage).login_with("Selenium_newuser", ENV["MEDIAWIKI_PASSWORD"])
end

Given(/^I am logged in as a user with a > (\d+) edit count$/) do |arg1|
  step 'I am on the "Main Page" page'
  step 'I click on "Log in" in the main navigation menu'
  # FIXME: Guarantee that MEDIAWIKI_USER has an edit count of > 0
  on(LoginPage).login_with(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
end

Given /^I am in beta mode$/ do
  visit(MobileOptions) do |page|
    page.beta_element.when_present.click
    page.save_settings_element.when_present.click
  end
end

Given /^I am in alpha mode$/ do
  visit(MobileOptions) do |page|
    page.beta_element.when_present.click
    page.save_settings_element.when_present.click
    visit(MobileOptions) do |page|
      page.alpha_element.when_present.click
      page.save_settings_element.when_present.click
    end
  end
end

Given /^I am not logged in$/ do
  # nothing to do here, user in not logged in by default
end

When /^I go to random page$/ do
  visit(RandomPage)
end

Given(/^I am on the "(.+)" page$/) do |article|
  visit(ArticlePage, :using_params => {:article_name => article})
end

Then(/^The URL of the page should contain "(.+)"$/) do |article|
  on(ArticlePage).current_url.should match article
end

Given(/^I visit a protected page$/) do
  # FIXME: Assumes Barack Obama article is protected
  step 'I am on the "Barack_Obama" page'
end

When(/^I click the browser back button$/) do
  on(ArticlePage).back
end

When(/^I click the browser back button and confirm$/) do
  on(ArticlePage).confirm(true) do
    on(ArticlePage).back
  end
end
