# Me Timer

A pomodoro timer I vibe-coded for my own study sessions. No framework, no build step, no dependencies — three files and a couple of video loops.

Open `index.html` in a browser and it works. Live at **https://hafizuldev.github.io/pomodoro-timer/**

## What it does

- 25-minute work / 5-minute break cycle, with editable durations (saved per browser)
- Start / pause with the buttons or the space bar
- Beep when a phase ends; the next phase waits for you, it never auto-runs
- Wall clock in the top right — click it to switch between 24-hour and 12-hour
- Backdrop picks itself from the actual sun: sunset beach while it's light, city skyline after dark

## Notes

- Durations and clock format live in `localStorage`, so they stick per browser and per origin.
- Sunrise/sunset is computed in the browser for Kuala Lumpur (`3.139, 101.687`, UTC+8). No network calls, no API. Moving? Change those two constants in `script.js`.
- Built for desktop; it's responsive but that was never the point.
- The tab title stays `Me Timer` — the countdown used to hijack it and no longer does.

## Credits

- Beach loop: [Pexels](https://www.pexels.com/) (free license)
- Night city loop: [Mixkit](https://mixkit.co/) (free license)
- Fonts: system stacks only, nothing downloaded
- Icon: hand-written SVG tomato, no image assets

## License

MIT — do whatever you want with it.
