@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Special:Contributions

  Background:
    Given I am logged into the mobile website
      And I am on my contributions page

  Scenario: Check components in diff summary
    When I click the link in the header bar
    Then I am on my user profile page

  Scenario: Check components in diff summary
    Then I see a list of my contributions
      And I see a summary of my last contribution
      And the last contribution summary shows the title of the page edited
      And the last contribution summary shows the edit summary
      And the last contribution summary shows the time of the last edit
      And the last contribution summary does not show the username

