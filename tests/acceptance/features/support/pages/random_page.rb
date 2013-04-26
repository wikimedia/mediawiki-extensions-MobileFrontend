class RandomPage
  include PageObject

  def self.url
    if ENV['MEDIAWIKI_URL']
      mediawiki_url = ENV['MEDIAWIKI_URL']
    else
      mediawiki_url = 'http://127.0.0.1:80/wiki/'
    end
    "#{mediawiki_url}Special:Random"
  end
  page_url url
end
