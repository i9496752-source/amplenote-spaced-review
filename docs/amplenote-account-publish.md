# Amplenote Account Publish Walkthrough

Sources checked: 2026-05-13

- Bounty board: https://www.amplenote.com/bounty_plugins
- Bounty terms: https://www.amplenote.com/bounty_plugins/terms_conditions
- Plugin directory publishing: https://www.amplenote.com/help/published_plugins_directory
- Plugin installation: https://www.amplenote.com/help/installing_and_using_plugins
- Plugin builder guide: https://assets.amplenote.com/help/guide_to_developing_amplenote_plugins

This is the account-side path for publishing the Spaced Review plugin and preparing the bounty claim. Do not paste a PayPal address into the public plugin note.

## 1. Prepare The Note

1. Open Amplenote and create a note named `Spaced Review`.
2. Paste the full contents of `build/release-bundle/plugin-note.md` into the note.
3. Replace `<USAGE_VIDEO_URL>` and `<CODE_OVERVIEW_VIDEO_URL>` only after the videos exist. Until then, leave the note private or unpublished.
4. Confirm the metadata table is at the top of the note and the first JavaScript code block contains the plugin code.
5. Confirm the note includes the public repository link:
   `https://github.com/i9496752-source/amplenote-spaced-review`

## 2. Install And Smoke Test

1. Open Account Settings -> Plugins.
2. Choose the `Spaced Review` note from the Add Plugin flow.
3. Enable the plugin.
4. Create a separate note named `Spaced Review Sample Cards`.
5. Paste `build/release-bundle/sample-cards.md` into the sample note.
6. Run `Create review deck`.
7. Run `Add review cards from this note` from the sample note.
8. Open the generated deck note and confirm it contains card state rows.
9. Run `Review due cards`.
10. Rate at least three cards: one Again, one Good, and one Easy.
11. Reopen the deck note and confirm due dates, intervals, reps, and lapses changed.

Capture any visible plugin error before publishing. If the install or smoke test fails, fix the repository and rebuild before submitting a claim.

## 3. Publish To The Plugin Directory

1. In the plugin note, add the final usage and code overview video URLs.
2. Publish the plugin note from Amplenote's access/share controls so it receives a public note token.
3. Expand the public token/publish options.
4. Check the option to submit the note to the Amplenote Plugin Directory.
5. Save the publish options.
6. Keep the public plugin URL for the claim email.
7. Check the Plugin Directory a few hours later and save the final directory URL if Amplenote creates a separate listing URL.

Official directory guidance says published plugin notes can be submitted through the note token options and may take a few hours to appear in the directory.

## 4. If Publishing Is Blocked

The Amplenote builder guide says note publishing normally requires an Unlimited subscription. If the account cannot publish the note, email `support@amplenote.com` with:

- The plugin name: `Spaced Review`
- The bounty name: `Spaced repetition plugin`
- The repository URL: `https://github.com/i9496752-source/amplenote-spaced-review`
- A short note that the plugin is ready but account publishing is blocked

Do not send PayPal details until the plugin is published or Amplenote explicitly requests the invoice.
