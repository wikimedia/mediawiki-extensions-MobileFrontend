@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org @vagrant
Feature: Special:UserProfile

  Background:
    Given I am logged into the mobile website
      And I visit my user profile page

  Scenario: Check components in profile page
    Then I should be on my user profile page
      And I should see my last edit
      And there should be a link to my talk page
      And there should be a link to my contributions
      And there should be a link to my uploads
      And there should be a link to my user page
