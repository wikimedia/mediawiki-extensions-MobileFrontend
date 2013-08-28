Given /^(.+) has not been created$/ do |article|
  visit(CreateArticlePage, :using_params => {:article_name => article})
  if on(CreateArticlePage).doesnotexist_msg_element.element
    on(HomePage).edit_icon_enabled_element.when_present.click
  end
end

