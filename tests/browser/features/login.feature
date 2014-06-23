@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Login

  Scenario: Not logged in
    Given I am on the "Main Page" page
    When I click on "Log in" in the main navigation menu
    Then I see a message box at the top of the login page
      And I do not see a message warning me I am already logged in

  @login
  Scenario: Already logged in
    Given I am logged into the mobile website
      And I am on the "Special:UserLogin" page
    Then I do not see a message box at the top of the login page
      And I see a message warning me I am already logged in

  @login
  Scenario: Password reset available
    Given I am logged into the mobile website
    When I am on the "Special:UserLogin" page
    Then I see a password reset link
