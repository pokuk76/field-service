class SaveButton extends HTMLButtonElement {
  constructor() {
    // Always call super first in constructor
    self = super();
	
	const buttons = Array.from(self.querySelectorAll('button'));	// Get button elements that are a child of this custom button element
  }
  
  onLoad(){}
  
  onSaveSuccess(){}
  
  onSaveFailure(){}
  
}

// Define the new element
customElements.define('save-button', SaveButton, { extends: "button" });