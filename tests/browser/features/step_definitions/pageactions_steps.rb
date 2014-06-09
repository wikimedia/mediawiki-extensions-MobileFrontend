When /^I click on watchlist icon$/  do
  on(ArticlePage).watch_link_element.when_present.click
end

Then(/^there is not an upload an image to this page button$/) do
  on(ArticlePage).upload_button_element.should_not exist
end
