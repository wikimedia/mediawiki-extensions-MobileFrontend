# FIXME: this inherits from ArticlePage here for the photo_description element
# move uploads related elements to BasePage?
class UploadPage < ArticlePage
  include PageObject
  include URL
  page_url URL.url('Special:Uploads')

  div(:contribute_image, class: 'ctaUploadPhoto')
  # This may seem confusing but one is a DIV and one is an A tag
  a(:tutorial_link, href: '#/upload-tutorial/uploads')
  file_field(:select_file, name: 'file')
  button(:upload_button, text: 'Upload')
  a(:uploaded_image_link, class: 'image')
end
