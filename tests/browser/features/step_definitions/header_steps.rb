
When /^I click the edit icon$/  do
 on(HomePage).edit_icon_element.when_present.click
end

When /^I click on the upload icon$/  do
 on(HomePage).upload_icon_element.when_present.click
end

When /^I click on watchlist icon$/  do
  on(HomePage).watch_link_element.when_present.click
end
