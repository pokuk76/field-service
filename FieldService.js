const MAX_CHOICES = 50;
let choiceArray = [];
const DEFAULT_VALUES = {
	"label": '',
	"default": '',
	"choices": '',
	"type": 'multi-select',
	"order": 'alpha',
	"required": false,
	
};


let FieldService =  {
	validateField: function() {
		let valid = true;
		valid = handleRequiredFields(valid);
		
		let defaultValue = document.querySelector("#default").value;
		let defaultFieldEmpty = defaultValue === '' || defaultValue.trim() === '';
		//Handle maximum choices
		if( actualMaxReached() && !(choiceArray.includes(defaultValue)) && !defaultFieldEmpty ) {
			valid = false;
			let id = document.querySelector("#choices").id.concat("-max-feedback");
			let node = document.querySelector("#choices-row");
			handleMaxChoice(id, node);
		}
		//Handle zero choices given
		if( defaultFieldEmpty && (choiceArray.length === 0) ) {
			valid = false;
			let id = document.querySelector("#choices").id.concat("-null-feedback");
			let node = document.querySelector("#choices-row");
			handleNoChoice(id, node);
		}
		return valid;
	},
	getField: function() {
		let fieldObject = {};
		let valueInputNodes = document.querySelectorAll("input[type='text'], select");
		let checkboxNodes = document.querySelectorAll("input[type='checkbox']");
		
		
		for(let input of valueInputNodes) {
			fieldObject[input.id] = input.value;
		}
		for(let checkbox of checkboxNodes) {
			fieldObject[checkbox.id] = checkbox.checked;
		}
		
		let choiceField = document.querySelector("#choices");
		let defaultChoice = fieldObject['default'];
		if(!choiceArray.includes(defaultChoice) && !(defaultChoice === "" || defaultChoice.trim === "")) {
			addChoice(defaultChoice, choiceField);
		}
		fieldObject['choices'] = choiceArray;
		
		fieldObject['displayAlpha'] = (fieldObject['order']==="alpha") ? true : false;

		return fieldObject;
	},
	postField: async function(url = '', dataJson = {}) {
		const response = await fetch(url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin', //For cookies
			body: dataJson
		});
		return response;
	},
	handleLoading: function() {
		let button = document.querySelector("#save");
		if( button.getAttribute("disabled") === null || button.getAttribute("disabled") === "" ) {
			button.setAttribute("disabled", "true");
		}
		button.innerHTML = `<span class="spinner-border spinner-border-sm"></span>
			Saving...`;
	},
	handleSaveSuccess: function() {
		let button = document.querySelector("#save");
		let innerHTML =  `<span>&#9989;</span>
			Changes Saved`;
		enableButton(button, innerHTML);
	},
	handleSaveFailure: function() {		
		let button = document.querySelector("#save");
		let innerHTML =  `<span>&#10060;</span>
			Save Changes`;
		enableButton(button, innerHTML);
		
		let div = document.querySelector("#action-group");
		addWarning(div, "Save failed, please try again", "save-fail-warning");
	},
	saveField: function() {
		// Add the code here to call the API (or temporarily, just log fieldJson to the console
		this.handleLoading();
		let fieldValid = this.validateField();
		if(fieldValid){
			removeWarnings();
			let fieldJson = this.getField();
			console.log("Post data: ", fieldJson);
			
			let choiceField = document.querySelector("#choices");
			choiceField.value = "";
			choiceField.blur();
			
			this.postField('http://www.mocky.io/v2/566061f21200008e3aabd919', fieldJson)
			.then(response => {
				this.handleSaveSuccess();
			})
			.catch((error) => {
				this.handleSaveFailure();
				
			});
			return;
		}
		let button = document.querySelector("#save");
		enableButton(button, "Save Changes");
	},
	resetField: function(){
		let button = document.querySelector("#save");
		let innerHTML =  "Save Changes";
		enableButton(button, innerHTML);
		removeWarnings();
		// Clear choices
		let addedChoices = document.querySelector("#added-choices");	//unused
		for(let choice of document.querySelectorAll("div[class='choice']")) {
			choice.remove();
		}
		choiceArray = [];
		
		//reset all fields
		let valueInputNodes = document.querySelectorAll("input[type='text'], select, input[id='choices']");
		let checkboxNodes = document.querySelectorAll("input[type='checkbox']");
		for(let input of valueInputNodes) {
			input.value = DEFAULT_VALUES[input.id];
		}
		for(let checkbox of checkboxNodes) {
			checkbox.checked = DEFAULT_VALUES[checkbox.id];
		}
	},
};



function actualMaxReached(limit=MAX_CHOICES-1){
	let defaultValue = document.querySelector("#default").value;
	return (choiceArray.length === MAX_CHOICES) || ( (choiceArray.length === limit) && !(defaultValue === '' || defaultValue.trim === '') );
}

function addWarning(predecessorNode, message, idString, classString="text-danger font-weight-bold my-warnings"){
	let div = document.createElement("div");
	div.setAttribute("id", idString);
	div.setAttribute("class", classString);
	div.innerHTML = message;
	predecessorNode.insertAdjacentElement("afterend", div);
}

function removeWarnings(query=".my-warnings") {
	let warnings = document.querySelectorAll(query);
	for(warning of warnings){
		warning.remove();
	}
}

function enableButton(button, innerHTML=null) {
	
	if( button.getAttribute("disabled") !== null || button.getAttribute("disabled") !== "" ) {
		button.removeAttribute("disabled");
	}
	if(! (innerHTML === null)){
		button.innerHTML = innerHTML;
	}
}

