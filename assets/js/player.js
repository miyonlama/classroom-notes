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
  var titleTimer = null;

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

  function parseSource(url) {
    if (!url || typeof url !== "string") return null;
    var v = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    var l = url.match(/[?&]list=([A-Za-z0-9_-]{10,})/);
    var i = url.match(/[?&]index=(\d+)/);
    var videoId = v ? v[1] : null;
    var playlistId = l ? l[1] : null;
    if (!videoId && !playlistId) return null;
    var index = i ? parseInt(i[1], 10) : 1;
    if (!isFinite(index) || index < 1) index = 1;
    return { videoId: videoId, playlistId: playlistId, index: index };
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
    var url = state.url;
    var data = p.getVideoData();
    if (data && data.title) {
      setTitle(data.title);
      return;
    }
    // getVideoData() is often empty right after loadVideoById. Ask YouTube
    // oEmbed first, then noembed. Pin the URL so a late reply cannot rename
    // a different song.
    fetch("https://www.youtube.com/oembed?url=" + encodeURIComponent(url) + "&format=json")
      .then(function (r) {
        if (!r.ok) throw new Error("status " + r.status);
        return r.json();
      })
      .then(function (d) {
        if (d && d.title && state.url === url) setTitle(d.title);
      })
      .catch(function () {
        fetch("https://noembed.com/embed?url=" + encodeURIComponent(url))
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d && d.title && state.url === url) setTitle(d.title); })
          .catch(function () {});
      });
    if (titleTimer) clearInterval(titleTimer);
    var tries = 0;
    titleTimer = setInterval(function () {
      tries++;
      var latest = p.getVideoData ? p.getVideoData() : null;
      if (latest && latest.title && state.url === url) {
        setTitle(latest.title);
        clearInterval(titleTimer);
        titleTimer = null;
      } else if (tries >= 8) {
        clearInterval(titleTimer);
        titleTimer = null;
      }
    }, 700);
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
      if (!parseSource(value) || value === lastLoadedUrl) return;
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
    var source = parseSource(url);
    if (!source) {
      setStatus("That is not a YouTube video or playlist URL.", true);
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
      if (source.playlistId && player.loadPlaylist) {
        player.loadPlaylist({
          list: source.playlistId,
          listType: "playlist",
          index: source.index - 1
        });
      } else if (source.videoId) {
        player.loadVideoById(source.videoId, 0);
      }
      if (state.muted) player.mute(); else player.unMute();
      player.setVolume(state.volume);
      setTimeout(function () { if (state.url === url) applyVideoData(player); }, 500);
    } else {
      createPlayer(source.videoId, source.playlistId, source.index);
    }
  }

  function createPlayer(id, playlistId, index) {
    if (!window.YT || !window.YT.Player) {
      injectApi(function () { createPlayer(id, playlistId, index); });
      return;
    }
    var host = document.getElementById("yt-host");
    if (!host) return;
    var playerVars = {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      origin: window.location.origin
    };
    if (playlistId) {
      playerVars.list = playlistId;
      playerVars.listType = "playlist";
      playerVars.index = Math.max(0, (index || 1) - 1);
    }
    var options = {
      width: "1",
      height: "1",
      playerVars: playerVars,
      events: {
        onReady: function (e) {
          e.target.setVolume(state.volume);
          if (state.muted) e.target.mute(); else e.target.unMute();
          if (state.time > 0) e.target.seekTo(state.time, true);
          setStatus(state.title || ("YouTube · " + (id || "playlist")), false);
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
    };
    if (id) options.videoId = id;
    player = new window.YT.Player(host, options);
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
      var source = parseSource(state.url || typed);
      if (source) {
        if (!state.url) { state.url = typed; lastLoadedUrl = typed; saveState(); }
        pendingPlay = true;
        createPlayer(source.videoId, source.playlistId, source.index);
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
    // Keep the link in the input for convenience, but drop the saved song and
    // timestamp. Otherwise the first play resumes an old track mid-song.
    var restoredUrl = document.getElementById("yt-url").value;
    state.url = "";
    state.time = 0;
    state.title = "";
    lastLoadedUrl = "";
    saveState();
    if (window.location.hash === "#music") document.getElementById("yt-player").classList.add("is-open");
    if (parseSource(restoredUrl)) setStatus("Ready — press play", false);
    window.addEventListener("pagehide", saveState);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
