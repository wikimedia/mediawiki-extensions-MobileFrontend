When /^I click on the notification icon$/ do
  on(ArticlePage) do |page|
    page.wait_until do
      # Wait for JS to hijack standard link
      # TODO: If this approach works well, we should implement general
      # `wait_for_resource` and `resource_ready?` helper methods in
      # mw-selenium, and document this pattern on mw.org
      browser.execute_script("return mw.loader.getState('skins.minerva.notifications') === 'ready'")
    end

    page.notifications_button_element.when_present.click
  end
end

Given(/^I have no notifications$/) do
  expect(on(ArticlePage).notifications_button_element.when_present).to be_visible
  # This is somewhat hacky, but I don't want this test making use of Echo's APIs which may change
  browser.execute_script("$( function () { $( '.notification-count' ).hide(); } );")
end

When(/^I click the notifications overlay close button$/) do
  sleep 1
  on(ArticlePage).notifications_overlay_close_button_element.when_present.click
end

When(/^the notifications overlay appears$/) do
  on(ArticlePage).notifications_overlay_element.when_present
end

Then(/^after (.+) seconds I should not see the notifications overlay$/) do |seconds|
  sleep seconds.to_i
  expect(on(ArticlePage).notifications_overlay_element).not_to be_visible
end

Then(/^I should see the notifications overlay$/) do
  expect(on(ArticlePage).notifications_overlay_element.when_present).to be_visible
end
