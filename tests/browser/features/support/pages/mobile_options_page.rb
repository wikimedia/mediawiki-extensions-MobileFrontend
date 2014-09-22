class MobileOptions
  include PageObject

  include URL
  page_url URL.url("Special:MobileOptions")

  label(:beta, css: "div.mobileoption:nth-child(3) > div:nth-child(1) > label:nth-child(2)")
  button(:save_settings, id:"mw-mf-settings-save")
end
