/* Class-based implementation */
class FieldBuilder {
	
	constructor(field}){
		this.fieldObject = field;
	}
	
	postField() {}
	
	saveField() {}
	
	handleLoading() {}
	
	handleSaveSuccess() {}
	
	handleSaveFailure(){}
}

class MultipleChoiceField {
	constructor(max_num_choices=50, choiceArray=[], default_values = {"label": '',"choices": '',"type": 'multi-select',"order": 'alpha'}){
		
		let num_choices = max_num_choices;
		this.getMaxNumChoices = function() { 
			return num_choices;
		};
		this.choiceArray = choiceArray;
		this.DEFAULT_VALUES = default_values;
		this.type = "MULTIPLE_CHOICE";
	}
	
	getField() {}
	
	validateField() {}
	
	resetField() {}
	
	
	handleLabelChange() {}
	
	handleDefaultChange() {}
	
	handleChoicesChange() {}
	
	handleChoices() {}
	
	handleRequiredFields() {}
	
	
	addChoice() {}
	
	removeChoice() {}
	
	handleNoChoice() {}
	
	handleMaxChoice() {}
	
	handleDuplicateChoice() {}
	
	handleBlankChoice() {}
}
