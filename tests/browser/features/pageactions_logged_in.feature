@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @login @test2.m.wikipedia.org
Feature: Page actions menu when logged in

  Background:
    Given I am logged into the mobile website
      And I am on the home page

  Scenario: I can see the edit button on the Main Page
    Then I should see the edit icon

  Scenario: I cannot upload a lead photo to the Main Page
    When I click on the upload icon
    Then I receive an upload error message

  Scenario: I can add the Main Page to my watchlist
    When I click on watchlist icon
    Then I receive notification that the article has been added to the watchlist

