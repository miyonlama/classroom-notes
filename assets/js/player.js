(function () {
  "use strict";

  var KEY = "classroom-notes-yt-player";
  var ART_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%232f7d58'/%3E%3Cpath d='M26 20l22 12-22 12Z' fill='%23f2c14e'/%3E%3C/svg%3E";
  var state = { url: "", time: 0, volume: 70, muted: false, title: "" };
  var player = null;
  var pendingPlay = false;
  var pollTimer = null;
  var lastSave = 0;
  var lastLoadedUrl = "";
  var loadTimer = null;
  var titleTimer = null;
  var lastQueueIndex = -1;
  var apiQueue = [];
  var apiFetched = false;
  var API_BASE = "https://www.googleapis.com/youtube/v3/";

  var icons = {
    play: '<svg class="filled" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5L13 8L4 13.5Z"/></svg>',
    pause: '<svg class="filled" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="3" height="10"/><rect x="9" y="3" width="3" height="10"/></svg>',
    mute: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2Z"/><path d="M11 6l4 4M15 6l-4 4"/></svg>',
    sound: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2Z"/><path d="M11 5.5c1.2.7 1.2 3.3 0 4"/></svg>',
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>',
    chevron: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg>',
    prev: '<svg class="filled" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="2" height="10"/><path d="M13 3L6 8l7 5Z"/></svg>',
    next: '<svg class="filled" viewBox="0 0 16 16" aria-hidden="true"><rect x="11" y="3" width="2" height="10"/><path d="M3 3l7 5-7 5Z"/></svg>'
  };

  function setPlayerOpen(open) {
    var root = document.getElementById("yt-player");
    if (!root) return;
    root.classList.toggle("is-open", !!open);
    var opener = document.getElementById("yt-open");
    if (opener) opener.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setMode(mode) {
    if (mode !== "url" && mode !== "api") return;
    var root = document.getElementById("yt-player");
    if (!root) return;
    if (root.dataset) root.dataset.mode = mode;
    var urlTab = document.getElementById("yt-tabs-url");
    var apiTab = document.getElementById("yt-tabs-api");
    if (urlTab) urlTab.setAttribute("aria-selected", mode === "url" ? "true" : "false");
    if (apiTab) apiTab.setAttribute("aria-selected", mode === "api" ? "true" : "false");
  }

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

  function apiGet(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) {
        return r.json().then(function (body) {
          var errs = body && body.error && body.error.errors;
          var reason = errs && errs[0] && errs[0].reason;
          throw reason || new Error("API status " + r.status);
        }, function () { throw new Error("API status " + r.status); });
      }
      return r.json();
    });
  }

  function mapApiItems(items, fromSearch) {
    return (items || []).map(function (item) {
      var snippet = item.snippet || {};
      var thumbs = snippet.thumbnails || {};
      var videoId = fromSearch
        ? (item.id && item.id.videoId)
        : (snippet.resourceId && snippet.resourceId.videoId);
      return {
        videoId: videoId || "",
        title: snippet.title || "",
        thumb: (thumbs.medium && thumbs.medium.url) || (thumbs.default && thumbs.default.url) || ""
      };
    }).slice(0, 5);
  }

  function storeApiQueue(result) {
    apiQueue = result.items;
    apiFetched = true;
    var title = document.getElementById("yt-queue-title");
    if (title) title.textContent = result.kind === "playlist" ? "UP NEXT" : "MORE LIKE THIS";
    renderQueue();
    return result;
  }

  function fetchApiQueue(key, source) {
    var q = "key=" + encodeURIComponent(key);
    if (source && source.playlistId) {
      return apiGet(API_BASE + "playlistItems?part=snippet&maxResults=5&playlistId=" +
        encodeURIComponent(source.playlistId) + "&" + q).then(function (data) {
        return { items: mapApiItems(data.items, false), kind: "playlist" };
      }).then(storeApiQueue);
    }
    var videoId = source && source.videoId;
    return apiGet(API_BASE + "videos?part=snippet&id=" + encodeURIComponent(videoId) + "&" + q)
      .then(function (data) {
        var first = data.items && data.items[0];
        var title = first && first.snippet && first.snippet.title || "";
        return apiGet(API_BASE + "search?part=snippet&type=video&maxResults=5&order=relevance&q=" +
          encodeURIComponent(title) + "&" + q).then(function (search) {
          return { items: mapApiItems(search.items, true), kind: "suggested" };
        });
      })
      .then(storeApiQueue);
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

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function setMeta(data) {
    if (!data) return;
    if (data.title) setTitle(data.title);
    if (data.author) {
      var author = document.getElementById("yt-author");
      if (author) author.textContent = data.author;
    }
    if (data.video_id) {
      var art = document.getElementById("yt-art");
      if (art) art.src = "https://i.ytimg.com/vi/" + data.video_id + "/mqdefault.jpg";
    }
    renderQueue();
  }

  function renderQueue() {
    var list = document.getElementById("yt-queue-list");
    if (!list) return;
    if (apiFetched) {
      if (apiQueue.length === 0) {
        list.innerHTML = '<li class="yt-queue__empty">No suggestions found</li>';
        return;
      }
      var apiHtml = "";
      for (var a = 0; a < apiQueue.length; a++) {
        var entry = apiQueue[a];
        var thumb = entry.thumb
          ? '<img src="' + escapeHtml(entry.thumb) + '" alt="" style="width:100%;height:100%;object-fit:cover" />'
          : "";
        apiHtml += '<li><button type="button" class="yt-queue__item" data-video-id="' + escapeHtml(entry.videoId) +
          '" aria-label="Play ' + escapeHtml(entry.title) + '">' +
          '<span class="yt-queue__thumb" aria-hidden="true">' + thumb + '</span>' +
          '<span class="yt-queue__text"><b>' + escapeHtml(entry.title) + '</b></span>' +
          '</button></li>';
      }
      list.innerHTML = apiHtml;
      return;
    }
    var source = parseSource(state.url);
    var current = 0;
    if (player && typeof player.getPlaylistIndex === "function") {
      var idx = player.getPlaylistIndex();
      if (typeof idx === "number" && isFinite(idx) && idx >= 0) current = idx;
    } else if (source && source.playlistId) {
      current = Math.max(0, source.index - 1);
    }
    if (!source || !source.playlistId) {
      list.innerHTML = '<li class="yt-queue__empty">Paste a playlist link to see upcoming tracks.</li>';
      return;
    }
    var html = "";
    for (var n = current; n < current + 4; n++) {
      var isCurrent = n === current;
      var label = isCurrent ? (state.title || "Now playing") : "Track " + String(n + 1).padStart(2, "0");
      html += '<li><button type="button" class="yt-queue__item' + (isCurrent ? " is-current" : "") +
        '" data-index="' + n + '" aria-label="Play track ' + (n + 1) + '">' +
        '<span class="yt-queue__no">' + String(n + 1).padStart(2, "0") + '</span>' +
        '<span class="yt-queue__thumb" aria-hidden="true"></span>' +
        '<span class="yt-queue__text"><b>' + escapeHtml(label) + '</b><small>' +
        (isCurrent ? "Now playing" : "Up next") + '</small></span>' +
        '</button></li>';
    }
    list.innerHTML = html;
  }

  function applyVideoData(p) {
    if (!p || !p.getVideoData) return;
    var url = state.url;
    var data = p.getVideoData();
    if (data && data.title) {
      setMeta(data);
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
        if (d && d.title && state.url === url) setMeta({ title: d.title });
      })
      .catch(function () {
        fetch("https://noembed.com/embed?url=" + encodeURIComponent(url))
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d && d.title && state.url === url) setMeta({ title: d.title }); })
          .catch(function () {});
      });
    if (titleTimer) clearInterval(titleTimer);
    var tries = 0;
    titleTimer = setInterval(function () {
      tries++;
      var latest = p.getVideoData ? p.getVideoData() : null;
      if (latest && latest.title && state.url === url) {
        setMeta(latest);
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
    if (root.dataset) root.dataset.mode = "url";
    root.innerHTML =
      '<div class="yt-player__host" id="yt-host"></div>' +
      '<div class="yt-player__head">' +
        '<button id="yt-open" class="yt-player__mark" type="button" aria-label="Open player" aria-expanded="false" aria-controls="yt-player"></button>' +
        '<button id="yt-expand" class="yt-player__expand" type="button" aria-label="Expand player">' + icons.chevron + '</button>' +
      '</div>' +
      '<div class="yt-player__deck">' +
        '<div class="yt-player__tabs" role="tablist" aria-label="Player source">' +
          '<button id="yt-tabs-url" class="yt-player__tab" type="button" role="tab" aria-selected="true">URL</button>' +
          '<button id="yt-tabs-api" class="yt-player__tab" type="button" role="tab" aria-selected="false">API</button>' +
        '</div>' +
        '<img id="yt-art" class="yt-player__art" alt="" />' +
        '<div class="yt-player__meta">' +
          '<span class="yt-player__label">Music</span>' +
          '<span class="yt-player__status" id="yt-status">Paste a YouTube URL</span>' +
          '<span class="yt-player__author" id="yt-author"></span>' +
        '</div>' +
        '<div class="yt-player__progress">' +
          '<input id="yt-seek" class="yt-player__seek" type="range" min="0" max="100" value="0" aria-label="Seek" />' +
          '<span class="yt-player__time" id="yt-time">00:00 / 00:00</span>' +
        '</div>' +
        '<div class="yt-player__transport">' +
          '<button id="yt-prev" type="button" aria-label="Previous track">' + icons.prev + '</button>' +
          '<button id="yt-head-toggle" type="button" aria-label="Play or pause">' + icons.play + '</button>' +
          '<button id="yt-next" type="button" aria-label="Next track">' + icons.next + '</button>' +
          '<input id="yt-volume" class="yt-player__volume" type="range" min="0" max="100" value="70" aria-label="Volume" />' +
          '<button id="yt-mute" type="button" aria-label="Mute">' + icons.sound + '</button>' +
          '<button id="yt-close" class="yt-player__close" type="button" aria-label="Stop and clear">' + icons.close + '</button>' +
        '</div>' +
        '<div class="yt-player__link">' +
          '<input id="yt-url" type="url" placeholder="https://www.youtube.com/watch?v=..." aria-label="YouTube URL" />' +
          '<button id="yt-load" class="yt-player__load" type="button">LOAD</button>' +
        '</div>' +
        '<div class="yt-player__api">' +
          '<input id="yt-api-key" type="password" autocomplete="off" placeholder="YouTube API key" aria-label="YouTube API key" />' +
          '<input id="yt-api-url" type="url" placeholder="https://www.youtube.com/watch?v=..." aria-label="YouTube API URL" />' +
          '<button id="yt-api-load" class="yt-player__load" type="button">LOAD</button>' +
          '<span id="yt-api-status" class="yt-player__api-status" role="status"></span>' +
        '</div>' +
      '</div>' +
      '<div class="yt-player__queue">' +
        '<p id="yt-queue-title" class="yt-player__queue-title">UP NEXT</p>' +
        '<ol id="yt-queue-list" class="yt-player__queue-list"></ol>' +
      '</div>';
    document.body.appendChild(root);

    var art = document.getElementById("yt-art");
    art.src = ART_PLACEHOLDER;
    art.onerror = function () {
      art.onerror = null;
      art.src = ART_PLACEHOLDER;
    };
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
    document.getElementById("yt-tabs-url").addEventListener("click", function () { setMode("url"); });
    document.getElementById("yt-tabs-api").addEventListener("click", function () { setMode("api"); });
    document.getElementById("yt-queue-list").addEventListener("click", function (e) {
      var item = e.target.closest ? e.target.closest(".yt-queue__item") : null;
      if (!item || !player) return;
      var videoId = item.getAttribute("data-video-id");
      if (videoId) {
        if (player.loadVideoById) player.loadVideoById(videoId, 0);
        return;
      }
      if (!player.playVideoAt) return;
      player.playVideoAt(Number(item.getAttribute("data-index")));
    });
    document.getElementById("yt-prev").addEventListener("click", function () {
      if (player && player.previousVideo) player.previousVideo();
    });
    document.getElementById("yt-next").addEventListener("click", function () {
      if (player && player.nextVideo) player.nextVideo();
    });
    document.getElementById("yt-head-toggle").addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });
    document.getElementById("yt-expand").addEventListener("click", function (e) {
      e.stopPropagation();
      setPlayerOpen(!root.classList.contains("is-open"));
    });
    document.getElementById("yt-open").addEventListener("click", function (e) {
      e.stopPropagation();
      setPlayerOpen(true);
    });
    root.querySelector(".yt-player__head").addEventListener("click", function () {
      setPlayerOpen(!root.classList.contains("is-open"));
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
      lastQueueIndex = -1;
      document.getElementById("yt-url").value = "";
      document.getElementById("yt-author").textContent = "";
      document.getElementById("yt-art").src = ART_PLACEHOLDER;
      document.getElementById("yt-seek").max = "100";
      document.getElementById("yt-seek").value = "0";
      document.getElementById("yt-time").textContent = "00:00 / 00:00";
      renderQueue();
      updateToggle(false);
      setStatus("Paste a YouTube URL", false);
      setPlayerOpen(false);
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
    setPlayerOpen(true);
    setStatus("Ready — press play", false);
    lastQueueIndex = -1;
    renderQueue();
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
          renderQueue();
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
      if (player.getPlaylistIndex) {
        var currentIndex = player.getPlaylistIndex();
        if (currentIndex !== lastQueueIndex) {
          lastQueueIndex = currentIndex;
          renderQueue();
        }
      }
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
    renderQueue();
    if (window.location.hash === "#music") setPlayerOpen(true);
    if (parseSource(restoredUrl)) setStatus("Ready — press play", false);
    window.addEventListener("pagehide", saveState);
  }

  window.ClassroomPlayer = { setOpen: setPlayerOpen };
  window.ClassroomPlayer.setMode = setMode;
  window.ClassroomPlayer.api = { fetchApiQueue: fetchApiQueue };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
