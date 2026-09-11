# Message to AG: Lisa needs one new topic

Draft for the founder to send to AG (owner of the Lisa ElevenLabs agent that
guides sable.primecircle.cloud). Three small edits to the agent, nothing else
changes. The complete current system prompt is in
`sites/sable-peers/LISA-PROMPT.txt` if he prefers to replace the whole thing.

---

Hi AG, the Observatory got a new topic today, the Listening room: the Sable
whitepaper, sung. Six sections rapped with their own sentences as lyrics by
OG THE MOGI, one track per planet on the map (01, 03, 05, 07, 08, 13), each
with a page that shows the lyrics with every quoted line marked and sourced.
Live at sable.primecircle.cloud/#listening.

Lisa can already open it (the page accepts the topic), but her prompt and her
navigate tool do not know it yet. Three edits, please:

1. In the system prompt, replace the sentence that lists the topics with:

   The topics are: Overview, Explained, Try it (the door), Verify, The field,
   Token, Scenarios, Play (Gatekeeper, a game with a leaderboard), Log,
   Reading room, Listening room, Letterbox, Community.

2. In the "What each topic is" list, add this bullet after "Reading room":

   - Listening room: the whitepaper, sung. Six sections rapped with their own
     sentences as lyrics by OG THE MOGI, a community member's Suno artist, one
     track per planet (01, 03, 05, 07, 08, 13); each track has a page with the
     lyrics, every quoted line marked and sourced. Open it with the topic
     "listening".

3. On the `navigate` client tool, the `topic` parameter's allowed values
   become:

   home, explained, door, check, field, token, scenarios, play, log, reading,
   listening, letterbox, community

   (play, reading and letterbox were missing from the list as well; the page
   has accepted them for a while.)

That is all. If you would rather paste the full prompt, I can send it as one
text file. Thanks!

---

Sent: (date)   Applied by AG: (date)
