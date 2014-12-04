@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org @vagrant
Feature: Talk
  Background:
    Given I am using the mobile site
      And I am in beta mode

  Scenario: Talk doesn't show on talk pages
    Given the page "Talk:Selenium talk test" exists
      And I am on the "Talk:Selenium talk test" page
    Then there should be no talk button

  Scenario: Talk on a page that does exist
    Given the page "Talk:Selenium talk test" exists
      And the page "Selenium talk test" exists
    When I click the talk button
    Then I should see the talk overlay

  Scenario: Talk on a page that doesn't exist (bug 64268)
    Given I am on a page that does not exist
    When I click the talk button
    Then I should see the talk overlay
