Feature: Mobile Search

  Scenario: User can search from mobile website home page
    Given I am on the mobile website
    Then Search box should be there

  Scenario: Search mobile website for partial string
    Given I am on the mobile website
    When I type san
    Then Search results should contain San Francisco
