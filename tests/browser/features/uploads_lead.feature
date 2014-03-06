@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org @login
Feature: Lead image uploads

  Background:
    Given I am logged in as a user with a > 0 edit count
      And I am on the "Nonexistent_page_abc" page
    When I click the upload button to stage the image file "image.png"

  Scenario: Opening upload preview
    Then I see the upload preview
      And I can enter a description for my file upload

  Scenario: Closing upload preview (overlay button)
    When I click the upload preview overlay close button and confirm
    Then I don't see the upload preview
      And The URL of the page should contain "Nonexistent_page_abc"

  Scenario: Closing upload preview (browser button)
    When I click the browser back button and confirm
    Then I don't see the upload preview
      And The URL of the page should contain "Nonexistent_page_abc"
