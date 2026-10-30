# Pomodoro Timer

A small pomodoro timer I vibe-coded for my own study sessions. No framework, no build step, no dependencies — just three files and a couple of video loops.

Open `index.html` in a browser and it works.

## What it does

- 25-minute work / 5-minute break cycle, with editable durations (saved per browser)
- Start / pause with the buttons or the space bar
- Beep when a phase ends; the next phase waits for you, it never auto-runs
- Big countdown in the tab title, so it's readable from the tab strip
- Local wall clock in the corner, click to switch 12/24-hour
- Backdrop switches itself: sunset beach by day, city skyline at night

## Notes

- Durations and clock format live in `localStorage`, so they stick per browser and per origin.
- Day/night switch is hard-coded to 19:00–07:00.
- Built for desktop; it's responsive but that was never the point.

## Credits

- Beach loop: [Pexels](https://www.pexels.com/) (free license)
- Night city loop: [Mixkit](https://mixkit.co/) (free license)
- Fonts: system stacks only, nothing downloaded

## License

MIT — do whatever you want with it.
