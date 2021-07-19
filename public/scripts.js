// Get project name from end of URL
const thisPageUrl =
	window.location.pathname.slice(-1) == "/"
		? window.location.pathname.slice(0, -1)
		: window.location.pathname;
let project = thisPageUrl.split("/").slice(-1).toString();

// User set variables:
let isOpen = true; // Set to view only open 'true' or closed 'false'
const limit = 5; // Set limit of issues per page
let currentPage = 1; // Which page
let totalPages = 1;
let filteredIssues = []; // Store all issues here
let currentOpen = 0;
let currentClosed = 0;
let projectList = [];
// Load the correct API route to retreive JSON object of project issues
const dataUrl = "/api/";
let chartExists = false; // used to check whether a chart is already generated on a project to prevent script error on rerunning renderChart()

function displayProjectNames() {
	const container = document.getElementById("project-list");
	container.innerHTML = "";

	// Map through issues and add to web page
	// Filter: display relevant issues for current page only
	projectList.map((issue) => {
		let item = document.createElement("li");
		item.className = "nav-item";
		item.innerHTML = `<a href="../../${issue}" class="nav-link text-white">
      <i class="bi me-2 bi-arrow-right-short"></i>

            ${issue}
          </a>`;
		container.append(item);
	});
}
function displayIssues() {
	const container = document.querySelector(".list-group");
	container.innerHTML = "";
	if (filteredIssues.length === 0) {
		container.innerHTML = '<h5 class="p-4">No issues to display.</h5>';
	}

	// Map through issues and add to web page
	// Filter: display relevant issues for current page only
	filteredIssues
		.filter(
			(issue, i) => i >= currentPage * limit - limit && i < currentPage * limit
		)
		.map((issue) => {
			let item = document.createElement("a");
			let dateNow = Date.now;
			item.href = `../../${project}/issues/${issue._id}`;
			item.setAttribute("data-bs-toggle", "modal");
			item.setAttribute("data-bs-target", "#updateModal");
			item.setAttribute("data-projectid", issue._id);
			item.className = "list-group-item list-group-item-action";
			item.innerHTML = `<div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">${issue.issue_title}</h5>
      <small class="text-muted">Updated ${timeSinceUpdate(
				issue.updated_on
			)}</small>
    </div>
    <p class="mb-1">${issue.issue_text}</p>
    <small class="text-muted">Status: ${issue.status_text}</small>`;
			item.addEventListener("click", loadProjectDetails);
			container.append(item);
		});

	// Create pagination
	let i = 1;
	let paginationContainer = document.getElementById("pagination");
	paginationContainer.innerHTML = "";
	let prevLi = document.createElement("li");
	let nextLi = document.createElement("li");

	prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
	prevLi.innerHTML = `
      <a class="page-link" href="#" ${
				currentPage === 1 ? 'tabindex="-1" aria-disabled="true"' : ""
			} id="prev-link"
        >Previous</a
      >
       `;

	nextLi.className = `page-item ${
		currentPage === totalPages ? "disabled" : ""
	}`;
	nextLi.innerHTML = `
      <a class="page-link" href="#" ${
				currentPage === totalPages ? 'tabindex="-1" aria-disabled="true"' : ""
			} id="next-link">Next</a>
       `;
	if (totalPages === 0) {
		totalPages++;
	}
	while (i <= totalPages) {
		let li = document.createElement("li");
		li.className = `page-item ${currentPage === i ? "active" : ""}`;
		li.innerHTML = `<a class="page-link page-number" href="#">${i}</a>`;

		i === 1 ? paginationContainer.append(prevLi) : "";
		paginationContainer.append(li);
		i === totalPages ? paginationContainer.append(nextLi) : "";

		i++;
	}
	let pagelinks = document.getElementsByClassName("page-number");
	for (let i = 0; i < pagelinks.length; i++) {
		pagelinks[i].addEventListener("click", function (e) {
			e.preventDefault();
			currentPage = parseInt(this.text);
			displayIssues();
		});
	}
	document.getElementById("next-link").addEventListener("click", function (e) {
		e.preventDefault();
		currentPage++;
		fetchIssues();
		// alert(currentPage);
	});
	document.getElementById("prev-link").addEventListener("click", function (e) {
		e.preventDefault();
		currentPage--;
		fetchIssues();
		// alert(currentPage);
	});
}

async function fetchProjectNames() {
	// Below variables required for functionality
	const response = await fetch(dataUrl + "projects/");
	const names = await response.json();
	for (let i = 0; i < names.length; i++) {
		projectList.push(names[i]);
	}

	displayProjectNames();
}

fetchProjectNames();

let navlink = document.getElementsByClassName("nav-link");

function toggleActiveClass(e) {
	for (let i = 0; i < navlink.length; i++) {
		navlink[i].classList.remove("active");
		e.target.classList.add("active");
	}
}

