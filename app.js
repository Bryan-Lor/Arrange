// Data{ 
//  username:string,
//  projects: array[
//      project:object{
//          id:string,
//          color:string hexcode,
//          projectname:string,
//          favorited:boolean,
//          selected:boolean,
//          todos: array[
//              {id:string, color:string hexcode, value:string, category:string, completed:boolean, inedit:boolean}
//          ]
//          newtodocolor:string hexcode
//          todoalias: string
//      }
//  ],
//  darktheme:boolean
//}

// Global Variables
var data = null;
let projectColors = [
    "dodgerblue",
    "crimson",
    "forestgreen", 
    "orange", 
    "mediumorchid",
]

// HTML Elements
let projectsElement = document.getElementById("todo-projects");
let todoList = document.getElementById("todo-list");
let newTodoColorIcon = document.getElementById("new-todo-color").querySelector("i");
let todoInput = document.getElementById("todo-input");

// Get Data from local storage
function getData(){
    data = JSON.parse(localStorage.getItem("arrange-app"));
    if(data == null){
        data = {username:"User", projects:[], darktheme: true};
        saveData();
    }
}

// Clear local storage
function clearData(){
    localStorage.clear();
}

// Saves data to local storage
function saveData(){
    localStorage.setItem("arrange-app", JSON.stringify(data));
}

// Runs on page load
// Reads and configures data from stored file
function loadData(){
    // Load Theme Configuration
    toggleDarkTheme(load=true);

    // Randomly pick a greeting message
    let greetings = ["Hello", "What's up", "Greetings", "Welcome", "How are you", "Hey there"];
    let greetingsElement = document.getElementById("landing-message");
    greetingsElement.innerText = greetings[Math.floor(Math.random() * greetings.length)] + ",";

    // Load Username
    let userNameElement = document.getElementById("username");
    userNameElement.value = data.username;

    // Load Date
    let dateElement = document.getElementById("date");
    let currentDate = new Date();
    dateElement.innerText = displayDate(currentDate);
    function displayDate(currentDate){
        switch(currentDate.getMonth()){
            case 0:
                return "Jan " + currentDate.getDate();
            case 1:
                return "Feb " + currentDate.getDate();
            case 2:
                return "March " + currentDate.getDate();
            case 3:
                return "April " + currentDate.getDate();
            case 4:
                return "May " + currentDate.getDate();
            case 5:
                return "July " + currentDate.getDate();
            case 6:
                return "June " + currentDate.getDate();
            case 7:
                return "Aug " + currentDate.getDate();
            case 8:
                return "Sept " + currentDate.getDate();
            case 9:
                return "Oct " + currentDate.getDate();
            case 10:
                return "Nov " + currentDate.getDate();
            case 11:
                return "Dec " + currentDate.getDate();
            default:
                return null;
        }
    };

    // Load Favorite Projects
    let favoriteProjectsElement = document.getElementById("todo-favorites");
    let favoriteProjectsData = data.projects.filter((project) => project.favorited);
    favoriteProjectsData.forEach(project => {
        generateProjectCard(favoriteProjectsElement, project);
    });

    // Load Un-favorited Projects
    let projectsData = data.projects.filter((project) => !project.favorited);
    projectsData.forEach(project => {
        generateProjectCard(projectsElement, project);
    });

    // Load add-project-button function
    let addProjectButtons = document.querySelectorAll("#add-project-button");
    addProjectButtons.forEach((button) => button.addEventListener("click", function(){ addProject(); loadSelectedProject(); saveData();}));

    // Configure Theme Button
    let themeButton = document.getElementById("theme-button");
    themeButton.addEventListener("click", function(){ toggleDarkTheme(); saveData(); });

    // Load New Todo Color Button Functions
    newTodoColorIcon.style.color = projectColors[0];
    let newTodoColorButton = document.getElementById("new-todo-color");
    newTodoColorButton.addEventListener("click", function(){
        let selectedProject = getSelectedProject();
        selectedProject.newtodocolor = getNextColor(selectedProject.newtodocolor);
        newTodoColorIcon.style.color = selectedProject.newtodocolor;
        saveData();
    });

    // Load add-todo-button functions
    let addTodoButton = document.getElementById("add-todo-button");
    addTodoButton.addEventListener("click", function(event){
        event.preventDefault();
        addTodo();
        updateProjectProgress();
        saveData();
    });

    // Load todo-input functions
    todoInput.onsubmit = function(event){ event.preventDefault(); };

    // Load Selected Project
    let selectedProject = getSelectedProject();
    if(selectedProject){
        showProjectDataElement(selectedProject);
        loadSelectedProject();
    }
    else{
        showEmptyDataElement();
    }
    
}

