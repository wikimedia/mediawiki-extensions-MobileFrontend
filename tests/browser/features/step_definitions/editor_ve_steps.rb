Given(/^VisualEditor has loaded$/) do
  on(ArticlePage).editor_ve_element.when_present.should exist
end
