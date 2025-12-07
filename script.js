// ============================================
// RESCUE PILOT - STANDALONE (NO BACKEND)
// ============================================

const AIRPORTS = [
  { ident: "EGLL", name: "London Heathrow", lat: 51.47, lng: -0.45 },
  { ident: "LFPG", name: "Paris CDG", lat: 49.01, lng: 2.55 },
  { ident: "EHAM", name: "Amsterdam Schiphol", lat: 52.31, lng: 4.76 },
  { ident: "EDDF", name: "Frankfurt Airport", lat: 50.03, lng: 8.57 },
  { ident: "LEMD", name: "Madrid Barajas", lat: 40.47, lng: -3.56 },
  { ident: "LEBL", name: "Barcelona El Prat", lat: 41.3, lng: 2.08 },
  { ident: "EDDM", name: "Munich Airport", lat: 48.35, lng: 11.79 },
  { ident: "LIRF", name: "Rome Fiumicino", lat: 41.8, lng: 12.24 },
  { ident: "EIDW", name: "Dublin Airport", lat: 53.42, lng: -6.27 },
  { ident: "LOWW", name: "Vienna Airport", lat: 48.11, lng: 16.57 },
  { ident: "LSZH", name: "Zurich Airport", lat: 47.46, lng: 8.55 },
  { ident: "EKCH", name: "Copenhagen Airport", lat: 55.62, lng: 12.66 },
  { ident: "ENGM", name: "Oslo Gardermoen", lat: 60.19, lng: 11.1 },
  { ident: "ESSA", name: "Stockholm Arlanda", lat: 59.65, lng: 17.92 },
  { ident: "EFHK", name: "Helsinki Vantaa", lat: 60.32, lng: 24.96 },
  { ident: "EPWA", name: "Warsaw Chopin", lat: 52.17, lng: 20.97 },
  { ident: "LKPR", name: "Prague Airport", lat: 50.1, lng: 14.26 },
  { ident: "LHBP", name: "Budapest Airport", lat: 47.44, lng: 19.26 },
  { ident: "LGAV", name: "Athens Airport", lat: 37.94, lng: 23.94 },
  { ident: "LPPT", name: "Lisbon Airport", lat: 38.77, lng: -9.13 },
  { ident: "EBBR", name: "Brussels Airport", lat: 50.9, lng: 4.48 },
  { ident: "LIMC", name: "Milan Malpensa", lat: 45.63, lng: 8.72 },
  { ident: "EVRA", name: "Riga Airport", lat: 56.92, lng: 23.97 },
  { ident: "EYVI", name: "Vilnius Airport", lat: 54.63, lng: 25.29 },
  { ident: "LTFM", name: "Istanbul Airport", lat: 41.26, lng: 28.74 },
];

const DISASTERS = [
  { type: "Flood", icon: "🌊", severity: 2, reward: 15 },
  { type: "Fire", icon: "🔥", severity: 2, reward: 12 },
  { type: "Earthquake", icon: "🌍", severity: 3, reward: 25 },
  { type: "Storm", icon: "🌪️", severity: 2, reward: 18 },
  { type: "Crash", icon: "💥", severity: 2, reward: 20 },
];

const EVENTS = [
  {
    name: "All Clear",
    desc: "Airport secure.",
    icon: "✅",
    type: "good",
    fuel: 0,
    rep: 0,
    fatal: false,
    weight: 50,
  },
  {
    name: "Good Weather",
    desc: "Saves fuel!",
    icon: "☀️",
    type: "good",
    fuel: 150,
    rep: 0,
    fatal: false,
    weight: 15,
  },
  {
    name: "Local Support",
    desc: "Reputation boost!",
    icon: "🤝",
    type: "good",
    fuel: 0,
    rep: 15,
    fatal: false,
    weight: 10,
  },
  {
    name: "Minor Leak",
    desc: "Small fuel loss.",
    icon: "⛽",
    type: "warning",
    fuel: -150,
    rep: 0,
    fatal: false,
    weight: 12,
  },
  {
    name: "Delay",
    desc: "Paperwork issues.",
    icon: "📋",
    type: "warning",
    fuel: -80,
    rep: -5,
    fatal: false,
    weight: 8,
  },
  {
    name: "Engine Issue",
    desc: "Repair needed.",
    icon: "🔧",
    type: "danger",
    fuel: -120,
    rep: 0,
    fatal: false,
    weight: 4,
  },
  {
    name: "Critical Failure",
    desc: "Mission terminated.",
    icon: "💥",
    type: "danger",
    fuel: 0,
    rep: -30,
    fatal: true,
    weight: 1,
  },
];

