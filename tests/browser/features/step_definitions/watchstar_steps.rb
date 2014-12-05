Given(/^I am viewing a watched page$/) do
  api.create_page 'Selenium mobile watch test', 'watch test'
  api.watch_page 'Selenium mobile watch test'
  step 'I am on the "Selenium mobile watch test" page'
end

Given(/^I am viewing an unwatched page$/) do
  api.create_page 'Selenium mobile watch test', 'watch test'
  api.unwatch_page 'Selenium mobile watch test'
  step 'I am on the "Selenium mobile watch test" page'
end

Then(/^I should see a toast with message about watching the page$/) do
  expect(on(ArticlePage).toast_element.when_present.text).to match 'Added Selenium mobile watch test to your watchlist'
end

Then(/^I should see a toast with message about unwatching the page$/) do
  on(ArticlePage) do |page|
    page.wait_until do
      page.text.include? 'Removed' # Chrome needs this, FF does not
    end
    expect(page.toast_element.when_present.text).to match 'Removed Selenium mobile watch test from your watchlist'
  end
end
