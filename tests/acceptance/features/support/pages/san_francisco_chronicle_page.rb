class SanFranciscoChroniclePage
  include PageObject
  include URLModule

  def self.url
    if ENV['MEDIAWIKI_URL']
      base_url = ENV['MEDIAWIKI_URL']
    else
      base_url = 'http://127.0.0.1:80/wiki/'
    end
    "#{base_url}San_Francisco_Chronicle"
  end
  page_url url
end