const CONFIG = {
  fuel: 2500,
  maxFuel: 3500,
  rep: 100,
  maxRep: 200,
  missionsToWin: 6,
  totalMissions: 10,
  refuelCost: 20,
  refuelGain: 1000,
  rollBonus: 2,
};

let map,
  markers = [],
  rangeCircle;
let game = {
  name: "Pilot",
  fuel: 0,
  rep: 0,
  rescued: 0,
  current: null,
  missions: [],
  completed: 0,
  failed: 0,
  firstStop: true,
  over: false,
  currentMission: null,
};
let isRefueling = false;

// Utils
const calcDist = function (a, b) {
  return Math.round(
    Math.sqrt(
      Math.pow((a.lat - b.lat) * 111, 2) +
        Math.pow((a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180), 2)
    )
  );
};

const rand = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const weightedRandom = function (arr) {
  var total = arr.reduce(function (s, i) {
    return s + i.weight;
  }, 0);
  var r = Math.random() * total;
  for (var i = 0; i < arr.length; i++) {
    r -= arr[i].weight;
    if (r <= 0) return arr[i];
  }
  return arr[0];
};

var $ = function (id) {
  return document.getElementById(id);
};

var openModal = function (id) {
  $(id).classList.add("active");
};

var closeModal = function (id) {
  $(id).classList.remove("active");
};

function scrollToGame() {
  setTimeout(function () {
    var dashboard = document.querySelector(".dashboard");
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, 200);
}

// Map
function initMap() {
  map = L.map("game-map", {
    center: [50, 10],
    zoom: 4,
    minZoom: 3,
    maxZoom: 8,
  });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "©OSM ©CARTO",
    subdomains: "abcd",
  }).addTo(map);
}

