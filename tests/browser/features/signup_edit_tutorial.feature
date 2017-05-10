@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @vagrant @login
Feature: Signup edit tutorial

  Background:
	Given I have just signed up after trying to edit as anonymous

  Scenario: Signup edit tutorial shows up correctly and hides when main menu is opened
    Then I should see the signup edit tutorial
    When I click on the main navigation button
	Then I should not see the signup edit tutorial
