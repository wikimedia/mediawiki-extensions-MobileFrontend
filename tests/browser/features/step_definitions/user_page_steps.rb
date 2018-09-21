Then(/^I should be on my user page$/) do
  on(UserPage) do |page|
    page.wait_until do
      page.heading_element.when_present
    end
    expect(page.heading_element).to be_visible
  end
end

Then(/^there should be a link to create my user page$/) do
  expect(on(UserPage).cta_edit_link_element).to be_visible
end

When(/^I click the create my user page link$/) do
  on(UserPage) do |page|
    page.wait_until_rl_module_ready('skins.minerva.editor')
    page.cta_edit_link_element.click
  end
end
