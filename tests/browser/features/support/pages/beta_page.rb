class BetaPage
  include PageObject

  include URL
  page_url URL.url('Special:MobileOptions/BetaOptIn')

  div(:beta_parent, id: 'enable-beta-toggle')
  span(:beta) do |page|
    page.beta_parent_element.span_element(class: 'mw-mf-settings-off')
  end
  button(:save_settings, id:'mw-mf-settings-save')
end
