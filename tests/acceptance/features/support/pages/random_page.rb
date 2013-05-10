class RandomPage
  include PageObject

  include URL
  page_url URL.url('Special:Random')
end
