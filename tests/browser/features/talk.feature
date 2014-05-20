@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Talk
  Background:
    Given I am in beta mode

  Scenario: Talk doesn't show on talk pages
    Given the page "Talk:Selenium talk test page" exists
    Then there is no talk button

  Scenario: Talk on a page that does exist
    Given the page "Talk:Selenium talk test page" exists
      And the page "Selenium talk test page" exists
    When I click the talk button
    Then I see the talk overlay

  Scenario: Talk on a page that doesn't exist (bug 64268)
    Given I am on a page that does not exist
    When I click the talk button
    Then I see the talk overlay
