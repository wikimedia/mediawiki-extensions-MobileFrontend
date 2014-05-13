# FIXME: this inherits from ArticlePage here for the photo_description element
# move uploads related elements to BasePage?
class UploadPage < ArticlePage
  include PageObject
  include URL
  page_url URL.url("Special:Uploads")

  div(:contribute_image, class: "button photo")
  # This may seem confusing but one is a DIV and one is an A tag
  a(:tutorial_link, class: "button photo")
  file_field(:select_file, name: 'file')
  button(:submit_button, text: "Submit")
  a(:uploaded_image_link, class: "image")
end
