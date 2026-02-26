//Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");

// Track attendance count for each team
let count = 0;
const maxCount = 50; // Set the maximum count for each team

//Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault(); //Prevent form from submitting normally

  //Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text; //Get the text of the selected option

  console.log(name, team, teamName); //For testing purposes, you can replace this with actual form processing logic

  //Increment count
  count++;
  console.log("Total Check-Ins: ", count); //For testing purposes, you can replace this with actual count display logic`);

  //Update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log("Progress: " + percentage); //For testing purposes, you can replace this with actual progress bar update logic

  //Update team Counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  // Show welcome message
  const message = `🎉 Welcome, ${name} from ${teamName}.`;
  console.log(message); //For testing purposes, you can replace this with actual greeting display logic

  form.reset(); //Reset the form for the next attendee
});
