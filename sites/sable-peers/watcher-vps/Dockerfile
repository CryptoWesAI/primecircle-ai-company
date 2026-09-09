# The watcher's runner on the VPS: the same watch.py the GitHub Action runs, on a clock that
# actually fires every hour. Python plus poppler (pdftotext), git and an ssh client for the push.
FROM python:3.12-slim
RUN apt-get update -q && apt-get install -y -q --no-install-recommends git poppler-utils openssh-client ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY loop.sh run.sh /app/
RUN chmod +x /app/loop.sh /app/run.sh
CMD ["/app/loop.sh"]
