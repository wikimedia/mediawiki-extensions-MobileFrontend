Given /^I am using user agent "(.+)"$/ do |user_agent|
  @user_agent = user_agent
  @browser = browser(test_name(@scenario), {user_agent: user_agent})
  @browser.window.resize_to(480, 800)
  $session_id = @browser.driver.instance_variable_get(:@bridge).session_id
end

Given(/^I am viewing the basic non-JavaScript site$/) do
  step 'I am using user agent "Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54"'
end

Given /^I am logged into the mobile website$/ do
  step 'I am on the "Main Page" page'
  step 'I click on "Log in" in the main navigation menu'
  on(SpecialUserLoginPage) do |page|
  page.login_with(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
  if page.text.include? "There is no user by the name "
    puts ENV["MEDIAWIKI_USER"] + " does not exist... trying to add user"
    on(SpecialUserLoginPage).create_account_element.when_present.click
    on(SpecialUserLoginPage) do |page|
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
  on(SpecialUserLoginPage) do |page|
    # undo auto complete
    page.username_element.when_present.send_keys(username)
    page.password_element.when_present.send_keys(pwd)
    page.confirm_password_element.when_present.send_keys(pwd)
    page.signup_submit_element.when_present.click
    step 'I am on the "Special:UserLogout" page'
    visit(SpecialUserLoginPage) do |page|
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
  on(SpecialUserLoginPage).login_with("Selenium_newuser", ENV["MEDIAWIKI_PASSWORD"])
end

Given(/^I am logged in as a user with a > (\d+) edit count$/) do |arg1|
  step 'I am on the "Main Page" page'
  step 'I click on "Log in" in the main navigation menu'
  # FIXME: Guarantee that MEDIAWIKI_USER has an edit count of > 0
  on(SpecialUserLoginPage).login_with(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
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

Given(/^I am on the "(.+)" page$/) do |article|
  # Ensure we do not cause a redirect
  article = article.sub(/ /, '_')
  visit(ArticlePage, :using_params => {:article_name => article})
end

When(/^I visit the page "(.*?)" with hash "(.*?)"$/) do |article, hash|
  # Ensure we do not cause a redirect
  article = article.sub(/ /, '_')
  visit(ArticlePage, :using_params => {:article_name => article, :hash => hash })
end

Given(/^The "(.*?)" page is protected\.$/) do |page|
  step 'I am logged into the mobile website'
  step 'I am on the "' + page + '" page'
  step 'I switch to desktop'
  if not on(DesktopArticlePage).unprotect_element.exists?
    step 'I click the protect link on the desktop skin'
    step 'I select Allow only administrators on the protection page'
    step 'I click the submit button on the protection page'
  end
  step 'I switch to the mobile site'
  step 'I click on "Log out" in the main navigation menu'
end

Given(/^I am on the random page$/) do
  visit(ArticlePage, :using_params => {:article_name => @random_string})
end

Given(/^I am on a page that does not exist$/) do
  name = 'NewPage' + Time.now.to_i.to_s
  visit(ArticlePage, :using_params => {:article_name => name})
end

When(/^I click the browser back button$/) do
  on(ArticlePage).back
end

When(/^I say OK in the confirm dialog$/) do
  on(ArticlePage).confirm(true) do
  end
end

When(/^I say Cancel in the confirm dialog$/) do
  on(ArticlePage).confirm(false) {}
end

Then(/^There is a red link with text "(.+)"$/) do |text|
  # FIXME: Switch to link_element when red links move to stable
  on(ArticlePage).content_wrapper_element.span_element(text: text).when_present(10).should be_visible
end
