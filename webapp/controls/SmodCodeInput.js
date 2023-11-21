/*global window*/
sap.ui.define([
	"sap/ui/core/Control",
	"./SmodCodeInputCell"
], function (Control, SmodCodeInputCell) {
	"use strict";
	var E = Control.extend("com.lesaffre.advance.controls.SmodCodeInput", {

		metadata: {
			properties: {
				"length": {
					type: "int",
					bindable: true
				},
				"validated": {
					type: "boolean",
					bindable: true,
					default: false
				},
				"enabled": {
					type: "boolean",
					bindable: true,
					default: true
				},
				"value": {
					type: "string",
					bindable: true
				}
			},
			aggregations: {},
			events: {

			}

		},
		init: function () {
			var libraryPath = jQuery.sap.getModulePath("com.lesaffre.advance"); //get the server location of the ui library
			jQuery.sap.includeStyleSheet(libraryPath + "/controls/SmodCodeInput.css");
			this.setValidated(false);
		},

		// onAfterRendering: function () {
		// 	var that = this;
		// 	var processInput = function (holder) {
		// 		var exist = false;
		// 		var elements = holder.children(),
		// 			str,
		// 			validcount = 0;

		// 		elements.each(function (e) { //iterates through each element
		// 			var val = $(this).val().replace(/\D/, ""), //taking the value and parsing it. Returns string without changing the value.
		// 				focused = $(this).is(":focus"), //checks if the current element in the iteration is focused
		// 				parseGate = false;

		// 			if (val.length == 1) {
		// 				parseGate = false;
		// 			} else {
		// 				parseGate = true;
		// 			}
		// 			/*a fix that doesn't allow the cursor to jump 
		// 			to another field even if input was parsed 
		// 			and nothing was added to the input*/

		// 			$(this).val(val); //applying parsed value.

		// 			if (parseGate && val.length > 1) { //Takes you to another input
		// 				exist = elements[e + 1] ? true : false; //checks if there is input ahead
		// 				if (exist && val[1]) { //if so then
		// 					elements[e + 1].disabled = false;
		// 					elements[e + 1].value = val[1]; //sends the last character to the next input
		// 					elements[e].value = val[0]; //clears the last character of this input
		// 					elements[e + 1].focus(); //sends the focus to the next input
		// 				}
		// 			} else if (parseGate && focused && val.length === 0) { //if the input was REMOVING the character, then
		// 				exist = elements[e - 1] ? true : false; //checks if there is an input before
		// 				if (exist) elements[e - 1].focus(); //sends the focus back to the previous input
		// 			}

		// 			if (val === "") {
		// 				str += " ";
		// 			} else {
		// 				str += val;
		// 			}

		// 		});
		// 	};

		// 	$(".smod-code-input-elements").on('input', function () {
		// 		processInput($(this));
		// 		var sVal = null;
		// 		$(this).children().each(function (sIndex, oEl) {
		// 			sVal = sVal ? sVal.toString() + oEl.value.toString() : oEl.value.toString();
		// 		});
		// 		// console.log(sVal);
		// 		//that.setValue(sVal);
		// 	}); //still wonder how it worked out. But we are adding input listener to the parent... (omg, jquery is so smart...);

		// 	$(".smod-code-input-elements").on('click', function (e) { //making so that if human focuses on the wrong input (not first) it will move the focus to a first empty one.
		// 		var els = $(this).children();
		// 		els.each(function (el) {
		// 			var focus = $(this).is(":focus");
		// 			var that = $(this);
		// 			while (that.prev().val() == "") {
		// 				that.prev().focus();
		// 				that = that.prev();
		// 			}
		// 		});
		// 	});
		// },
		onCellValueChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var sLength = this.getLength();
			var sValid = false;
			var sValue = "";

			//Focus to next
			if (oSource.getValue()) {
				var sIndex = oSource.getIndex();

				if (this._inputCells[sIndex + 1]) {
					this._inputCells[sIndex + 1].$().focus();
				}
			}

			$.each(this._inputCells, function (sCount, oCell) {
				if (oCell.getValue())
					sValue = sValue.toString() + oCell.getValue();
			});

			if (sValue.length === sLength) {
				sValid = true;
				this.$().find(".smod-code-input-elements").addClass("isValid");
			} else {
				sValid = false;
				this.$().find(".smod-code-input-elements").removeClass("isValid");
			}

			this.setProperty("value", sValue, true);
			console.log(sValue, sValid);
			this.setProperty("validated", sValid, true);
			this.onPostValueChanged();
		},
		onPostValueChanged: function () {
			var sValid = this.getValidated();
			if (sValid) {
				this.$().find(".smod-code-input-elements").addClass("isValid");
			} else {
				this.$().find(".smod-code-input-elements").removeClass("isValid");
			}
		},
		onGoToPreviousCell: function (oEvent) {
			var oSource = oEvent.getSource();
			var sIndex = oSource.getIndex();
			if (this._inputCells[sIndex - 1]) {
				this._inputCells[sIndex - 1].$().focus();
				this.onPostValueChanged();
			}
		},
		renderer: function (oRM, oControl) {
			var sVal = oControl.getValue() || "";
			var sLength = oControl.getLength() || 1;
			var sEnabled = oControl.getEnabled() || "";

			oRM.write("<div");
			oRM.addClass("smod-code-input-main-container");
			oRM.writeClasses();
			oRM.writeControlData(oControl);
			oRM.write(">");

			oRM.write("<div id='inputs'");
			oRM.addClass("smod-code-input-elements");
			if (sVal.length === sLength) {
				oRM.addClass("isValid");
			}
			oRM.writeClasses();
			oRM.write(">");

			oControl._inputCells = [];
			sVal = sVal.trim();
			for (var i = 0; i < sLength; i++) {
				var oCell = new SmodCodeInputCell({
					index: i,
					value: sVal.substring(i, 1),
					valueChange: oControl.onCellValueChange.bind(oControl),
					goToPrevCell: oControl.onGoToPreviousCell.bind(oControl),
					enabled: sEnabled

				});
				oControl._inputCells.push(oCell);
				oRM.renderControl(oCell);
			}

			oRM.write("</div>"); //Inputs
			oRM.write("</div>"); //Container

		}
	});

	return E;

});