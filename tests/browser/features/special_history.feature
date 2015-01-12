@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org @vagrant
Feature: Special:History (Note test may take a long time to run on first run)

  Background:
    Given I am using the mobile site
      And the page "Selenium diff test" exists and has at least "51" edits
      And I am on the "Selenium diff test" page
    When I click on the history link in the last modified bar

  Scenario: Check components in diff summary
    When I click the link in the header bar
    Then the text of the first heading should be "Selenium diff test"

  Scenario: Check components in diff summary
    Then I should see a list of page contributions
      And I should see a summary of the last contribution
      And the last contribution summary should not show the title of the page edited
      And the last contribution summary should show the edit summary
      And the last contribution summary should show the time of the last edit
      And the last contribution summary should show the username who made the last edit
