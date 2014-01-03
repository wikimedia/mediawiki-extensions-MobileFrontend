class NearbyPage
  include PageObject
  include URL

  page_url URL.url("Special:Nearby")

  a(:a_nearby_list_item, name: 'item_0')
  ul(:nearby_items_list, class: 'page-list thumbs actionable')

end