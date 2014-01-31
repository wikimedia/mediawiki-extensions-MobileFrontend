class MobileOptions
  include PageObject

  include URL
  page_url URL.url("Special:MobileOptions")

  div(:beta_parent, id: "enable-beta-toggle")
  div(:alpha_parent, id: "enable-alpha-toggle")

  span(:beta) do |page|
    page.beta_parent_element.span_element(class: "mw-mf-settings-off")
  end
  span(:alpha) do |page|
    page.alpha_parent_element.span_element(class: "mw-mf-settings-off")
  end
  button(:save_settings, id:"mw-mf-settings-save")
end
