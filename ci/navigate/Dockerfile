# syntax=docker/dockerfile:1
FROM python:3.11-slim-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DISPLAY=:99 \
    CHROME_BIN=/usr/bin/chromium \
    CHROMEDRIVER_BIN=/usr/bin/chromedriver \
    PROFILE_DIR=/data/profile

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      chromium \
      chromium-driver \
      xvfb \
      xauth \
      tini \
      ca-certificates \
      fonts-liberation \
      fonts-noto-cjk \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY server ./server

RUN useradd --create-home --uid 10001 app \
 && mkdir -p /data/profile \
 && chown -R app:app /data /app

# undetected-chromedriver patches the driver binary in place; /usr/bin is
# read-only for the runtime user, so give it a writable copy.
RUN cp /usr/bin/chromedriver /usr/local/bin/chromedriver \
 && chown app:app /usr/local/bin/chromedriver \
 && chmod 755 /usr/local/bin/chromedriver

ENV CHROMEDRIVER_BIN=/usr/local/bin/chromedriver

# amd64 production images should opt into real Google Chrome: Cloudflare's
# managed challenge refuses to auto-pass under Debian's chromium build. There
# is no linux-arm64 Chrome for Testing, so the default stays on Debian Chromium.
# Drop pre-fetched chrome-linux64.zip / chromedriver-linux64.zip into
# .cft-cache/ to build offline (empty by default -> downloaded at build time).
# Bind mount keeps the zips out of the image layer.
ARG CHROME_FOR_TESTING=0
RUN --mount=type=bind,source=.cft-cache,target=/opt/cft-cache \
      CHROME_FOR_TESTING=${CHROME_FOR_TESTING} CFT_CACHE=/opt/cft-cache \
      python /app/server/install_cft.py /opt/cft

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4)"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["xvfb-run", "-a", "--server-args=-screen 0 1440x900x24 -nolisten tcp", \
     "uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "8000", \
     "--no-access-log", "--timeout-keep-alive", "10"]
