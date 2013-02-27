Given /^I am in beta mode$/ do
  visit(BetaPage) do |page|
    page.beta_element.click
    page.save_settings
  end
end

Given /^I am not logged in$/ do
  on(HomePage).login_button_element.should exist
end

When /^Select the watchlist icon$/ do
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

#Signup takes you to the sign in page... should it take you to the Mobile Create Account page??

Given /^I am logged into the mobile website$/ do
  on(HomePage) do |page|
    page.mainmenu_button_element.when_present.click
    page.login_button
  end
  on(LoginPage) do |page|
    page.login_with(@mediawiki_username, @mediawiki_password)
  end
  on(LoginSuccessPage) do |page|
    page.text.should include "signed in"
    page.returntomain_link
  end
end

When /^I search for an article and select the watchlist icon$/ do
  on(HomePage) do |page|
    page.search_box="san francisco chronicle"
    page.search_result_element.when_present
    page.search_form_element.submit
    @browser.url.should match /San_Francisco_Chronicle/
    page.text.should include "San Francisco Chronicle"
    page.watch_link_element.when_present.click
  end
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
  on(HomePage).login
end

Then /^Login page opens$/ do
  @browser.url.should match /Special:UserLogin/
end
