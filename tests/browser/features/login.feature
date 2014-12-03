@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant
Feature: Login

  Background:
    Given I am using the mobile site

  Scenario: Not logged in
    Given I am on the "Main Page" page
    When I click on "Log in" in the main navigation menu
    Then I should see a message box at the top of the login page
      And I should not see a message warning me I am already logged in

  Scenario: Password reset available
    When I am on the "Special:UserLogin" page
    Then I should see a password reset link
