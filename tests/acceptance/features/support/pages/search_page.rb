class SearchPage
  include PageObject

  text_field(:search_box_placeholder, name: 'search', index: 0)
  text_field(:search_box2, name: 'search', index: 1)
  li(:search_results, title: 'Barack Obama')
  a(:search_result) do |page|
    page.search_results_element.element.a
  end
end