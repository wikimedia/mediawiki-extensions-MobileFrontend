Given /^I am in beta mode$/ do
  visit(BetaPage) do |page|
    page.beta_element.click
    page.save_settings
  end
end

Given /^I am not logged in$/ do
  # nothing to do here, user in not logged in by default
end

When /^I select the watchlist icon$/ do
  on(HomePage).watch_link_element.when_present.click
end

Then /^I receive notification that I need to log in to use the watchlist functionality$/ do
  on(HomePage).text.should include "Please login or sign up to watch this page."
end

Then /^When I click Sign In I go to the Log In page$/ do
  on(LoginPage) do |page|
    page.login_wl_element.when_present.click
    page.text.should include "Sign in"
  end
end

Given /^I am logged into the mobile website$/ do
  visit(HomePage) do |page|
    page.mainmenu_button_element.when_present.click
    page.login_button
  end
  on(LoginPage) do |page|
  page.login_with(@mediawiki_username, @mediawiki_password)
  if page.text.include? "There is no user by the name "
    puts @mediawiki_username + ' does not exist... trying to add user'
    on(HomePage).create_account_element.when_present.click
    on(LoginPage) do |page|
      page.username_element.element.when_present.set @mediawiki_username
      page.signup_password_element.element.when_present.set @mediawiki_password
      page.confirm_password_element.element.when_present.set @mediawiki_password
      page.signup_submit_element.element.when_present.click
      page.text.should include 'Welcome, ' + @mediawiki_username + '!'
      #Can't get around captcha in order to create a user
    end
  end
  end
end

When /^I go to random page$/ do
  visit(RandomPage)
end

Then /^I receive notification that the article has been added to the watchlist$/ do
  on(HomePage) do |page|
    page.watch_note_element.exists?
  end
end

Then /^the article watchlist icon is selected$/ do
  on(HomePage) do |page|
    page.watched_link_element.should be_true
  end
end

Then /^I receive notification that the article has been removed from the watchlist$/ do
  on(HomePage) do |page|
    page.watch_note_removed_element.exists?
  end
end
Then /^the article no longer has the watchlist icon selected$/ do
  on(HomePage) do |page|
    page.watch_link_element.should be_true
  end
end

When /^I click Login$/ do
  on(HomePage).login_watchlist_element.when_present.click
end

Then /^Login page opens$/ do
  Watir::Wait.until { @browser.url.match(Regexp.escape('Special:UserLogin')) }
  @browser.url.should match Regexp.escape('Special:UserLogin')
  @browser.url.should_not match Regexp.escape('&type=signup')
end

When /^I click Sign up$/ do
  on(HomePage).sign_up_watchlist_element.when_present.click
end

Then /^Sign up page opens$/ do
  Watir::Wait.until { @browser.url.match(Regexp.escape('Special:UserLogin')) }
  @browser.url.should match Regexp.escape('Special:UserLogin')
  @browser.url.should match Regexp.escape('&type=signup')
end
