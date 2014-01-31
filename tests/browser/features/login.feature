@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Login

  Scenario: Not logged in
    Given I am not logged in
    When I go to the login page
    Then I see a message box at the top of the login page
      And I do not see a message warning me I am already logged in

  Scenario: Already logged in
    Given I am logged into the mobile website
    When I go to the login page
    Then I do not see a message box at the top of the login page
      And I see a message warning me I am already logged in
