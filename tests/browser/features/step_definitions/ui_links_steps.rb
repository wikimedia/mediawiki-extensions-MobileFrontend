Then(/^I should see a link to the privacy page$/) do
  expect(on(ArticlePage).privacy_link_element).to be_visible
end

Then(/^I should see a link to the terms of use$/) do
  expect(on(ArticlePage).terms_link_element).to be_visible
end

Then(/^I should see the history link$/) do
  expect(on(ArticlePage).edit_history_link_element).to be_visible
end

Then(/^I should see the last modified bar history link$/) do
  expect(on(ArticlePage).last_modified_bar_history_link_element).to be_visible
end

Then(/^I should see the license link$/) do
  expect(on(ArticlePage).license_link_element).to be_visible
end

Then(/^I should see the switch to desktop link$/) do
  expect(on(ArticlePage).desktop_link_element).to be_visible
end
