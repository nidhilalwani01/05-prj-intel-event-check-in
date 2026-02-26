//Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const checkInButton = document.getElementById("checkInBtn");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const progressPercentage = document.getElementById("progressPercentage");
const teamCards = document.querySelectorAll(".team-card");
const attendeeList = document.getElementById("attendeeList");
const waterCount = document.getElementById("waterCount");
const zeroCount = document.getElementById("zeroCount");
const powerCount = document.getElementById("powerCount");

const teamCountElements = {
  water: waterCount,
  zero: zeroCount,
  power: powerCount,
};

// Track attendance data
let count = 0;
const maxCount = 50;
let hasCelebrationBeenShown = false;
let attendees = [];
const storageKey = "intelEventCheckInState";

function getCheckInData() {
  const attendeeName = nameInput.value.trim();
  const teamValue = teamSelect.value;
  const selectedTeamOption = teamSelect.options[teamSelect.selectedIndex];
  const teamLabel = selectedTeamOption ? selectedTeamOption.text : "";

  return {
    attendeeName: attendeeName,
    teamValue: teamValue,
    teamLabel: teamLabel,
  };
}

function showGreetingMessage(message) {
  greeting.textContent = message;
  greeting.style.display = "block";
}

function buildSuccessGreeting(attendeeName, teamLabel) {
  return `Hey ${attendeeName}, you have been successfully checked in to ${teamLabel}.`;
}

function updateAttendanceDisplay() {
  attendeeCount.textContent = count;
}

function calculateProgressValue() {
  const rawPercentage = Math.round((count / maxCount) * 100);
  const clampedPercentage = Math.min(rawPercentage, 100);
  return `${clampedPercentage}%`;
}

function updateProgressDisplay() {
  const progressValue = calculateProgressValue();
  progressBar.style.width = progressValue;
  progressPercentage.textContent = progressValue;
}

function updateAttendanceAndProgress() {
  updateAttendanceDisplay();
  updateProgressDisplay();
}

function getTeamCountElement(teamValue) {
  return teamCountElements[teamValue];
}

function incrementTeamCount(teamValue) {
  const teamCounter = getTeamCountElement(teamValue);

  if (!teamCounter) {
    return;
  }

  teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;
}

function getCurrentTeamCounts() {
  return {
    water: parseInt(waterCount.textContent, 10),
    zero: parseInt(zeroCount.textContent, 10),
    power: parseInt(powerCount.textContent, 10),
  };
}

function setTeamCounts(teamCounts) {
  waterCount.textContent = teamCounts.water || 0;
  zeroCount.textContent = teamCounts.zero || 0;
  powerCount.textContent = teamCounts.power || 0;
}

function addAttendee(attendeeName, teamValue, teamLabel) {
  attendees.push({
    name: attendeeName,
    teamValue: teamValue,
    teamLabel: teamLabel,
  });
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  let i = 0;

  while (i < attendees.length) {
    const listItem = document.createElement("li");
    listItem.className = "attendee-list-item";
    listItem.textContent = `${attendees[i].name} — ${attendees[i].teamLabel}`;
    attendeeList.appendChild(listItem);
    i++;
  }
}

function buildState() {
  return {
    totalCount: count,
    teamCounts: getCurrentTeamCounts(),
    attendeeList: attendees,
  };
}

function saveState() {
  const state = buildState();
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function applyLoadedState(savedState) {
  count = savedState.totalCount || 0;
  setTeamCounts(savedState.teamCounts || {});
  attendees = savedState.attendeeList || [];

  updateAttendanceAndProgress();
  renderAttendeeList();
  updateGoalCelebration();
}

function loadState() {
  const rawState = localStorage.getItem(storageKey);

  if (!rawState) {
    return;
  }

  try {
    const savedState = JSON.parse(rawState);
    applyLoadedState(savedState);
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

function resetStateForNewSession() {
  count = 0;
  attendees = [];
  hasCelebrationBeenShown = false;
  setTeamCounts({});
  updateAttendanceAndProgress();
  renderAttendeeList();
  greeting.textContent = "";
  greeting.style.display = "none";
}

function getWinningTeam() {
  const teamStandings = [
    {
      value: "water",
      label: "Team Water Wise",
      count: parseInt(waterCount.textContent, 10),
    },
    {
      value: "zero",
      label: "Team Net Zero",
      count: parseInt(zeroCount.textContent, 10),
    },
    {
      value: "power",
      label: "Team Renewables",
      count: parseInt(powerCount.textContent, 10),
    },
  ];

  let winningTeam = teamStandings[0];
  let i = 1;

  while (i < teamStandings.length) {
    if (teamStandings[i].count > winningTeam.count) {
      winningTeam = teamStandings[i];
    }
    i++;
  }

  return winningTeam;
}

function highlightWinningTeam(winningTeamValue) {
  let i = 0;

  while (i < teamCards.length) {
    teamCards[i].classList.remove("winning-team");
    i++;
  }

  const winningTeamCard = document.querySelector(
    `.team-card.${winningTeamValue}`,
  );

  if (winningTeamCard) {
    winningTeamCard.classList.add("winning-team");
  }
}

function updateGoalCelebration() {
  if (count < maxCount) {
    return;
  }

  const winningTeam = getWinningTeam();
  highlightWinningTeam(winningTeam.value);

  if (!hasCelebrationBeenShown) {
    const celebrationMessage = `🎉 Goal reached! ${winningTeam.label} is leading with ${winningTeam.count} check-ins.`;
    showGreetingMessage(celebrationMessage);
    hasCelebrationBeenShown = true;
  }
}

function isNameValid(attendeeName) {
  if (attendeeName === "") {
    showGreetingMessage("Please add your name so we can check you in 🎉");
    nameInput.focus();
    return false;
  }

  return true;
}

function normalizeName(attendeeName) {
  return attendeeName.trim().toLowerCase();
}

function isDuplicateAttendee(attendeeName) {
  const normalizedName = normalizeName(attendeeName);
  let i = 0;

  while (i < attendees.length) {
    if (normalizeName(attendees[i].name) === normalizedName) {
      return true;
    }
    i++;
  }

  return false;
}

function validateCheckInData(checkInData) {
  if (!isNameValid(checkInData.attendeeName)) {
    return false;
  }

  if (isDuplicateAttendee(checkInData.attendeeName)) {
    showGreetingMessage(
      `Check-in not completed: ${checkInData.attendeeName} is already checked in.`,
    );
    nameInput.focus();
    return false;
  }

  return true;
}

function processSuccessfulCheckIn(checkInData) {
  count++;
  updateAttendanceAndProgress();

  incrementTeamCount(checkInData.teamValue);
  addAttendee(
    checkInData.attendeeName,
    checkInData.teamValue,
    checkInData.teamLabel,
  );
  renderAttendeeList();

  updateGoalCelebration();
  saveState();

  if (!hasCelebrationBeenShown) {
    const message = buildSuccessGreeting(
      checkInData.attendeeName,
      checkInData.teamLabel,
    );
    showGreetingMessage(message);
  }
}

function handleCheckIn(event) {
  event.preventDefault();

  const checkInData = getCheckInData();

  if (!validateCheckInData(checkInData)) {
    return;
  }

  processSuccessfulCheckIn(checkInData);
  form.reset();
}

function initializeApp() {
  localStorage.removeItem(storageKey);
  resetStateForNewSession();
  checkInButton.addEventListener("click", handleCheckIn);
}

initializeApp();
