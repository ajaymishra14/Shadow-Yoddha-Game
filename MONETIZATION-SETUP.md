# Shadow Yoddha — monetization readiness

Last reviewed: 9 November 2026

## Verified in the repository

- The site is a static HTML/CSS/JavaScript browser game.
- `index.html` loads the Google AdSense library with client identifier `ca-pub-4497669558668906`.
- Root-level `ads.txt` currently contains:
  `google.com, pub-4497669558668906, DIRECT, f08c47fec0942fa0`.
- Supporting pages exist: About, How to Play, Privacy Policy, Terms of Use and Contact.
- `robots.txt` allows crawling and references `https://www.shadowyoddha.games/sitemap.xml`.
- `sitemap.xml` lists the home page and supporting pages.
- Gameplay high score and campaign progress are stored locally by the existing game code. This monetization work must not rename, clear, migrate or overwrite those keys:
  - `offlineRunnerBestScore`
  - `shadowYoddhaCampaignV1`
  - `shadowSound`
  - `shadowEffects`

## What this does — and does not — prove

The repository contains an AdSense client identifier and an ads.txt seller declaration. That confirms the integration artifacts are present in source control; it does **not** prove that the identifier belongs to the site owner, that Google has crawled ads.txt, that the AdSense account is active, or that the domain has passed Google's site review. Confirm the identifier and approval status in the owner's AdSense account before relying on revenue.

The current home page loads the AdSense library, but the checked `index.html` does not contain a manually configured ad-unit block. Do not add a made-up publisher ID, ad-unit ID, or pretend that ads are serving.

## Required owner checks in AdSense

1. Sign in to the AdSense account that owns the publisher ID shown above.
2. In **Account → Settings → Account information**, confirm the publisher ID matches the code and ads.txt entry.
3. In **Sites**, confirm `www.shadowyoddha.games` is listed and check its exact status (for example, Getting ready, Requires review, or Ready).
4. If the site is not Ready, resolve the issues shown by Google and request review from the Sites page. Approval is not guaranteed and can take days or, in some cases, 2–4 weeks.
5. In the AdSense ads.txt status, confirm Google can fetch the root file. Check both the apex and www domain routing so `https://shadowyoddha.games/ads.txt` ultimately resolves to the correct file.
6. Review Auto ads settings. Do not allow formats or placements that interfere with gameplay or create accidental clicks.
7. If serving ads to visitors in the EEA, UK or Switzerland, configure a Google-certified consent management platform when required by Google's rules.

## Safe ad placement for a game website

- Keep ads visually separate from the canvas, start/restart buttons, keyboard/touch controls, pause/settings controls and navigation.
- Google's game-page guidance strongly recommends placing AdSense for content ads at least **150 pixels away from the game**, or removing them from gameplay pages.
- Prefer a clearly labelled, responsive display placement in editorial content well below the game and instructions, only after approval.
- Do not put ads in overlays, between a player and the game, beside touch controls, or where the ad could be mistaken for a game button.
- Do not add interstitial or rewarded ads using ordinary AdSense for content code. Use only an eligible product and its required integration if that becomes a future project.
- Never click your own ads, ask users to click them, buy traffic, or use bots/repeated refreshes to inflate impressions.

## Content and user-experience work before review

- Keep the game playable and mobile-friendly; test keyboard and touch controls.
- Keep About, How to Play, Privacy, Terms and Contact accurate and reachable from the home page.
- Publish genuinely useful original material (for example, detailed gameplay guides, update notes, level/ability explanations and troubleshooting) only when it is complete and helpful. Do not publish thin, duplicated or keyword-stuffed pages merely to increase page count.
- Use a real support email if one is established; otherwise keep the current GitHub issue tracker and do not invent an email address.
- Re-check all statements in the Privacy Policy whenever analytics, ads, cookies, forms or other third-party services change.

## Deployment and preservation

- This project is a static root-level site. Deploy through the existing hosting project after reviewing the pull request and verifying the preview.
- This Phase 1 audit changes documentation only. It does not modify the game engine, canvas, gameplay controls, saved-score key, campaign progression key, or ad-serving code.
- After deployment, verify the home page, all navigation links, `/robots.txt`, `/sitemap.xml` and `/ads.txt` return the intended content.
- Check the final live domain and AdSense account directly; a successful GitHub commit or deployment is not an AdSense approval.
