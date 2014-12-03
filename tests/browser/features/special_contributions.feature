@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org @vagrant
Feature: Special:Contributions

  Background:
    Given I am logged into the mobile website
    When I am on my contributions page

  Scenario: Check components in diff summary
    When I click the link in the header bar
    Then I should be on my user profile page

  Scenario: Check components in diff summary
    Then I should see a list of page contributions
      And I should see a summary of the last contribution
      And the last contribution summary should show the title of the page edited
      And the last contribution summary should show the edit summary
      And the last contribution summary should show the time of the last edit
      And the last contribution summary should not show the username
