@firefox

Feature: Nearby page (mobile interface)
  Test currently only works with Firefox

  Scenario: Nearby exists
    Given I am on the nearby page
    Then I should see at least one result in the nearby items list