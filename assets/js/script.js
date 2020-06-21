var formEl = document.querySelector("#task-form");
var pageContentEl = document.querySelector("#page-content");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");

var taskIdCounter = 0;
var tasks = [];

var createTaskEl = function(taskDataObj, parentEl) {
	// create list item
	var listItemEl = document.createElement("li");
	listItemEl.className = "task-item";
	listItemEl.setAttribute("data-task-id", taskIdCounter);
	listItemEl.setAttribute("draggable", "true");

	// create div to hold task info and add to list item
	var taskInfoEl = document.createElement("div");
	taskInfoEl.className = "task-info";
	taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

	listItemEl.appendChild(taskInfoEl);

	var selected = -1;

	if (parentEl == tasksToDoEl)
		selected = 0;
	else if (parentEl == tasksInProgressEl)
		selected = 1;
	else if (parentEl == tasksCompletedEl)
		selected = 2;

	var taskActionsEl = createTaskActions(taskIdCounter, selected);
	listItemEl.appendChild(taskActionsEl);

	// add entire list item to list
	parentEl.appendChild(listItemEl);

	taskDataObj.id = taskIdCounter;
	tasks.push(taskDataObj);
	saveTasks();

	taskIdCounter++;
}

var createTaskActions = function(taskId, status) {
	var actionContainerEl = document.createElement("div");
	actionContainerEl.className = "task-actions";

	// create edit button
	var editButtonEl = document.createElement("button");
	editButtonEl.textContent = "Edit";
	editButtonEl.className = "btn edit-btn";
	editButtonEl.setAttribute("data-task-id", taskId);

	actionContainerEl.appendChild(editButtonEl);

	// create delete button
	var deleteButtonEl = document.createElement("button");
	deleteButtonEl.textContent = "Delete";
	deleteButtonEl.className = "btn delete-btn";
	deleteButtonEl.setAttribute("data-task-id", taskId);

	actionContainerEl.appendChild(deleteButtonEl);

	var statusSelectEl = document.createElement("select");
	statusSelectEl.className = "select-status";
	statusSelectEl.setAttribute("name", "status-change");
	statusSelectEl.setAttribute("data-task-id", taskId);

	var statusChoices = ["To Do", "In Progress", "Completed"];

	for (var i = 0; i < statusChoices.length; i++) {
		// create option element
		var statusOptionEl = document.createElement("option");
		statusOptionEl.textContent = statusChoices[i];
		statusOptionEl.setAttribute("value", statusChoices[i]);
	  
		// append to select
		statusSelectEl.appendChild(statusOptionEl);
	}

	actionContainerEl.appendChild(statusSelectEl);
	statusSelectEl.selectedIndex = status;

	return actionContainerEl;
};

var taskFormHandler = function(event) {
	event.preventDefault();

	var taskNameInput = document.querySelector("input[name='task-name']").value;
	var taskTypeInput = document.querySelector("select[name='task-type']").value;

	// check if input values are empty strings
	if (!taskNameInput || !taskTypeInput) {
		alert("You need to fill out the task form!");
		return false;
	}

	formEl.reset();

	var isEdit = formEl.hasAttribute("data-task-id");

	// has data attribute, so get task id and call function to complete edit process
	if (isEdit) {
		var taskId = formEl.getAttribute("data-task-id");
		completeEditTask(taskNameInput, taskTypeInput, taskId);
	} 
	// no data attribute, so create object as normal and pass to createTaskEl function
	else {
		var taskDataObj = {
			name: taskNameInput,
			type: taskTypeInput,
			status: "to do"
		}
	
		createTaskEl(taskDataObj, tasksToDoEl);
	}
}

var completeEditTask = function(taskName, taskType, taskId) {
	// find the matching task list item
	var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

	// set new values
	taskSelected.querySelector("h3.task-name").textContent = taskName;
	taskSelected.querySelector("span.task-type").textContent = taskType;

	// loop through tasks array and task object with new content
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id === parseInt(taskId)) {
	  		tasks[i].name = taskName;
	  		tasks[i].type = taskType;
		}
	}
	  
	saveTasks();

	formEl.removeAttribute("data-task-id");
	document.querySelector("#save-task").textContent = "Add Task";

	alert("Task Updated!");
};

