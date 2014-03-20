@custom-browser @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Basic site for legacy devices

  # FIXME: Add scenario to check search actually works
  # FIXME: Add scenario to check watch star actually works
  Scenario: Able to search in basic non-JavaScript site
    Given I am using user agent "Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54"
      And I am on the "Main Page" page
    When I click on "Random" in the main navigation menu
    Then I see the watch star
      And I see the search button
      # FIXME: Check that the edit button is invisible
      # FIXME: Check that the upload button is invisible

  Scenario: Able to access left navigation in basic non-JavaScript site
    Given I am using user agent "Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54"
      And I am on the "Main Page" page
    When I click on "Random" in the main navigation menu
      And I click on the main navigation button
    Then I see a link to "Home" in the main navigation menu
      And I see a link to "Random" in the main navigation menu
      And I see a link to "Settings" in the main navigation menu
      And I see a link to "Watchlist" in the main navigation menu
      And I see a link to "Log in" in the main navigation menu
      And I do not see a link to "Uploads" in the main navigation menu
      And I do not see a link to "Nearby" in the main navigation menu
