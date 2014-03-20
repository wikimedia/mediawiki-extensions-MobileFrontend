@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Nearby pages

Scenario: Nearby button visible
  Given I am in beta mode
    # FIXME: See README.txt this page must have geodata
    And I am on the "New York" page
  Then I see the nearby button

Scenario: Nearby button visible
  Given I am in beta mode
    # FIXME: See README.txt this page must have geodata
    And I am on the "New York" page
  When I click the nearby button
  Then I see the nearby overlay

Scenario: Page preview
  Given I am in beta mode
    # FIXME: See README.txt this page must have geodata
    And I am on the "New York" page
    And I click the nearby button
    And I see the nearby overlay
  When I click a nearby result
  Then I see the page preview overlay