var editTask = function(taskId) {
	var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
	var taskName = taskSelected.querySelector("h3.task-name").textContent;
	var taskType = taskSelected.querySelector("span.task-type").textContent;

	document.querySelector("input[name='task-name']").value = taskName;
	document.querySelector("select[name='task-type']").value = taskType;
	document.querySelector("#save-task").textContent = "Save Task";
	formEl.setAttribute("data-task-id", taskId); // Store current task id.
};

var deleteTask = function(taskId) {
	var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
	taskSelected.remove();

	// create new array to hold updated list of tasks
	var updatedTaskArr = [];

	// loop through current tasks
	for (var i = 0; i < tasks.length; i++) {
		// if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
		if (tasks[i].id !== parseInt(taskId)) {
			updatedTaskArr.push(tasks[i]);
		}
	}

	// reassign tasks array to be the same as updatedTaskArr
	tasks = updatedTaskArr;
	saveTasks();
};

var taskButtonHandler = function(event) {
	var targetEl = event.target;

	// edit button was clicked
	if (targetEl.matches(".edit-btn")) {
		var taskId = targetEl.getAttribute("data-task-id");
		editTask(taskId);
	} 
	// delete button was clicked
	else if (targetEl.matches(".delete-btn")) {
		var taskId = event.target.getAttribute("data-task-id");
		deleteTask(taskId);
	}
};

var taskStatusChangeHandler = function(event) {
	var taskId = event.target.getAttribute("data-task-id");
	var statusValue = event.target.value.toLowerCase();
	var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

	if (statusValue === "to do") {
		tasksToDoEl.appendChild(taskSelected);
	} 
	else if (statusValue === "in progress") {
		tasksInProgressEl.appendChild(taskSelected);
	} 
	else if (statusValue === "completed") {
		tasksCompletedEl.appendChild(taskSelected);
	}

	// update task's in tasks array
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id === parseInt(taskId)) {
			tasks[i].status = statusValue;
		}
	}

	saveTasks();
};

var dragTaskHandler = function(event) {
	var taskId = event.target.getAttribute("data-task-id");
	event.dataTransfer.setData("text/plain", taskId);
};

var dropZoneDragHandler = function(event) {
	var taskListEl = event.target.closest(".task-list");
	if (taskListEl) {
		taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
		event.preventDefault();
	}
};

var dragLeaveHandler = function(event) {
	var taskListEl = event.target.closest(".task-list");
	if (taskListEl) {
		taskListEl.removeAttribute("style");
	}
}

var dropTaskHandler = function(event) {
	var id = event.dataTransfer.getData("text/plain");
	var draggableElement = document.querySelector("[data-task-id='" + id + "']");
	var dropZoneEl = event.target.closest(".task-list");
	var statusType = dropZoneEl.id;
	var statusSelectEl = draggableElement.querySelector("select[name='status-change']");

	if (statusType === "tasks-to-do") {
		statusSelectEl.selectedIndex = 0;
	} 
	else if (statusType === "tasks-in-progress") {
		statusSelectEl.selectedIndex = 1;
	} 
	else if (statusType === "tasks-completed") {
		statusSelectEl.selectedIndex = 2;
	}

	dropZoneEl.removeAttribute("style");
	dropZoneEl.appendChild(draggableElement);

	// loop through tasks array to find and update the updated task's status
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id === parseInt(id)) {
			tasks[i].status = statusSelectEl.value.toLowerCase();
		}
	}

	saveTasks();
};

var saveTasks = function() {
	localStorage.setItem("tasks", JSON.stringify(tasks));
}

var loadTasks = function() {
	savedTasks = localStorage.getItem("tasks");

	if (savedTasks === null)
		return false;

		savedTasks = JSON.parse(savedTasks);

	// loop through savedTasks array
	for (var i = 0; i < savedTasks.length; i++) {
		var targetEl
		
		if(savedTasks[i].status === "in progress") {
			targetEl = tasksInProgressEl;
		}
		else if (savedTasks[i].status === "completed") {
			targetEl = tasksCompletedEl;
		}
		else {
			targetEl = tasksToDoEl;
		}

		// pass each task object into the `createTaskEl()` function
		createTaskEl(savedTasks[i], targetEl);
	}

	return true;
}

formEl.addEventListener("submit", taskFormHandler);
pageContentEl.addEventListener("click", taskButtonHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);
pageContentEl.addEventListener("dragstart", dragTaskHandler);
pageContentEl.addEventListener("dragover", dropZoneDragHandler);
pageContentEl.addEventListener("dragleave", dragLeaveHandler);
pageContentEl.addEventListener("drop", dropTaskHandler);
loadTasks();