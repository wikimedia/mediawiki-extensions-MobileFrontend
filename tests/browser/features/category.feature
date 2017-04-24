@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant @login
Feature: Categories

  Scenario: I can view categories
    Given I am in a wiki that has categories
      And I am using the mobile site
      And I am in beta mode
      And I am on the "Selenium categories test page" page
    When I click on the category button
    Then I should see the categories overlay
      And I should see a list of categories
