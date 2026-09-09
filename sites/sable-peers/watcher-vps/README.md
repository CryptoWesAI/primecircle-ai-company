# The watcher's runner on the VPS

Why: GitHub ran the hourly schedule about seven times a day in the first week (33 checks in four days, gaps of two to six hours), so the Observatory's record had holes and the chart's watcher line was thin. A container on the VPS runs the same `watch.py` at minute 05 of every hour and pushes the result to the same public repository, so the record stays public and the commit trail stays the proof. The GitHub schedule (:17 and :47) stays as a fallback; when both run, the ledger gets an extra line that hour, which is harmless.

How it pushes without a secret passing through anyone: the deploy key is generated on the VPS and only its public half is added on GitHub (deploy key, write access, this repository only). The private key sits in `/opt/sable-watch/keys` (mode 600), mounted read-only into the container. The app's push secret is copied from the site's own `.env` on the VPS so the phones get the same notifications the Action sends.

Files: `Dockerfile` (python, poppler, git, ssh), `loop.sh` (sleeps to the next :05), `run.sh` (pull, watch, commit with the Action's messages, push, notify), `docker-compose.yml`, `deploy-watcher.sh` (local, idempotent).

Operate:

```sh
bash deploy-watcher.sh                                   # first time and after any change; prints the public key
ssh -i ~/.ssh/primecircle_codex_vps root@31.97.123.34 "docker logs --since 2h sable-watch"   # what the last runs did
ssh -i ~/.ssh/primecircle_codex_vps root@31.97.123.34 "docker exec sable-watch /app/run.sh"  # run one watch now
```

Conflicts: if the Action and the runner append to the ledger in the same hour and the rebase conflicts, the runner drops its own commit for that hour and resets to the published record. Nothing of value is lost: the next hour runs clean.
