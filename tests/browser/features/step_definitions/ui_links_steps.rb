Then(/^I should see a link to the privacy page$/) do
  expect(on(ArticlePage).privacy_link_element).to be_visible
end

Then(/^I should see a link to the terms of use$/) do
  expect(on(ArticlePage).terms_link_element).to be_visible
end

Then(/^I should see the link to the user page of the last editor$/) do
  # T132753
  on(ArticlePage) do |page|
    page.wait_until do
      browser.execute_script("return mw.loader.getState('skins.minerva.scripts') === 'ready'")
    end
  end
  expect(on(ArticlePage).last_modified_bar_history_userpage_link_element).to be_visible
end

Then(/^I should see the history link$/) do
  expect(on(ArticlePage).standalone_edit_history_link_element).to be_visible
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
