class UploadsPage
  include PageObject
  include URL
  page_url URL.url("Special:Uploads")

  div(:contribute_image, class: "button photo")
  # This may seem confusing but one is a DIV and one is an A tag
  a(:tutorial_link, class: "button photo")
  text_area(:description_textarea, name: "description")
  button(:next_button, class: "next")
  file_field(:select_file, name: 'file')
  button(:submit_button, text: "Submit")
  div(:tutorial, class: "mw-mf-overlay carousel tutorial")
  a(:uploaded_image_link, class: "image")
end
