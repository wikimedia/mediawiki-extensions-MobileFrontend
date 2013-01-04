Feature: Search

  Scenario: User can search from home page
    Given I am on the home page
    Then Search box should be there

  Scenario: Search for partial string
    Given I am on the home page
    When I type san
    Then Search results should contain San Francisco
