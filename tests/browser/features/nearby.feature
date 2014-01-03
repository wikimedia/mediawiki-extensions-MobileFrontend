@chrome-bug @nearby_firefox



Feature: Nearby page (mobile interface)
  Test currently only works with Firefox

  Scenario: Nearby exists
    When I navigate to the nearby page
    Then I should see at least one result in the nearby items list