// Used to generate HTML Project Cards
function generateProjectCard(parentElement, projectData){  
    // Project Card Div  
    let projectCard = document.createElement("div");
    projectCard.className = "card";
    projectCard.id = projectData.id;

    // Project Color Button & Icon
    let projectColorButton = document.createElement("button");
    let projectColorIcon = document.createElement("i");
    if(projectData.selected){
        projectColorIcon.className = "fa-solid fa-circle";
    }
    else{
        projectColorIcon.className = "fa-regular fa-circle";
    }
    projectColorIcon.style.color = projectData.color;
    projectColorButton.appendChild(projectColorIcon);
    projectCard.appendChild(projectColorButton);
    projectColorButton.addEventListener("click", function(){ cycleProjectColor(projectData.id); saveData();})
    projectColorButton.onmouseover = function(){ projectColorIcon.style.color = getNextColor(projectData.color); };
    projectColorButton.onmouseout = function(){ projectColorIcon.style.color = projectData.color };

    // Project Name
    let projectName = document.createElement("p");
    projectName.style.userSelect = "none";
    projectName.innerText = projectData.projectname;
    projectCard.appendChild(projectName);
    projectName.addEventListener("click", function(){ selectProject(projectData.id); saveData();})

    // Favorite Icon
    let heartButton = document.createElement("button");
    heartButton.className = "favorite-button";
    heartButton.addEventListener("click", function(){toggleFavorite(projectData.id); saveData();});
    let heartIcon = document.createElement("i");
    if(projectData.favorited){
        heartIcon.className = "fa-solid fa-heart";
    }
    else{
        heartIcon.className = "fa-regular fa-heart";
    }
    heartIcon.style.color = projectData.color;
    heartButton.appendChild(heartIcon);
    projectCard.appendChild(heartButton);

    parentElement.appendChild(projectCard);
}

// Used to generate HTML Todo Cards
function generateTodoCard(todoData){
    // Todo Card Div  
    let todoCard = document.createElement("div");
    todoCard.className = "card";
    todoList.appendChild(todoCard);

    // Edit Todo Position Button
    let gripButton = document.createElement("button");
    let gripIcon = document.createElement("i");
    gripIcon.className = "fa-solid fa-grip-vertical";
    gripButton.appendChild(gripIcon);
    todoCard.appendChild(gripButton);

    // Todo Color Button
    let colorButton = document.createElement("button");
    let colorIcon = document.createElement("i");
    colorIcon.className = "fa-regular fa-circle";
    colorIcon.style.color = todoData.color;
    colorButton.addEventListener("click", function(){
        colorIcon.style.color = getNextColor(todoData.color);
        todoData.color = colorIcon.style.color;
        if(!todoData.inedit){ 
            todoCard.querySelector("h3").style.background = todoData.color;
        }
        saveData();
    });
    colorButton.appendChild(colorIcon);
    todoCard.appendChild(colorButton);

    // Todo Text Value
    let todoValue = document.createElement("p");
    todoValue.style.userSelect = "none";
    todoValue.style.background = "transparent";
    todoValue.innerText = todoData.value;
    todoValue.contentEditable = false;
    todoValue.oninput = function(){ todoData.value = todoValue.innerText; saveData(); };

    // Load Todo Text Style based on completed
    if(todoData.completed){
        todoValue.style.textDecoration = "line-through";
    }
    else{
        todoValue.style.textDecoration = "none";
    }
    todoCard.appendChild(todoValue);
    todoValue.addEventListener ("click", function(){
        toggleTodoCompleted(todoData, todoValue);
        updateProjectProgress();
        saveData();
    });

    // Todo Category
    let todoCategory = document.createElement("h3");
    todoCategory.innerText = todoData.category;
    todoCategory.contentEditable = false;
    todoCategory.style.background = todoData.color;
    if(!todoData.category || todoData.category == "" || todoData.category == "\n"){
        todoCategory.style.background = "transparent";
    }
    todoCard.appendChild(todoCategory);
    todoCategory.oninput = function(){ todoData.category = todoCategory.innerText; saveData(); };

    // Edit Todo Button
    let editButton = document.createElement("button");
    let editIcon = document.createElement("i");
    editIcon.style.transition = "120ms";
    editIcon.className = "fa-solid fa-pen";
    editButton.appendChild(editIcon);
    editButton.addEventListener("click", function(){
        editTodo(todoData, todoValue, todoValue);
        saveData();
    });
    let defaultIconColor = editButton.style.color;
    editButton.onmouseover = function(){ editButton.style.color = getSelectedProject().color};
    editButton.onmouseout = function(){ editButton.style.color = defaultIconColor}
    todoCard.appendChild(editButton);

    // Delete Todo Button
    let deleteButton = document.createElement("button");
    let deleteIcon = document.createElement("i");
    deleteIcon.style.transition = "120ms";
    deleteIcon.className = "fa-solid fa-circle-xmark";
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener("click", function(){
        deleteTodo(todoData, todoCard);
        updateProjectProgress();
        saveData();
    });
    deleteButton.onmouseover = function(){ deleteButton.style.color = getSelectedProject().color};
    deleteButton.onmouseout = function(){ deleteButton.style.color = defaultIconColor}
    todoCard.appendChild(deleteButton);
}

