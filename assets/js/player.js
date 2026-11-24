(function () {
  "use strict";

  var KEY = "classroom-notes-yt-player";
  var state = { url: "", time: 0, volume: 70, muted: false, title: "" };
  var player = null;
  var pendingPlay = false;
  var pollTimer = null;
  var lastSave = 0;
  var lastLoadedUrl = "";
  var loadTimer = null;

  var icons = {
    play: '<svg class="filled" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5L13 8L4 13.5Z"/></svg>',
    pause: '<svg class="filled" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="3" height="10"/><rect x="9" y="3" width="3" height="10"/></svg>',
    mute: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2Z"/><path d="M11 6l4 4M15 6l-4 4"/></svg>',
    sound: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2Z"/><path d="M11 5.5c1.2.7 1.2 3.3 0 4"/></svg>',
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>',
    chevron: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg>'
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      state.url = typeof saved.url === "string" ? saved.url : "";
      state.time = Number(saved.time) || 0;
      state.volume = typeof saved.volume === "number" ? saved.volume : 70;
      state.muted = !!saved.muted;
      state.title = typeof saved.title === "string" ? saved.title : "";
    } catch (e) {}
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function parseId(url) {
    if (!url) return null;
    var m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function fmt(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function setStatus(text, isError) {
    var el = document.getElementById("yt-status");
    if (!el) return;
    el.textContent = text;
    el.dataset.error = isError ? "true" : "false";
  }

  function setTitle(title) {
    if (!title) return;
    state.title = title;
    setStatus(title, false);
    saveState();
  }

  function applyVideoData(p) {
    if (!p || !p.getVideoData) return;
    var data = p.getVideoData();
    if (data && data.title) {
      setTitle(data.title);
      return;
    }
    // Fallback for players without getVideoData()
    fetch("https://noembed.com/embed?url=" + encodeURIComponent(state.url))
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.title) setTitle(d.title); })
      .catch(function () {});
  }

  function updateToggle(playing) {
    var btn = document.getElementById("yt-head-toggle");
    if (btn) btn.innerHTML = playing ? icons.pause : icons.play;
    var root = document.getElementById("yt-player");
    if (root) root.classList.toggle("is-playing", !!playing);
  }

  function build() {
    var root = document.createElement("div");
    root.className = "yt-player";
    root.id = "yt-player";
    root.innerHTML =
      '<div class="yt-player__host" id="yt-host"></div>' +
      '<div class="yt-player__head">' +
        '<span class="yt-player__mark" aria-hidden="true"></span>' +
        '<span class="yt-player__label">Music</span>' +
        '<span class="yt-player__status" id="yt-status">Paste a YouTube URL</span>' +
        '<button id="yt-head-toggle" type="button" aria-label="Play or pause">' + icons.play + '</button>' +
        '<button id="yt-expand" class="yt-player__expand" type="button" aria-label="Expand player">' + icons.chevron + '</button>' +
      '</div>' +
      '<div class="yt-player__body">' +
        '<input id="yt-url" type="url" placeholder="https://www.youtube.com/watch?v=..." aria-label="YouTube URL" />' +
        '<button id="yt-load" class="yt-player__load" type="button">LOAD</button>' +
        '<input id="yt-seek" class="yt-player__seek" type="range" min="0" max="100" value="0" aria-label="Seek" />' +
        '<span class="yt-player__time" id="yt-time">00:00 / 00:00</span>' +
        '<input id="yt-volume" class="yt-player__volume" type="range" min="0" max="100" value="70" aria-label="Volume" />' +
        '<button id="yt-mute" type="button" aria-label="Mute">' + icons.sound + '</button>' +
        '<button id="yt-close" class="yt-player__close" type="button" aria-label="Stop and clear">' + icons.close + '</button>' +
      '</div>';
    document.body.appendChild(root);

    document.getElementById("yt-url").value = state.url;
    document.getElementById("yt-volume").value = String(state.volume);
    updateMuteIcon();

    var urlInput = document.getElementById("yt-url");
    urlInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); loadFromInput(); }
    });
    urlInput.addEventListener("input", function () {
      if (loadTimer) clearTimeout(loadTimer);
      var value = urlInput.value.trim();
      if (!parseId(value) || value === lastLoadedUrl) return;
      loadTimer = setTimeout(loadFromInput, 700);
    });
    document.getElementById("yt-load").addEventListener("click", loadFromInput);
    document.getElementById("yt-head-toggle").addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });
    document.getElementById("yt-expand").addEventListener("click", function (e) {
      e.stopPropagation();
      root.classList.toggle("is-open");
    });
    root.querySelector(".yt-player__head").addEventListener("click", function () {
      root.classList.toggle("is-open");
    });
    document.getElementById("yt-seek").addEventListener("change", function (e) {
      if (!player || !player.seekTo) return;
      player.seekTo(Number(e.target.value), true);
      state.time = Number(e.target.value);
      saveState();
    });
    document.getElementById("yt-volume").addEventListener("input", function (e) {
      state.volume = Number(e.target.value);
      if (player && player.setVolume) player.setVolume(state.volume);
      if (state.muted && state.volume > 0) setMuted(false);
      saveState();
    });
    document.getElementById("yt-mute").addEventListener("click", function () { setMuted(!state.muted); });
    document.getElementById("yt-close").addEventListener("click", function () {
      if (player && player.stopVideo) player.stopVideo();
      state.url = ""; state.time = 0; state.title = ""; lastLoadedUrl = "";
      document.getElementById("yt-url").value = "";
      document.getElementById("yt-seek").max = "100";
      document.getElementById("yt-seek").value = "0";
      document.getElementById("yt-time").textContent = "00:00 / 00:00";
      updateToggle(false);
      setStatus("Paste a YouTube URL", false);
      document.getElementById("yt-player").classList.remove("is-open");
      saveState();
    });
  }

  function updateMuteIcon() {
    var btn = document.getElementById("yt-mute");
    if (btn) btn.innerHTML = state.muted ? icons.mute : icons.sound;
  }

  function setMuted(value) {
    state.muted = value;
    if (player && player.mute) {
      if (value) player.mute(); else player.unMute();
    }
    updateMuteIcon();
    saveState();
  }

  function loadFromInput() {
    var url = document.getElementById("yt-url").value.trim();
    var id = parseId(url);
    if (!id) {
      setStatus("That is not a YouTube video URL.", true);
      return;
    }
    state.url = url;
    state.time = 0;
    state.title = "";
    lastLoadedUrl = url;
    document.getElementById("yt-seek").max = "100";
    document.getElementById("yt-seek").value = "0";
    document.getElementById("yt-player").classList.add("is-open");
    setStatus("Ready — press play", false);
    saveState();
    if (player && player.loadVideoById) {
      player.loadVideoById(id, 0);
      if (state.muted) player.mute(); else player.unMute();
      player.setVolume(state.volume);
    } else {
      createPlayer(id);
    }
  }

  function createPlayer(id) {
    if (!window.YT || !window.YT.Player) {
      injectApi(function () { createPlayer(id); });
      return;
    }
    var host = document.getElementById("yt-host");
    if (!host) return;
    player = new window.YT.Player(host, {
      width: "1",
      height: "1",
      videoId: id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onReady: function (e) {
          e.target.setVolume(state.volume);
          if (state.muted) e.target.mute(); else e.target.unMute();
          if (state.time > 0) e.target.seekTo(state.time, true);
          setStatus(state.title || ("YouTube · " + id), false);
          applyVideoData(e.target);
          var readyDuration = e.target.getDuration && e.target.getDuration();
          if (readyDuration > 0) document.getElementById("yt-seek").max = String(Math.floor(readyDuration));
          if (pendingPlay) { pendingPlay = false; e.target.playVideo(); }
          startPoll();
        },
        onStateChange: function (e) {
          var isPlaying = e.data === window.YT.PlayerState.PLAYING || e.data === window.YT.PlayerState.BUFFERING;
          updateToggle(isPlaying);
          if (isPlaying) applyVideoData(e.target);
          if (e.data === window.YT.PlayerState.ENDED) {
            state.time = 0;
            saveState();
          }
        },
        onError: function (e) {
          var msg = "This video cannot be embedded (error " + e.data + ").";
          if (e.data === 2 || e.data === 5 || e.data === 100) msg = "Video unavailable or removed (error " + e.data + ").";
          setStatus(msg, true);
          updateToggle(false);
        }
      }
    });
  }

  function injectApi(cb) {
    if (window.__ytApiLoading) {
      var wait = setInterval(function () {
        if (window.YT && window.YT.Player) { clearInterval(wait); cb(); }
      }, 100);
      return;
    }
    window.__ytApiLoading = true;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === "function") prev();
      cb();
    };
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }

  function toggle() {
    if (!player || !player.playVideo) {
      var typed = document.getElementById("yt-url").value.trim();
      var source = state.url || typed;
      var id = parseId(source);
      if (id) {
        if (!state.url) { state.url = typed; lastLoadedUrl = typed; saveState(); }
        pendingPlay = true;
        createPlayer(id);
      }
      return;
    }
    var st = player.getPlayerState && player.getPlayerState();
    if (st === window.YT.PlayerState.PLAYING) player.pauseVideo();
    else player.playVideo();
  }

  function startPoll() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      if (!player || !player.getCurrentTime) return;
      var cur = player.getCurrentTime() || 0;
      var dur = player.getDuration() || 0;
      state.time = cur;
      document.getElementById("yt-time").textContent = fmt(cur) + " / " + fmt(dur);
      var seek = document.getElementById("yt-seek");
      if (dur > 0) {
        var max = String(Math.floor(dur));
        if (seek.max !== max) seek.max = max;
        seek.value = String(Math.min(cur, dur));
      }
      if (Date.now() - lastSave > 2000) { saveState(); lastSave = Date.now(); }
    }, 500);
  }

  function init() {
    loadState();
    build();
    lastLoadedUrl = state.url;
    if (window.location.hash === "#music") document.getElementById("yt-player").classList.add("is-open");
    var id = parseId(state.url);
    if (id) {
      setStatus(state.title || "Restored · press play", false);
      createPlayer(id);
    }
    window.addEventListener("pagehide", saveState);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
