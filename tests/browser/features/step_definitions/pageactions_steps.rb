Then(/^there is not an upload an image to this page button$/) do
  on(ArticlePage).upload_button_element.should_not exist
end
