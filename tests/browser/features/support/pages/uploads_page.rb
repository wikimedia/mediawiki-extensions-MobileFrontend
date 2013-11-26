class UploadsPage
  include PageObject
  include URL
  page_url URL.url("Special:Uploads")

  button(:next_button, class: "next")
  div(:tutorial, class: "mw-mf-overlay carousel tutorial")
end