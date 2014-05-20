@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Special:UserProfile

  Background:
    Given I visit my user profile page

  Scenario: Check components in profile page
    Then I am on my user profile page
      And I can see my last edit
      And there is a link to my talk page
      And there is a link to my contributions
      And there is a link to my uploads
      And there is a link to my user page
