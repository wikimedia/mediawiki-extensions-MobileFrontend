class DiffPage
  include PageObject

  element(:inserted_content, 'ins', index: 0)
  element(:deleted_content, 'del', index: 0)
end
