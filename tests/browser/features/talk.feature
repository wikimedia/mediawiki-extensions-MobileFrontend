@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant
Feature: Talk

  Background:
    Given I am using the mobile site

  @smoke @integration
  Scenario: Talk doesn't show on talk pages
    Given the page "Talk:Selenium talk test" exists
     And I am logged in as a user with a > 5 edit count
      And I am on the "Talk:Selenium talk test" page
    Then there should be no talk button

  Scenario: Talk on a page that does exist
    Given the page "Talk:Selenium talk test" exists
      And I am logged in as a user with a > 5 edit count
      And the page "Selenium talk test" exists
    When I click the talk button
    Then I should see the talk overlay

  Scenario: Talk on a page that doesn't exist (bug 64268)
    Given I am logged in as a user with a > 5 edit count
      And I am on a page that does not exist
    When I click the talk button
    Then I should see the talk overlay

  @smoke @integration
  Scenario: Add discussion on talk page possible as logged in user
    Given the page "Talk:Selenium talk test" exists
      And I am logged in as a user with a > 5 edit count
      And the page "Selenium talk test" exists
    When I click the talk button
    Then there should be an add discussion button

  Scenario: Add discussion on talk page not possible as logged out user
    Given the page "Talk:Selenium talk test" exists
      And the page "Selenium talk test" exists
    Then there should be no talk button