function updateMap() {
  if (!map) initMap();
  markers.forEach(function (m) {
    map.removeLayer(m);
  });
  markers = [];
  if (rangeCircle) map.removeLayer(rangeCircle);

  var c = game.current;
  rangeCircle = L.circle([c.lat, c.lng], {
    radius: game.fuel * 1000,
    color: "rgba(0,212,255,0.5)",
    fillColor: "rgba(0,212,255,0.1)",
    fillOpacity: 0.3,
    dashArray: "10,5",
    weight: 2,
  }).addTo(map);

  var curIcon = L.divIcon({
    className: "custom-marker marker-current",
    html: "✈️",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
  var curMarker = L.marker([c.lat, c.lng], {
    icon: curIcon,
    zIndexOffset: 1000,
  }).addTo(map);
  curMarker.bindPopup(
    '<div class="popup-content popup-current"><h4>' +
      c.name +
      '</h4><span class="popup-code">' +
      c.ident +
      '</span><div class="popup-you-are-here">📍 YOU ARE HERE</div></div>'
  );
  markers.push(curMarker);
  map.setView([c.lat, c.lng], 5);

  var missionAirports = game.missions
    .filter(function (m) {
      return m.status === "pending";
    })
    .map(function (m) {
      return m.airport.ident;
    });

  AIRPORTS.filter(function (a) {
    return a.ident !== c.ident;
  }).forEach(function (a) {
    var dist = calcDist(c, a);
    var inRange = dist <= game.fuel;
    var hasMission = missionAirports.indexOf(a.ident) !== -1;
    var mission = game.missions.find(function (m) {
      return m.airport.ident === a.ident && m.status === "pending";
    });

    var cls = "marker-out-range",
      content = "•",
      z = 100;
    if (hasMission && inRange) {
      cls = "marker-mission";
      content = "🚨";
      z = 500;
    } else if (hasMission) {
      cls = "marker-mission";
      content = "🚨";
      z = 400;
    } else if (inRange) {
      cls = "marker-in-range";
      content = "✈";
      z = 300;
    }

    var icon = L.divIcon({
      className: "custom-marker " + cls,
      html: content,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    var marker = L.marker([a.lat, a.lng], {
      icon: icon,
      zIndexOffset: z,
    }).addTo(map);

    var missionHtml = "";
    if (mission)
      missionHtml =
        '<div class="popup-mission">' +
        mission.icon +
        " " +
        mission.disaster +
        '</div><div class="popup-mission-details"><span>Difficulty: ' +
        mission.severity +
        "/10</span><span>Reward: +" +
        mission.reward +
        "</span></div>";

    var statusClass = inRange ? "in-range" : "out-range";
    var statusText = inRange ? "✅ In Range" : "❌ Out of Range";
    var btnText = inRange ? "✈️ FLY" : "OUT OF RANGE";
    var disabled = inRange ? "" : "disabled";

    marker.bindPopup(
      '<div class="popup-content"><h4>' +
        a.name +
        '</h4><span class="popup-code">' +
        a.ident +
        '</span><div class="popup-distance">📏 ' +
        dist +
        " km</div>" +
        missionHtml +
        '<div class="popup-status ' +
        statusClass +
        '">' +
        statusText +
        '</div><button class="btn-fly" onclick="fly(\'' +
        a.ident +
        "'," +
        dist +
        ')" ' +
        disabled +
        ">" +
        btnText +
        "</button></div>"
    );
    markers.push(marker);
  });
}

// Game
function startGame() {
  game.name = $("player-name").value.trim() || "Commander";
  game.fuel = CONFIG.fuel;
  game.rep = CONFIG.rep;
  game.rescued = 0;
  game.completed = 0;
  game.failed = 0;
  game.firstStop = true;
  game.over = false;
  isRefueling = false;

  var shuffled = AIRPORTS.slice().sort(function () {
    return Math.random() - 0.5;
  });
  game.current = shuffled[0];

  game.missions = [];
  for (var i = 1; i <= CONFIG.totalMissions && i < shuffled.length; i++) {
    var a = shuffled[i];
    var d = DISASTERS[rand(0, DISASTERS.length - 1)];
    game.missions.push({
      id: i - 1,
      airport: { ident: a.ident, name: a.name, lat: a.lat, lng: a.lng },
      disaster: d.type,
      icon: d.icon,
      severity: d.severity,
      peopleInDanger: rand(2, 6),
      reward: d.reward,
      status: "pending",
    });
  }

  $("welcome-screen").classList.remove("active");
  $("game-screen").classList.add("active");
  $("pilot-name-display").textContent = game.name;

  setTimeout(function () {
    initMap();
    updateUI();
    scrollToGame();
  }, 100);
}

function updateUI() {
  // Fuel bar
  var fuelPct = (game.fuel / CONFIG.maxFuel) * 100;
  $("fuel-bar").style.width = Math.min(100, fuelPct) + "%";
  $("fuel-value").textContent = Math.max(0, game.fuel);

  var fuelBar = $("fuel-bar");
  if (game.fuel < 500) {
    fuelBar.style.background = "linear-gradient(90deg,#ef4444,#dc2626)";
    fuelBar.classList.add("pulse-danger");
  } else if (game.fuel < 1000) {
    fuelBar.style.background = "linear-gradient(90deg,#f59e0b,#ef4444)";
    fuelBar.classList.remove("pulse-danger");
  } else {
    fuelBar.style.background = "linear-gradient(90deg,#22c55e,#f59e0b)";
    fuelBar.classList.remove("pulse-danger");
  }

  // Reputation bar
  $("reputation-bar").style.width =
    Math.min(100, (game.rep / CONFIG.maxRep) * 100) + "%";
  $("reputation-value").textContent = game.rep;

  // Rescued count
  $("rescued-value").textContent = game.rescued;

  // Missions count
  game.completed = game.missions.filter(function (m) {
    return m.status === "completed";
  }).length;
  $("missions-completed").textContent = game.completed;
  $("missions-total").textContent = CONFIG.missionsToWin;

  // Current location
  $("current-airport-name").textContent = game.current.name;
  $("current-airport-code").textContent = game.current.ident;

  // Refuel button
  if (!isRefueling) {
    var refuelBtn = $("refuel-btn");
    var canRefuel = game.rep >= CONFIG.refuelCost && game.fuel < CONFIG.maxFuel;
    refuelBtn.style.display = canRefuel ? "block" : "none";
    refuelBtn.disabled = false;
    refuelBtn.textContent =
      "🔄 Refuel (-" +
      CONFIG.refuelCost +
      " Trust = +" +
      CONFIG.refuelGain +
      "km)";
  }

  updateMap();
}

function fly(ident, dist) {
  if (dist > game.fuel) {
    alert("Not enough fuel!");
    return;
  }
  map.closePopup();

  $("flying-info").textContent = dist + " km";
  $("flying-overlay").classList.add("active");

  setTimeout(function () {
    game.fuel -= dist;
    game.current = AIRPORTS.find(function (a) {
      return a.ident === ident;
    });
    game.firstStop = false;
    $("flying-overlay").classList.remove("active");

    if (game.fuel <= 0) {
      game.over = true;
      showGameOver("Out of fuel - crashed!");
      return;
    }

    updateUI();
    setTimeout(checkMission, 300);
  }, 2000);
}

function checkMission() {
  var m = game.missions.find(function (m) {
    return m.airport.ident === game.current.ident && m.status === "pending";
  });

  if (m) {
    game.currentMission = m;
    showMissionModal(m);
  } else {
    checkEvent();
  }
}

function showMissionModal(m) {
  $("disaster-icon").textContent = m.icon;
  $("disaster-type").textContent = m.disaster.toUpperCase();
  $("people-trapped").textContent = m.peopleInDanger;
  $("severity-level").textContent = m.severity + "/10";
  $("mission-reward").textContent = "+" + m.reward;
  openModal("mission-modal");
}

function attemptMission() {
  closeModal("mission-modal");
  var m = game.currentMission;

  var roll = rand(1, 10);
  var adj = roll + CONFIG.rollBonus;
  var success = adj >= m.severity;

  if (success) {
    game.rescued += m.peopleInDanger;
    game.rep += m.reward;
    m.status = "completed";
    game.completed++;

    var remaining = CONFIG.missionsToWin - game.completed;
    showResult(true, "Rescued " + m.peopleInDanger + " people!", [
      { label: "Rescued", value: "+" + m.peopleInDanger, pos: true },
      { label: "Trust", value: "+" + m.reward, pos: true },
      { label: "Roll", value: adj + " vs " + m.severity, pos: true },
      {
        label: "Remaining",
        value: remaining > 0 ? remaining : "🎉 DONE!",
        pos: remaining <= 0,
      },
    ]);

    if (game.completed >= CONFIG.missionsToWin) game.over = true;
  } else {
    var loss = Math.floor(m.reward / 2);
    game.rep = Math.max(0, game.rep - loss);
    m.status = "failed";
    game.failed++;

    showResult(false, "Rescue failed!", [
      { label: "Trust", value: "-" + loss, pos: false },
      { label: "Roll", value: adj + " vs " + m.severity, pos: false },
    ]);
  }
}

function declineMission() {
  closeModal("mission-modal");
  game.rep = Math.max(0, game.rep - 5);
  game.currentMission = null;
  checkEvent();
}

function showResult(success, msg, effects) {
  $("result-header").className =
    "modal-header " + (success ? "success" : "danger");
  $("result-icon").textContent = success ? "✅" : "❌";
  $("result-title").textContent = success ? "SUCCESS" : "FAILED";
  $("result-message").textContent = msg;

  var html = "";
  for (var i = 0; i < effects.length; i++) {
    var e = effects[i];
    html +=
      '<div class="effect-item ' +
      (e.pos ? "positive" : "negative") +
      '"><span>' +
      e.label +
      ":</span><span>" +
      e.value +
      "</span></div>";
  }
  $("result-effects").innerHTML = html;
  openModal("result-modal");
}

function checkEvent() {
  if (game.firstStop) {
    updateUI();
    return;
  }

  var e = weightedRandom(EVENTS);
  $("event-header").className = "modal-header " + e.type;
  $("event-icon").textContent = e.icon;
  $("event-name").textContent = e.name;
  $("event-description").textContent = e.desc;

  var effects = [];
  if (e.fuel !== 0)
    effects.push({
      label: "Fuel",
      value: (e.fuel > 0 ? "+" : "") + e.fuel + " km",
      pos: e.fuel > 0,
    });
  if (e.rep !== 0)
    effects.push({
      label: "Trust",
      value: (e.rep > 0 ? "+" : "") + e.rep,
      pos: e.rep > 0,
    });
  if (e.fatal) effects.push({ label: "FATAL", value: "Game Over", pos: false });

  var html = "";
  if (effects.length > 0) {
    for (var i = 0; i < effects.length; i++) {
      var x = effects[i];
      html +=
        '<div class="effect-item ' +
        (x.pos ? "positive" : "negative") +
        '"><span>' +
        x.label +
        ":</span><span>" +
        x.value +
        "</span></div>";
    }
  } else {
    html =
      '<p style="text-align:center;color:var(--text-muted)">No effects</p>';
  }
  $("event-effects").innerHTML = html;

  game.fuel = Math.max(0, game.fuel + e.fuel);
  game.rep = Math.max(0, game.rep + e.rep);
  if (game.fuel <= 0 || e.fatal) game.over = true;

  openModal("event-modal");
}

function handleEventContinue() {
  closeModal("event-modal");
  if (game.over) {
    showGameOver(game.fuel <= 0 ? "Out of fuel!" : "Fatal event!");
  } else {
    updateUI();
  }
}

function handleResultContinue() {
  closeModal("result-modal");
  if (game.completed >= CONFIG.missionsToWin) {
    showVictory();
  } else {
    checkEvent();
  }
}

function refuel() {
  if (game.rep < CONFIG.refuelCost) {
    alert("Not enough Trust Points! Need " + CONFIG.refuelCost);
    return;
  }
  if (game.fuel >= CONFIG.maxFuel) {
    alert("Fuel tank is already full!");
    return;
  }

  isRefueling = true;

  var fuelBefore = game.fuel;
  game.fuel = Math.min(CONFIG.maxFuel, game.fuel + CONFIG.refuelGain);
  var fuelAdded = game.fuel - fuelBefore;
  game.rep -= CONFIG.refuelCost;

  $("fuel-bar").style.width =
    Math.min(100, (game.fuel / CONFIG.maxFuel) * 100) + "%";
  $("fuel-value").textContent = game.fuel;
  $("reputation-value").textContent = game.rep;
  $("reputation-bar").style.width =
    Math.min(100, (game.rep / CONFIG.maxRep) * 100) + "%";

  var fuelBar = $("fuel-bar");
  if (game.fuel < 500) {
    fuelBar.style.background = "linear-gradient(90deg,#ef4444,#dc2626)";
  } else if (game.fuel < 1000) {
    fuelBar.style.background = "linear-gradient(90deg,#f59e0b,#ef4444)";
  } else {
    fuelBar.style.background = "linear-gradient(90deg,#22c55e,#f59e0b)";
  }
  fuelBar.classList.remove("pulse-danger");

  var btn = $("refuel-btn");
  btn.textContent = "✅ +" + fuelAdded + "km Added!";
  btn.disabled = true;

  updateMap();

  setTimeout(function () {
    isRefueling = false;
    updateUI();
  }, 1500);
}

function showVictory() {
  $("victory-pilot").textContent = game.name;
  $("victory-rescued").textContent = game.rescued;
  $("victory-reputation").textContent = game.rep;
  $("victory-fuel").textContent = game.fuel + " km";
  openModal("victory-modal");
}

function showGameOver(reason) {
  $("gameover-reason").textContent = reason;
  $("final-pilot").textContent = game.name;
  $("final-rescued").textContent = game.rescued;
  $("final-reputation").textContent = game.rep;
  $("final-missions").textContent = game.completed + "/" + CONFIG.missionsToWin;
  openModal("gameover-modal");
}

function restart() {
  closeModal("gameover-modal");
  closeModal("victory-modal");
  if (map) {
    map.remove();
    map = null;
  }
  $("game-screen").classList.remove("active");
  $("welcome-screen").classList.add("active");
  $("player-name").value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  $("start-btn").addEventListener("click", startGame);
  $("player-name").addEventListener("keypress", function (e) {
    if (e.key === "Enter") startGame();
  });
  $("refuel-btn").addEventListener("click", refuel);
  $("accept-mission").addEventListener("click", attemptMission);
  $("decline-mission").addEventListener("click", declineMission);
  $("result-continue").addEventListener("click", handleResultContinue);
  $("event-continue").addEventListener("click", handleEventContinue);
  $("restart-btn").addEventListener("click", restart);
  $("victory-restart").addEventListener("click", restart);
});

window.fly = fly;
