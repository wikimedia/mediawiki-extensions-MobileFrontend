Feature: Special:Uploads

  Scenario: See tutorial as new user

    Given I am logged in as a new user
    When I go to uploads page
    Then I see a blue tutorial screen
    And I see a next button
