# Recorded CLI walkthrough

The documentation demo is a 34.64-second silent MP4, recorded on 2026-10-28 using actual CLI subprocesses on Node 22.23.2 at commit `b8cd4bfcc98cc78f6325e8cbeef4ac28cf6d6ef5`. It shows the two-operation payout passing, the broken second operation failing with an overlap, and missing creation time returning inconclusive. Observed exits were 0, 1 and 2. All inputs are unsigned synthetic fixtures. The complete output is preserved in `site/media/demo-transcript.json` and rendered as the video's text alternative.

The local loopback recording viewer is development tooling, not a hosted ClaimPlan product. It displays stdout/stderr from actual processes; it does not manufacture reports. The first attempt failed before running commands because a JavaScript string escaped a newline incorrectly; it was corrected and the failed video is excluded. Only the successful recording is published.

To record again:

1. Run `npm run build`, then `node scripts/record-demo.mjs`.
2. Open a browser recording at 1280×800 with playwright-cli. Start video, navigate to `http://127.0.0.1:8766/`, wait for `body[data-done="pass"]`, allow the final result to remain readable, then stop recording. The server accepts one recording per launch.
3. Inspect `artifacts/demo-transcript.json`, confirm all observed exits match, and view the recording. Never publish a failed run as successful.
4. Convert the captured WebM with ffmpeg: `ffmpeg -i artifacts/claimplan-demo-fixed.webm -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart -an site/media/claimplan-demo.mp4`.
5. Copy the matching transcript into `site/media/demo-transcript.json`; run `npm run docs:build`. Stop only the owned local viewer process.

No audio is present, so the full textual sequence is provided instead of an audio transcript. Future recordings must continue to use synthetic data and disclose exact scope. The recording is a finite demonstration, not an independent audit or a claim that ledger execution succeeds.
