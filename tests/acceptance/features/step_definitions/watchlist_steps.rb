Given /^I am in beta mode$/ do
  visit(BetaPage) do |page|
    page.beta_element.click
    page.save_settings
  end
end
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
    @browser.send_keys :enter
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
    page.watch_link_element.exists?
  end
end
