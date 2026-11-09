# Shadow Yoddha website monetization setup

## Current state
- Static HTML/CSS/JavaScript browser game.
- No AdSense publisher ID or ad code is included.
- No ads.txt is included because the publisher ID has not yet been issued.
- Supporting About, How to Play, Privacy Policy, Terms and Contact pages are provided.
- The game itself is unchanged. No advertisements are placed over the canvas or touch controls.

## Before applying to AdSense
1. Review every supporting page and replace any inaccurate statements.
2. Add a real support email if available; Contact currently links to the project's GitHub issue tracker.
3. Create the AdSense account and add https://www.shadowyoddha.games.
4. Use the exact site verification / AdSense code Google supplies. Do not invent a publisher ID.
5. Configure a Google-certified consent management platform if required for visitors in the EEA, UK or Switzerland.
6. Request site review in AdSense. Ads do not serve until both account and site are approved.
7. After Google provides the publisher ID, publish the exact ads.txt line shown in AdSense at the domain root.
8. Only after approval, add ad units in clearly separated page areas. Never place ads next to, over, or in a way that resembles game controls.

## Suggested initial placement after approval
- One responsive display ad in the page content below the game and instructions.
- Avoid sticky/floating overlays and ads adjacent to jump/attack/power/phase controls.
- Do not insert interstitial or rewarded game ads until using an eligible, approved product and its required API integration.
- Never click your own ads, ask visitors to click ads, buy traffic, or use automated traffic.

## Deploy
The site is a static root-level website. Deploy the added HTML/CSS files and updated index.html to the existing Vercel project connected to this repository.