function toggleTodoCompleted(todoData, todoValue){
    if(todoData.inedit) { return; }
    resetTodoEdits(ignoreID = todoData.id);
    todoData.completed = !todoData.completed;
    if (todoData.completed){
        todoValue.style.textDecoration = "line-through";
    }
    else{
        todoValue.style.textDecoration = "none";
    }
}

// Runs when username is modified
function updateUserName(){
    let newUserName = document.getElementById("username");
    if (newUserName.value == "" || !newUserName){
        newUserName.value = data.username;
    }
    else{
        newUserName.value;
        saveData();
    }
}

// Runs when add-project-card button is clicked
// Adds project to data and calls generateProjectCard()
function addProject(){
    // Resets Project Selection so new project can be selected
    resetProjectSelection();

    // Generate a unique project ID
    let generatedID = generateID();
    while (Object.values(data.projects).includes(generatedID)){
        generatedID = generateID();
    }

    // Default new project values
    projectData = {id:generatedID, color: projectColors[0], projectname: "New Project",
        favorited: false, selected:true, todos: [], newtodocolor: projectColors[0], todoalias:"Todo"};

    // Add to data and save file
    data.projects.push(projectData);
    generateProjectCard(projectsElement, projectData);

    // Generate Todo App HTML When Making first project
    if (data.projects.length <= 1){
        let selectedProject = data.projects.filter((project) => project.id == projectData.id)[0];
        showProjectDataElement(selectedProject);
    }
}

// Runs when add-todo button is clicked
// Adds todo to project and calls generateTodoCard()
function addTodo(){
    let selectedProject = getSelectedProject();
    if(!selectedProject || todoInput.value == ""){ return; }
    
    // Generate a unique todo ID
    let generatedID = generateID();
    while (Object.values(selectedProject).includes(generatedID)){
        generatedID = generateID();
    }
    
    // Create todo data and add it into data
    let todoCategoryInput = document.getElementById("todo-category");
    todoData = {id:generatedID, color:newTodoColorIcon.style.color, value:todoInput.value, category:todoCategoryInput.value, completed:false, inedit:false}
    selectedProject.todos.push(todoData);
    generateTodoCard(todoData);

    todoInput.value = null;
}

// Runs when edit todo button is clicked
function editTodo(todoData, todoValue){
    resetTodoEdits(ignoreID = todoData.id);

    // Toggle todo inedit data and update Html
    todoData.inedit = !(todoData.inedit);
    todoValue.contentEditable = todoData.inedit;
    if(todoData.inedit == true){
        todoValue.style.background = "rgba(1,1,1,.25)";
        todoValue.style.textDecoration = "none";

        let todoCategory = todoValue.parentElement.querySelector("h3");
        todoCategory.contentEditable = true;
        todoCategory.style.background = "rgba(1,1,1,.25)";
    }
    else{
        resetTodoEdits();
        todoValue.style.background = "transparent";
        if(todoData.completed){ todoValue.style.textDecoration = "line-through"; }

        let todoCategory = todoValue.parentElement.querySelector("h3");
        todoCategory.contentEditable = false;
        todoCategory.style.background = "transparent";
        if(todoData.category != "" && todoData.category != "\n"){  
            todoCategory.style.background = todoData.color;
        }
    }
}

