class EditPage
  include PageObject

  button(:edit_cancel_button, text:'Cancel')
  button(:edit_continue_button, text:'Continue')
end