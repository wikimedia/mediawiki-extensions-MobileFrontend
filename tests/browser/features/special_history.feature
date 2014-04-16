@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Special:History

  Background:
    Given I am in beta mode
      And the page "Selenium diff test" exists
    When I click on the history link in the last modified bar

  Scenario: Check components in diff summary
    When I click the link in the header bar
    Then The text of the first heading is "Selenium diff test"

  Scenario: Check components in diff summary
    Then I see a list of page contributions
      And I see a summary of the last contribution to the page
      And The last contribution summary does not show the title of the page edited
      And The last contribution summary shows the edit summary
      And The last contribution summary shows the time of the last edit
      And The last contribution summary shows the username who made the last edit
