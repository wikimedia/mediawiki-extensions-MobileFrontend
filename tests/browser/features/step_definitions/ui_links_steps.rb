Then(/^I see the history link$/) do
  on(ArticlePage).edit_history_link_element.should be_visible
end

Then(/^I see the last modified bar history link$/) do
  on(ArticlePage).last_modified_bar_history_link_element.should be_visible
end

Then(/^I see the switch to desktop link$/) do
  on(ArticlePage).desktop_link_element.should be_visible
end

Then(/^I see the license link$/) do
  on(ArticlePage).license_link_element.should be_visible
end

Then(/^I see a link to the terms of use$/) do
  on(ArticlePage).terms_link_element.should be_visible
end

Then(/^I see a link to the privacy page$/) do
  on(ArticlePage).privacy_link_element.should be_visible
end
