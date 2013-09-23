Feature: Special:Uploads

  Scenario: See tutorial as new user
    # FIXME: This should be an account with zero uploads - may want a specific account for this purpose
    Given I am logged into the mobile website
    When I go to uploads page
    Then I see a blue tutorial screen
    And I see a next button