// Runs when edit todo button clicked or when selectProject runs
// Resets all todos inedit to false and then updates HTML
function resetTodoEdits(ignoreID = null){
    // Sets all todos in current project to false
    let todosInEdit = getSelectedProject().todos.filter((todo) => todo.inedit);
    if(ignoreID){
        todosInEdit = getSelectedProject().todos.filter((todo) => todo.inedit && todo.id != ignoreID);
    }
    todosInEdit.forEach((todo) => todo.inedit = false);

    // Updates all todo cards p element back to transparent
    let todosInEditElements = Array.from(todoList.querySelectorAll("p")).filter((element) => element.style.background != "transparent");
    todosInEditElements.forEach((element) => {element.style.background = "transparent"; element.contentEditable = "false";});
}

// Runs when user swaps projects or deletes all todos
// Deletes and clears all child of todo-list div
function deleteTodoCards(){
    while(todoList.firstChild){
        todoList.removeChild(todoList.firstChild);
    }
}

// Runs when user presses the todo delete button
function deleteTodo(todoData, todoCard){
    // Update Data
    let selectedProject = getSelectedProject();
    selectedProject.todos = selectedProject.todos.filter((todo) => todo.id != todoData.id);

    // Remove TodoCard
    removeElement(todoCard);
}

// Runs when HTML element needs to be deleted
function removeElement(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
    element.remove();
}

// Runs when generated an ID for projects and todos
// Generates a random ID of XX-XXXX-XX with X being a random number from 0 to 9
function generateID(){
    function randomNumber() {
        return Math.floor(Math.random() *9);
    }
    return randomNumber().toString() + randomNumber().toString() + "-" + randomNumber().toString() + 
    randomNumber().toString() + randomNumber().toString() + randomNumber().toString() + "-" + randomNumber().toString() + randomNumber().toString();
}

// Selects all selected projects and set them false, additionally it also updates the html
function resetProjectSelection(){
    let selectedProject = getSelectedProject();
    if(!selectedProject) { return; }

    selectedProject.selected = false;
    let projectCard = document.getElementById(selectedProject.id);
    let selectIcon = projectCard.querySelector(".fa-circle");
    selectIcon.className = "fa-regular fa-circle";
}

// Runs when project name is changed
// Grabs current project data and updates the projectname
function updateProjectName(){
    selectedProject = getSelectedProject();
    if(!selectedProject) { return; }
    
    let projectTitleInput = document.getElementById("project-title-input");
    if (projectTitleInput.value == "" || !projectTitleInput) {
        projectTitleInput.value = selectedProject.projectname;
    }
    else{
        selectedProject.projectname = projectTitleInput.value;
        let selectedProjectElement = document.getElementById(selectedProject.id).querySelector("p");
        selectedProjectElement.innerText = selectedProject.projectname;
        saveData();
    }
}

// Queries and returns projects with selected as true
function getSelectedProject(){
    return data.projects.filter((project) => project.selected)[0];
}

