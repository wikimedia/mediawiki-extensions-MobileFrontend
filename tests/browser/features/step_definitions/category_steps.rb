When(/^I click on the category button$/) do
  on(ArticlePage) do |page|
    page.wait_until_rl_module_ready('skins.minerva.categories')
    page.category_element.when_present.click
  end
end

Then(/^I should see the categories overlay$/) do
  on(ArticlePage) do |page|
    expect(page.overlay_heading_element.when_present.text).to match 'Categories'
  end
end

Then(/^I should see a list of categories$/) do
  on(ArticlePage) do |page|
    expect(page.overlay_category_topic_item_element.when_present).to be_visible
  end
end
