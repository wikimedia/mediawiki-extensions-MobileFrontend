When /^I select Watchlist$/ do
  visit(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).watchlist_link_element.when_present.click
end

Then /^I receive watchlist message (.+)$/ do |text|
  on(RandomPage).login_text_wl_element.when_present.text.should match text
end