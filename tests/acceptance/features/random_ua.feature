@user_agent
Feature: Setting User Agents

  Scenario: Opera Mini
    Given that I am using Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54
    When I go to random page
    Then I see that the correct user agent has been set
      And I see the Go button
      And I see Home element
      And I see Random element
      And I see Settings element
      And I do not see Watchlist element
      And I do not see Uploads element
      And I do not see Login/Logout element

  Scenario: Android 4.0.3
    Given that I am using Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
    When I go to random page
    Then I see that the correct user agent has been set
      And I see the Watchlist star
      And I see Home element
      And I see Random element
      And I see Settings element
      And I see Watchlist element
      And I see Uploads element
      And I see Login/Logout element
