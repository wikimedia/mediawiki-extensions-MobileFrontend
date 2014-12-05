class MobileOptions
  include PageObject

  include URL
  page_url URL.url('Special:MobileOptions')

  label(:beta, text: 'Beta')
  button(:save_settings, id: 'mw-mf-settings-save')
end
