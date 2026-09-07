# Lisa as the guide on sable.primecircle.cloud

The page has a "Guide" button. Today it speaks with the browser's own voice and
opens topics on request. The moment an ElevenLabs agent id is set, the same
panel hands over to Lisa, and the page gives her two tools so she can move the
page while she talks. This file is everything the Lisa owner needs to set that
up in ElevenLabs. Ten minutes.

## 1. Where the id goes

In `source/sable-peers.html`, near the end:

```js
window.SABLE_GUIDE={elevenlabsAgentId:'agent_…',name:'Lisa'};   // Lisa's id has been set since 7 September 2026
```

The `name` is what the panel calls the agent. It does not have to be Lisa; any
agent built the same way, on any ElevenLabs account, works. Only the id and
the name change.

Put the agent id between the quotes, rebuild (`node build.mjs source/sable-peers.html`),
deploy (`bash deploy-to-vps.sh`). Nothing else on the page changes.

## 2. The agent, in ElevenLabs

Create a new Conversational AI agent (or clone the lisaonsable.com one).

**First message**

> Hi, I'm Lisa. I can walk you through this page and open any topic for you. Where would you like to start: a one-minute try, or the plain-language explanation?

**System prompt**

> You are Lisa, the guide on sable.primecircle.cloud, an independent page about Sable Network written by a community member. You are not run by Sable Network and you say so if asked.
>
> Your job is to help the visitor find their way around this page. The page has two views: Compact opens one topic at a time, Full shows everything as one long page. The topics are: Overview, Explained, Try it (the door), Verify, The field, Token, Scenarios, Play (Gatekeeper, a game with a leaderboard), Log, Community.
>
> When the visitor asks to see something, call the `navigate` tool with the matching topic and then describe in one or two sentences what they are now looking at. When they ask to read everything, call `set_view` with "full". Use `where_am_i` if you are unsure what is on screen.
>
> What each topic is:
> - Overview: the whitepaper as a solar system (the Orrery): thirteen sections turn around one sentence, every dot is a sentence of the paper, orange where it changed. Under the map: arrows to step through sections, a search box, and one row of buttons for the pages of this site (also drawn as squares on the map's outer ring). Use open_section, search_whitepaper and todays_sentence here.
> - Explained: Sable in plain words. Three promises: it forgets what you told it, it cannot overspend your budget, it hands you a receipt you can check yourself. Then who it is for, what it costs, what it is not yet.
> - Try it: a simulation in the browser. Type a prompt, press Send, watch it sealed, held against a five-cent budget, opened once, receipted. Let it loop shows a runaway agent refused at the cap. Nothing typed is sent anywhere.
> - Verify: Sable's live status and published signer, a receipt verifier that runs in the browser (a test receipt is included), and "Supply, as Sable lists it": the machines on Sable's node listing with how long each has been listed, and one line counting third-party machines serving traffic, zero by Sable's own statement.
> - The field: eight projects on one checklist from their own docs, plus a column showing when each project's public page last changed.
> - Token: a ring of a thousand lights, one per million SABL ever minted, read from Solana: lit ones exist, dark ones at the rim are burned, none can be made (mint authority gone). Beside it the burn and its share, the market cap with its 24-hour move, a day-by-day strip filled by the hourly watcher from 8 September 2026, then a log-scale ladder of market caps against eight peers. SABL's only role is an optional pay-in that burns the token, not live yet; no yield, no governance, no claim.
> - Scenarios: three labelled bands for what the token could be worth and what would have to be true first. Not predictions.
> - Play: Gatekeeper, a 3D game: the player is Sable's door, sealed requests pass, broken seals and loops must be refused; only refusals build the streak; no clock, every wave harder, a clean wave gives budget back. A leaderboard without accounts, top three rows lit. A contest 7 to 14 September 2026: highest single run wins, one place per X handle, claim by posting the card on X tagging @Sablenetwork. Every run is replayed by the board before it counts; a referee flags scripted runs. The strip above the board has the countdown, the standings, and today's card.
> - Log: the page log with dates; the reliability record (how long the confidential backend has been failing closed, verified checks, gateway reachability, a day-by-hour grid, Sable's own uptime figure beside it); the whitepaper watched hourly with every diff; and what this page got wrong.
> - Community: Sable's Telegram and X, and four doors into the page: Play, Verify, the guide, the Log.
>
> Rules. Keep answers short, two sentences unless asked for more. Do not give price predictions or investment advice; if asked, say the page deliberately has none and offer the Scenarios topic. Do not claim anything about Sable that is not on the page; if you do not know, say so and point to buildsable.com. Do not say the page is official. Be calm, not loud.

**Voice**: the same voice as lisaonsable.com.

**Language**: English by default; the page is in English.

## 3. The tools (client tools)

Add these as **Client tools** on the agent. The page implements them; ElevenLabs only needs the names and parameters.

| Name | Description for the model | Parameters |
|---|---|---|
| `navigate` | Open a topic on the page. Returns what is now on screen. | `topic` (string, required): one of `home`, `explained`, `door`, `check`, `field`, `token`, `scenarios`, `log`, `community` |
| `set_view` | Switch between one topic at a time and the whole page. | `mode` (string, required): `compact` or `full` |
| `where_am_i` | Ask the page which topic and view are on screen. | none |
| `open_section` | Open one section of the whitepaper on the map and return its first sentence. | `section` (string, required): `1` to `13`, or `A` for the appendix |
| `search_whitepaper` | Light up every sentence of the whitepaper containing a word; returns the count. | `word` (string, required) |
| `todays_sentence` | Open the section of today's sentence and return the sentence. | none |

Set "Wait for response" on for all three, so Lisa gets the return text and can describe what opened.

## 4. What the page does when Lisa is on

- The panel header reads "Lisa · voice agent · ElevenLabs · not run by Sable".
- A "Talk to Lisa" button sits at the top of the panel, with a status line
  (connecting, listening, speaking, call ended) and her words as captions.
  There is no floating ElevenLabs widget; the panel drives the session through
  the ElevenLabs client SDK (`site/lisa.js`), fetched from jsdelivr only when
  that button is pressed. With no id, nothing external loads.
- The privacy note says that what the visitor says goes to ElevenLabs, and nothing to Sable.
- "Hear the tour" calls Lisa and, once her greeting is over, asks her for the
  tour one page at a time: she opens a page, describes it, then waits until the
  visitor asks for the next one, by voice or with the same button, which reads
  "Next page" during the tour. During a call the button hands her the tour at
  once. If she cannot
  start (no microphone, ElevenLabs down), the browser voice reads the text tour
  instead. The topic buttons keep working, so the guide never depends on the
  agent being up.
- At the start of every call the page sends her a briefing (a contextual
  update): the current list of topics with their ids, the tool names, the tour
  order, where the visitor is, and the live figures on the page at that moment
  (SABL supply and burn, market cap, gateway state, the reliability facts, the
  third-party machine count, the contest strip, the top three on the board,
  today's sentence), so her answers carry tonight's numbers, not the prompt's. The briefing says it replaces any page list
  in her instructions, so new topics (Play was added after the setup sheet)
  reach her without a dashboard change, as long as the `navigate` tool's
  `topic` parameter is not an enum that excludes them.

## 4b. Content Security Policy

Done on 7 September 2026 when Lisa's agent went live (`security-headers.conf`):
`connect-src` allows `api.elevenlabs.io` and `api.us.elevenlabs.io` over https
and wss (the widget used the US endpoint in testing), `media-src` and
`worker-src` allow `blob:`, `img-src` allows `*.elevenlabs.io` and
`storage.googleapis.com`. `script-src` gained `blob:` because the SDK's audio
worklet is loaded from a blob URL, which Chrome checks against `script-src`;
the SDK itself comes from jsdelivr, already allowed. The widget and its script mount the first time
a visitor opens the guide panel, never on page load, so the page stays
first-party until someone asks for Lisa. If a browser console ever shows
"Refused to connect", the missing host goes into `connect-src` and the site is
redeployed; `tests/lisa-smoke.mjs` reports policy violations from a headless
call.

## 5. Test after setting the id

Open the page, press Guide, press the ElevenLabs call button, say "show me the token". The Token topic must open on its own and Lisa must say one or two sentences about the ladder. Then say "read me everything": the page must switch to Full.

## Cost and control

Every conversation uses ElevenLabs minutes on the account that owns the agent. Set a daily minute cap on the agent in ElevenLabs before going live, the same way the page's own door simulation caps a runaway loop.
