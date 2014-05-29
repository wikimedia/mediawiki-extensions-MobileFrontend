@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Toggling sections

  Scenario: Section open by default on tablet
    Given I am viewing the site in tablet mode
    And I go to a page that has sections
    When I click on the first collapsible section heading
    Then I do not see the content of the first section
