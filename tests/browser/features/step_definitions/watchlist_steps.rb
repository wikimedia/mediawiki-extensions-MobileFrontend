Then /^When I click Sign In I go to the Log In page$/ do
  on(LoginPage) do |page|
    page.login_wl_element.when_present.click
    page.text.should include "Sign in"
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

