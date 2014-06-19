@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Special:History (Note test may take a long time to run on first run)

  Background:
    Given the page "Selenium diff test" exists and has at least 51 edits
      And I am on the "Selenium diff test" page
    When I click on the history link in the last modified bar

  Scenario: Check more button exists
    Then I see a more button

  Scenario: Check components in diff summary
    When I click the link in the header bar
    Then the text of the first heading is "Selenium diff test"

  Scenario: Check components in diff summary
    Then I see a list of page contributions
      And I see a summary of the last contribution to the page
      And the last contribution summary does not show the title of the page edited
      And the last contribution summary shows the edit summary
      And the last contribution summary shows the time of the last edit
      And the last contribution summary shows the username who made the last edit
