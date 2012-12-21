class MobilePage
  include PageObject

  def self.url
    if ENV['MEDIAWIKI_URL']
      ENV['MEDIAWIKI_URL']
    else
      'http://127.0.0.1:80'
    end
  end
  page_url url

  text_field(:search_box, id: 'mw-mf-search')
  a(:search_result, class: 'search-result-item')
  a(:watch_link, class: 'watch-this-article')
  a(:watched_link, class: 'watch-this-article watched')
end