// Runs when user clicks on heart button
// Grabs the button's project ID and toggles the favorite boolean, then updates data + html
function toggleFavorite(projectID){
    let selectedProject = data.projects.filter((project) => project.id == projectID)[0];
    selectedProject.favorited = !selectedProject.favorited;

    // let selectedProjectIndex = data.projects.indexOf(selectedProject);
    let selectedProjectElement = document.getElementById(selectedProject.id);
    let favoriteIcon = selectedProjectElement.querySelector(".fa-heart");
    if(selectedProject.favorited){
        favoriteIcon.className = "fa-solid fa-heart";
        positionProjectCard(selectedProject, selectedProjectElement, favorited=true);
    }
    else{
        favoriteIcon.className = "fa-regular fa-heart";
        positionProjectCard(selectedProject, selectedProjectElement, favorited=false);
    }

    // Runs inside of toggleFavorite() function
    // Puts the project cards in order when toggling between favorite
    function positionProjectCard(selectedProject, projectCard, favorited){
        let selectedProjectIndex = data.projects.indexOf(selectedProject);

        let parentElement = projectsElement;
        if(favorited){
            parentElement = document.getElementById("todo-favorites");
        }
        
        let previousProject = data.projects.filter((project) => project.id != projectCard.id && project.favorited == favorited && data.projects.indexOf(project) < selectedProjectIndex)[0];
        let nextProject = data.projects.filter((project) => project.id != projectCard.id && project.favorited == favorited && data.projects.indexOf(project) > selectedProjectIndex)[0];


        //Base case: Append at end if last item, or if no current items in category, or if nextProject is null
        if(selectedProjectIndex == data.projects.length - 1 || !parentElement.querySelector(".card") || nextProject == null){
            parentElement.appendChild(projectCard);
        }
        // Case 1: Append before a project if nextProject exists
        else if(nextProject){
            document.getElementById(nextProject.id).before(projectCard);
        }
        // Case 2: Append after a project if a previousProject exists
        else if(previousProject){
            document.getElementById(previousProject.id).after(projectCard);
        }
    }

}

// Runs when page loads and when user swaps projects
// Loads currently selected project data and displays them
function loadSelectedProject(){
    let selectedProject = getSelectedProject();
    if(!selectedProject){ return; }

    // Loads Project Title
    let projectTitleInput = document.getElementById("project-title-input");
    projectTitleInput.value = selectedProject.projectname;
    // projectTitleInput.animate([{opacity: 0}, {opacity: 1}], {duration: 300, iterations: 1});

    // Configure Project Delete Button
    let projectDeleteButton = document.getElementById("delete-project-button");
    projectDeleteIcon = projectDeleteButton.querySelector(".fa-solid");
    projectDeleteIcon.style.color = selectedProject.color;
    projectDeleteButton.onclick = function(){ deleteProject(); saveData(); };

    // Configure New Todo Button Color
    newTodoColorIcon.style.color = selectedProject.newtodocolor;

    // Configure Todo Alias
    let aliasElement = document.getElementById("alias");
    aliasElement.value = selectedProject.todoalias;

    // Clear Todo Category
    document.getElementById("todo-category").value = null;

    // Clear Current Todo List
    deleteTodoCards();

    // Resets all todos inedit to false and then updates HTML
    resetTodoEdits();

    // Loads Project Todo List
    selectedProject.todos.forEach((todo) => generateTodoCard(todo));

    // Loads Project Bar
    updateProjectProgress();
}

// Runs when user selects project-card
function selectProject(projectID){
    if(projectID == getSelectedProject().id){
        return;
    }

    resetProjectSelection();
    let selectedProject = data.projects.filter((project) => project.id == projectID)[0];
    selectedProject.selected = true;

    let selectedIcon = document.getElementById(selectedProject.id).querySelector(".fa-circle");
    selectedIcon.className = "fa-solid fa-circle";

    loadSelectedProject();
}

// Runs when alias input is changed
function updateAlias(){
    let aliasElement = document.getElementById("alias");
    if (aliasElement.value == "" || !aliasElement.value){
        aliasElement.value = getSelectedProject().todoalias;
    }
    else{
        getSelectedProject().todoalias = aliasElement.value;
        saveData();
    }
}

// Runs on page load and/or when first project is created
// Hides "Create A New Project" and display selected project
function showProjectDataElement(){
    let selectedProject = getSelectedProject();
    if(!selectedProject) { return; }

    // Hides the empty-data Div
    let emptyDataElement = document.getElementById("empty-data");
    if(emptyDataElement && emptyDataElement.style.display != "none"){
        emptyDataElement.style.display = "none";
    }

    // Displays the todo-project-data Div
    let projectDataElement = document.getElementById("todo-project-data");
    if(projectDataElement.style.display != "block"){
        projectDataElement.style.display = "block";
    }
}

// Runs on page load and/or when no projects exist
// Hides Project Data and displays "Create A New Project"
function showEmptyDataElement(){
    // Displays the empty-data Div
    let emptyDataElement = document.getElementById("empty-data");
    if(emptyDataElement && emptyDataElement.style.display != "flex"){
        emptyDataElement.style.display = "flex";
    }

    // Hides the todo-project-data Div
    let projectDataElement = document.getElementById("todo-project-data");
    if(projectDataElement.style.display != "none"){
        projectDataElement.style.display = "none";
    }
}

