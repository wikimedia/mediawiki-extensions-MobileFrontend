Given(/^I visit my user page$/) do
  visit(UserPage, using_params: { user: user })
end

Then(/^I should be on my user page$/) do
  on(UserPage) do |page|
    page.wait_until do
      page.heading_element.when_present
    end
    expect(page.heading_element).to be_visible
  end
end

Then(/^there should be a link to my contributions$/) do
  expect(on(UserPage).contributions_link_element).to be_visible
end

Then(/^there should be a link to my talk page$/) do
  expect(on(UserPage).talk_link_element).to be_visible
end

Then(/^there should be a link to my uploads$/) do
  expect(on(UserPage).uploads_link_element).to be_visible
end

Then(/^there should be a link to create my user page$/) do
  expect(on(UserPage).edit_link_element).to be_visible
end

When(/^I click the create my user page link$/) do
  on(UserPage) do |page|
    page.wait_until_rl_module_ready('skins.minerva.editor')
    page.edit_link_element.click
  end
end
