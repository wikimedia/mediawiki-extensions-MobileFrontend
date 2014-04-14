@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Nearby pages

Background:
  Given I am in beta mode
    And I am on a page with geodata

Scenario: Nearby button visible
  Then I see the nearby button

Scenario: Nearby button visible
  When I click the nearby button
  Then I see the nearby overlay

Scenario: Page preview
  Given I click the nearby button
    And I see the nearby overlay
  When I click a nearby result
  Then I see the page preview overlay