// Runs when theme-button is clicked
// Toggles the data.darktheme and assigns according colors
function toggleDarkTheme(load=false){   
    if(!load){ data.darktheme = !data.darktheme; } 

    let root = document.querySelector(':root');
    if (data.darktheme){
        root.style.setProperty("--text-color", "rgb(250, 254, 255");
        root.style.setProperty("--text-color2", "rgb(221, 221, 221)");
        root.style.setProperty("--body-color", "rgb(45, 45, 45)");
        root.style.setProperty("--hierarchy-color", "rgb(55, 55, 55)");
        root.style.setProperty("--project-highlight-color", "rgb(148, 148, 148)");
        root.style.setProperty("--card-drop-shadow", "transparent");
    }
    else{
        root.style.setProperty("--text-color", "rgb(62, 62, 62)");
        root.style.setProperty("--text-color2", "rgb(75, 75, 75)");
        root.style.setProperty("--body-color", "rgb(250, 254, 255)");
        root.style.setProperty("--hierarchy-color", "rgb(243, 244, 247)");
        root.style.setProperty("--project-highlight-color", "lightgrey");
        root.style.setProperty("--card-drop-shadow", "rgba(164, 164, 164, .5)");
    }
}

// Runs when user clicks project color icon/button
// Handles updating the projects color data and html color
function cycleProjectColor(projectID){
    let selectedProject = data.projects.filter((project) => project.id == projectID)[0];
    selectedProject.color = getNextColor(selectedProject.color);
    selectedProject.newtodocolor = selectedProject.color;
    
    // If project is selected, update other html elements on screen
    if(getSelectedProject().id == selectedProject.id){
        // Project Delete Button
        document.getElementById("delete-project-button").querySelector("i").style.color = selectedProject.color;

        // Project Progress Bar
        updateProjectProgress();

        // New Todo Color Button/Icon
        document.getElementById("new-todo-color").querySelector("i").style.color = selectedProject.color;
    }

    let selectedProjectIcons = document.getElementById(selectedProject.id).getElementsByTagName("i");
    Array.from(selectedProjectIcons).forEach((icon) => icon.style.color = selectedProject.color);
}

// Runs when user hovers or clicks project color icon/button
// Previews the next color for todoData and projectData objects
function getNextColor(color){
    if (!projectColors.includes(color)) { return; }
    
    let currentColorIndex = projectColors.indexOf(color);
    if(currentColorIndex == projectColors.length - 1){
        return projectColors[0];
    }
    else{
        return projectColors[currentColorIndex + 1];
    }
}

// Runs when user clicks delete-project-button
// Grabs current selected project and removes it from data, then updates html
function deleteProject(){
    let selectedProject = getSelectedProject();
    if(!selectedProject){ return; }

    let newProjectsData = data.projects.filter((project) => project.id != selectedProject.id);
    data.projects = newProjectsData;

    let projectCard = document.getElementById(selectedProject.id);
    while (projectCard.firstChild){
        projectCard.removeChild(projectCard.firstChild)
    }
    projectCard.remove();

    if (data.projects.length > 0){
        // Atleast one project needs to be selected at all times
        // let it temporarily be the first one to prevent selectProject() errors
        data.projects[0].selected = true;
        
        let lastProject = data.projects[data.projects.length - 1];
        selectProject(lastProject.id);
        loadSelectedProject();
    }
    else{
        showEmptyDataElement();
    }
}

// Runs on project load and when todo is added, completed, or deleted
function updateProjectProgress(){
    let selectedProject = getSelectedProject();

    // Calculate Progress
    let progress = 0;
    if(selectedProject.todos.length > 0){   
        let completed = selectedProject.todos.filter((todo) => todo.completed).length;
        progress = Math.floor((completed / selectedProject.todos.length) * 100);   
    }

    // Update Element
    let progressBar = document.getElementById("project-progress-bar");
    progressBar.style.background = selectedProject.color;
    progressBar.style.width = progress + "%";
    progressBar.parentElement.title = "Completion: " + progress + "%";
}

// On Pade Load:
getData();
loadData();