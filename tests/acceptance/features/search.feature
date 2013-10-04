Feature: Search

  Scenario: Seach for partial text
    Given I am on the home page
     When I click the placeholder search box
       And I type into search box bara
    Then Search results should contain Barack Obama
