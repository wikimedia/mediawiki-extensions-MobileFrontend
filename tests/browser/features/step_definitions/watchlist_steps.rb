Given(/^the page is unwatched$/) do
  unwatch_url = ENV["MEDIAWIKI_URL"] + @random_string + "?action=unwatch"
  @browser.goto(unwatch_url)
  on(ArticlePage).watch_confirm_element.when_present.click
end

When(/^I switch to the modified view of the watchlist$/) do
  on(WatchlistPage).feed_link_element.click
end

When(/^I switch to the list view of the watchlist$/) do
  on(WatchlistPage).list_link_element.click
end

Then(/^I see a list of diff summary links$/) do
  on(WatchlistPage).page_list_diffs_element.when_present.should be_visible
end

Then(/^I see a list of pages I am watching$/) do
  on(WatchlistPage).page_list_a_to_z_element.when_present.should be_visible
end

Then(/^The modified button is selected$/) do
  on(WatchlistPage).feed_link_element.parent.element().class_name.should match /active/
end

Then(/^The a to z button is selected$/) do
  on(WatchlistPage).list_link_element.parent.element().class_name.should match /active/
end
