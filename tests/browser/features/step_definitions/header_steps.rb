When /^I click on watchlist icon$/  do
  on(ArticlePage).watch_link_element.when_present.click
end