function disableButton(button, innerHTML=null) {

	if( button.getAttribute("disabled") === null || button.getAttribute("disabled") === "" ) {
		button.setAttribute("disabled", "true");
	}
	if(!(innerHTML === null)){
		button.innerHTML = innerHTML;
	}
}



function handleLabelChange(e) {
	let hasWarning;
	let id = e.target.id.concat("-feedback");
	hasWarning = (document.querySelector("#"+id) !== null) ? true: false;
	if(hasWarning){
		document.querySelector("#"+id).remove();
	}
}

function handleDefaultChange(e) {
	let id = e.target.id.concat("-feedback");
	let query = "div.null-feedback, div.max-feedback";
	removeWarnings(query);
	
	let node = e.target.parentNode;
	if(actualMaxReached(MAX_CHOICES-2) && e.target.value!=="" && choiceArray.includes(e.target.value)){
		handleMaxChoice(id, node);
		return;
	}
}

function handleChoicesChange(e) {
	let query = "div.max-feedback, div.blank-feedback, div.duplicate-feedback";
	removeWarnings(query);
	
	let choice = e.target.value;
	if(!(choice === "" || choice.trim === "")) {
		handleChoices(e);
		return;
	}
}

function handleChoices(e) {
	let query = "div.max-feedback, div.duplicate-feedback, div.blank-feedback, div.null-feedback";
	removeWarnings(query);
		
	let choiceField = e.target;
	let choice = choiceField.value;
	let id;
	let node = document.querySelector("#choices-row");
	
	if(choiceArray.includes(choice)) {
		id = choiceField.id.concat("-duplicate-feedback");
		handleDuplicateChoice(id, node);
		return;
	}
	if(actualMaxReached()){
		let defaultValue = document.querySelector("#default").value;
		if( choice!==defaultValue || choiceArray.includes(defaultValue) ){
			id = choiceField.id.concat("-max-feedback");
			handleMaxChoice(id, node);
			return;
		}
	}
	if(choice === "" || choice.trim === "") {
		id = choiceField.id.concat("-blank-feedback");
		handleBlankChoice(id, node);
		return;
	}

	if(e.type === "click" || e.type === "keyup") {
		addChoice(choice, choiceField);
	}
}

function handleRequiredFields(valid){
	let valueInputNodes = document.querySelectorAll("input[type='text'], select");
	//Handle required fields
	for(input of valueInputNodes) {
		if(input.required && (input.value === "" || input.value === "")) {
			valid = false;
			let label = document.querySelector(`label[for='${input.id}']`).innerText;
			let id = input.id.concat("-feedback");
			if(document.querySelector("#"+id) !== null) {
				break;
			}
			let parentDiv = input.parentNode;
			let div = document.createElement("DIV");
			div.setAttribute("id", id);
			div.setAttribute("class", "text-danger my-warnings");
			div.innerHTML = `${label} is required.`;
			parentDiv.insertAdjacentElement("afterend", div);
		}
	}
	return valid;
}



function addChoice(choice, choiceField) {
	let addedChoices = document.querySelector("#added-choices");
	let div = document.createElement("DIV");
	div.setAttribute("id", choice);
	div.setAttribute("class", "choice");
	div.innerHTML = `${choice}
				<button type="button" class="btn btn-remove-choice" onclick="removeChoice(this, event)"><span>X</span></button>`;
	addedChoices.insertBefore(div, addedChoices.firstChild);
	
	choiceArray.unshift(choice);	//Add choice from the array
	
	choiceField.value = "";
	choiceField.focus();
	
	//Disable button
	if(actualMaxReached()){
		let addChoiceButton = document.querySelector("#add-choice-button");
		disableButton(addChoiceButton);
	}
}

function removeChoice(node, e) {
	e.preventDefault;
	let addedChoices = document.querySelector("#added-choices");
	let parent = node.parentNode;
	let choice = parent.getAttribute("id");
	addedChoices.removeChild(parent);
	
	//Remove choice from the array
	let index = choiceArray.indexOf(choice);
	if(index > -1) {
		choiceArray.splice(index, 1);
	}
	
	//Re-enable button
	let defaultValue = document.querySelector("#default").value;
	let maxAvoided = (choiceArray.length === MAX_CHOICES-1) || ( (choiceArray.length === MAX_CHOICES-2) && !(defaultValue === '') && !choiceArray.includes(defaultValue) );
	if(maxAvoided){
		let addChoiceButton = document.querySelector("#add-choice-button");
		enableButton(addChoiceButton);
		let query = "div.max-feedback";
		removeWarnings(query);
	}
}

function handleNoChoice(warningId, predecessorNode, message="Please enter at least 1 choice (or a default value)") {
	if(document.querySelector("#"+warningId) !== null) {
		return;
	}
	addWarning(predecessorNode, message, warningId, "text-danger font-weight-bold my-warnings null-feedback");
}

function handleMaxChoice(warningId, predecessorNode, message=`${MAX_CHOICES} choices maximum (including default value)`) {
	if(document.querySelector("#"+warningId) !== null) {
		return;
	}
	addWarning(predecessorNode, message, warningId, "text-danger font-weight-bold my-warnings max-feedback");
}

function handleDuplicateChoice(warningId, predecessorNode, message="That choice already exists") {
	if(document.querySelector("#"+warningId) !== null) {
		return;
	}
	addWarning(predecessorNode, message, warningId, "text-danger font-weight-bold my-warnings duplicate-feedback");
}

function handleBlankChoice(warningId, predecessorNode, message="Cannot add blank choice") {
	if(document.querySelector("#"+warningId) !== null) {
		return;
	}
	addWarning(predecessorNode, message, warningId, "text-danger font-weight-bold my-warnings blank-feedback");
}
