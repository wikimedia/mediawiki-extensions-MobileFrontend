@chrome @firefox @test2.m.wikipedia.org @vagrant @login
Feature:  User:<username>

  Background:
    Given I am logged into the mobile website
    And I am on the "User:Selenium_user_without_test_page" page

  Scenario: Check user page is editable
    And I should be on my user page
    Then there should be a link to create my user page
