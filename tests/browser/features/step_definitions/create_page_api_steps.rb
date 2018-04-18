Given(/^the page "(.*?)" exists$/) do |title|
  api.create_page title, 'Test is used by Selenium web driver'
end

Given(/^the page "(.*?)" exists and has at least "(\d+)" edits$/) do |title, min_edit_count|
  # Page must first exist before we can get edit count information
  step 'the page "' + title + '" exists'
  min_edit_count = min_edit_count.to_i
  visit(ArticlePage, using_params: { article_name: title.gsub(' ', '_') + '?action=info' })
  on(ArticlePage) do |page|
    (page.edit_count.gsub(',', '').to_i + 1).upto(min_edit_count) do |n|
      api.create_page title, "Test is used by Selenium web driver edit ##{n}"
    end
  end
end