function enableSelectors() {
	for (let i = 0; i < navlink.length; i++) {
		navlink[i].addEventListener("click", function (e) {
			e.preventDefault();
			buttonIsOpen = this.getAttribute("data-status") === "open" ? true : false;
			isOpen = buttonIsOpen;

			currentPage = 1;

			toggleActiveClass(e);

			fetchIssues();
		});
	}
}
enableSelectors();
// Reusable function: Format 'updated on' to show clean output i.e. "Updated 4 hours ago"
function timeSinceUpdate(updated_on) {
	let hours = Math.round(
		(Date.now() - Date.parse(updated_on)) / 1000 / 60 / 60
	);
	let days = Math.round(hours / 24);

	if (hours == 0) {
		return "just now";
	} else if (hours >= 1 && hours < 24) {
		return hours + ` hour${hours > 1 ? "s" : ""} ago`;
	} else {
		return days + ` day${days > 1 ? "s" : ""} ago`;
	}
}

// CHART JS//
function renderChart() {
	document.getElementById("open-issues").innerText = currentOpen;
	document.getElementById("closed-issues").innerText = currentClosed;
	var xValues = ["Open", "Closed"];
	var yValues = [currentOpen, currentClosed];
	var barColors = ["#b91d47", "#00aba9"];

	new Chart("myChart", {
		type: "pie",
		data: {
			labels: xValues,
			datasets: [
				{
					backgroundColor: barColors,
					data: yValues,
				},
			],
		},
		options: {
			title: {
				display: true,
				text: "Project Issues Status",
			},
		},
	});
	chartExists = true;
}

////  Post New Issue
function sendNewIssue(data, method, redirect) {
	const XHR = new XMLHttpRequest();
	XHR.addEventListener("load", function (event) {
		location.reload();

		// alert( event.target.responseText );
	});
	XHR.addEventListener("error", function (event) {
		alert("Oops! Something went wrong.");
	});
	XHR.open(method, `/api/issues/${project}`);
	XHR.setRequestHeader("Content-Type", "application/json");
	XHR.send(data);
	if (redirect === "changeView") {
		window.location.replace(`/${project}`);
	} else {
		location.reload();
	}
}
// Access the form element...
const NewIssueForm = document.getElementById("NewIssueForm");

// ...and take over its submit event.
NewIssueForm.addEventListener("submit", function (event) {
	event.preventDefault();

	sendNewIssue(toJSONString(NewIssueForm), "POST");
});

// Access the form element...
const NewProjectForm = document.getElementById("NewProjectForm");

// ...and take over its submit event.
NewProjectForm.addEventListener("submit", function (event) {
	event.preventDefault();

	project = document.getElementById("page_name").value;
	sendNewIssue(toJSONString(NewProjectForm), "POST", "changeView");
});

// Access the form element...
const UpdateIssueForm = document.getElementById("UpdateIssueForm");

// ...and take over its submit event.
UpdateIssueForm.addEventListener("submit", function (event) {
	event.preventDefault();

	sendNewIssue(toJSONString(UpdateIssueForm), "PUT");
});

// Access the form element...
const DeleteIssueButton = document.getElementById("deleteIssue");

// ...and take over its submit event.
DeleteIssueButton.addEventListener("click", function (event) {
	event.preventDefault();

	sendNewIssue(toJSONString(UpdateIssueForm), "DELETE");
});

//convert formdata to JSON string
function toJSONString(form) {
	let JSONobject = {};
	let formFields = form.querySelectorAll("input, select, textarea");
	for (let i = 0; i < formFields.length; ++i) {
		let formField = formFields[i];
		let nameAttr = formField.name;
		let value = formField.value;

		if (nameAttr) {
			JSONobject[nameAttr] = value;
		}
	}

	return JSON.stringify(JSONobject);
	// return JSONobject
}

function loadProjectDetails(e) {
	selectedProjectId = filteredIssues.findIndex(
		(x) => x._id === this.dataset.projectid
	);

	document.getElementById("update_projectid").value = this.dataset.projectid;
	document.getElementById("update_issue_title").value =
		filteredIssues[selectedProjectId].issue_title;
	document.getElementById("update_issue_text").value =
		filteredIssues[selectedProjectId].issue_text;
	document.getElementById("update_created_by").value = !filteredIssues[
		selectedProjectId
	].created_by
		? ""
		: filteredIssues[selectedProjectId].created_by;
	document.getElementById("update_assigned_to").value = !filteredIssues[
		selectedProjectId
	].assigned_to
		? ""
		: filteredIssues[selectedProjectId].assigned_to;
	document.getElementById("update_status_text").value = !filteredIssues[
		selectedProjectId
	].status_text
		? ""
		: filteredIssues[selectedProjectId].status_text;
	document.getElementById("update_open").value =
		!filteredIssues[selectedProjectId].open;
	document.getElementById("update_open").checked =
		!filteredIssues[selectedProjectId].open;

	e.preventDefault();
}

async function fetchIssues() {
	// Below variables required for functionality
	const response = await fetch(dataUrl + "issues/" + project);
	const issues = await response.json();
	currentOpen = issues.filter((issue) => issue.open === true).length;
	currentClosed = issues.filter((issue) => issue.open === false).length;
	filteredIssues = issues.filter((issue, i) => issue.open == isOpen);
	totalPages = Math.ceil(filteredIssues.length / limit);

	displayIssues();

	if (!chartExists) {
		renderChart();
	}
	document.getElementById("project-name").innerHTML =
		'<i class="bi me-2 bi-folder2-open"></i>' + project;
}

fetchIssues();
