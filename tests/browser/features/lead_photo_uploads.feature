@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @login @test2.m.wikipedia.org
Feature: Uploading a lead photo
  # Stable: New user scenarios
  Scenario: There is an upload button
    Given I am logged in as a new user
    When I go to a page with no lead photo
    Then There is an upload an image to this page button
    And The upload an image to this page button is enabled

  # Stable: +1 edit user scenarios
  Scenario: See Upload Overlay when click on upload button
    Given I am logged in as a user with a > 0 edit count
    When I go to a page with no lead photo
      And I upload Mobile file image.png on LeadPhotoPage
    Then I see the old upload overlay

  # Beta: new user scenarios
  Scenario: There is an upload button
    Given I am logged in as a new user
    Given I am in beta mode
    When I go to a page with no lead photo
    Then There is an upload an image to this page button
    And The upload an image to this page button is enabled

  Scenario: See tutorial as new user
    Given I am logged in as a new user
    Given I am in beta mode
    When I go to a page with no lead photo
    Then The upload button in page actions links to the tutorial

  # Beta: +1 edit user scenarios
  Scenario: There is an upload button
    Given I am logged in as a new user
    Given I am in beta mode
    When I go to a page with no lead photo
    Then There is an upload an image to this page button
    And The upload an image to this page button is enabled

  Scenario: See Upload Overlay when click on upload button
    Given I am logged in as a user with a > 0 edit count
    Given I am in beta mode
    When I go to a page with no lead photo
      And I upload Mobile file image.png on LeadPhotoPage
    Then I see the upload overlay
      And I can enter a description for my file upload
