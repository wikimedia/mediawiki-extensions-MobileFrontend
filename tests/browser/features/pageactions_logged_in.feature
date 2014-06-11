@chrome @en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @firefox @login @test2.m.wikipedia.org
Feature: Page actions menu when logged in

  Background:
    Given I am logged into the mobile website
      And I am on the "Main Page" page

  Scenario: I can see the edit button on the Main Page
    Then I should see the edit icon

  Scenario: I cannot upload a lead photo to the Main Page
    Then there is not an upload an image to this page button

  Scenario: I can add the Main Page to my watchlist
    When I click on watchlist icon
    # Note could be watched or unwatched so do not check message
    Then I see a toast notification
