class BetaPage
  include PageObject
  include URLModule

  def self.url
    if ENV['MEDIAWIKI_URL']
      base_url = ENV['MEDIAWIKI_URL']
    else
      base_url = 'http://127.0.0.1:80/wiki/'
    end
    "#{base_url}Special:MobileOptions/BetaOptIn"
  end
  page_url url

  div(:beta_parent, class: 'mw-mf-checkbox-css3')
  span(:beta) do |page|
    page.beta_parent_element.span_element(class: 'mw-mf-settings-off')
  end
  button(:save_settings, id:'mw-mf-settings-save')
end
