class BetaPage
  include PageObject

  def self.url
    if ENV['MEDIAWIKI_URL']
      mediawiki_url = ENV['MEDIAWIKI_URL']
    else
      mediawiki_url = 'http://127.0.0.1:80/wiki/'
    end
    "#{mediawiki_url}Special:MobileOptions/BetaOptIn"
  end
  page_url url

  div(:beta_parent, class: 'mw-mf-checkbox-css3')
  span(:beta) do |page|
    page.beta_parent_element.span_element(class: 'mw-mf-settings-off')
  end
  button(:save_settings, id:'mw-mf-settings-save')
end
