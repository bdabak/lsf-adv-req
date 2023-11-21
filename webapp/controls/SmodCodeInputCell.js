/*global window*/
sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	var E = Control.extend("com.lesaffre.advance.controls.SmodCodeInputCell", {

		metadata: {
			properties: {
				"value": {
					type: "string",
					bindable: true
				},
				"index": {
					type: "int",
					bindable: false
				},
				"enabled": {
					type: "string",
					bindable: true,
					default: ""
				},
			},
			aggregations: {},
			events: {
				valueChange: {
					parameters: {
						/**
						 * The new value of the input
						 */
						value: {
							type: "string"
						}
					}
				},
				goToPrevCell: {
					parameters: {
						/**
						 * The new value of the input
						 */
						del: {
							type: "boolean"
						}
					}
				}
			}

		},
		init: function () {
			var libraryPath = jQuery.sap.getModulePath("com.lesaffre.advance"); //get the server location of the ui library
			jQuery.sap.includeStyleSheet(libraryPath + "/controls/SmodCodeInput.css");
		},

		_updateValue: function () {
			var sInputVal = this.$().val();
			this.setProperty("value", sInputVal);

			this.fireValueChange({
				value: sInputVal
			});
		},

		renderer: function (oRM, oControl) {
			var sVal = oControl.getValue() || "";
			var sEnabled = oControl.getEnabled() || "";

			oRM.write("<input");
			oRM.addClass("smod-code-input-cell");
			oRM.writeClasses();
			oRM.writeControlData(oControl);
			oRM.writeAttribute("type", "text");
			oRM.writeAttribute("maxlength", "1");
			oRM.writeAttribute("placeholder", "•");
			oRM.writeAttribute("value", sVal);
			/*if (sEnabled === "") {
				oRM.writeAttribute("disabled", "disabled");  //
			}*/
			oRM.write("/>");

		}
	});
	E.prototype.oninput = function (e) {
		this._updateValue();
	};
	E.prototype.onkeydown = function (e) {
		if (e.keyCode == 8 && this.getValue() === "") {
			this.fireGoToPrevCell({
				del: true
			});
		}
		var sAccept = (e.keyCode == 8 ||
			e.keyCode == 9 ||
			e.keyCode == 13 ||
			e.keyCode == 46 ||
			e.keyCode == 110 ||
			e.keyCode == 190 ||
			(e.keyCode >= 35 && e.keyCode <= 40) ||
			(e.keyCode >= 48 && e.keyCode <= 57) ||
			(e.keyCode >= 96 && e.keyCode <= 105));

		if (!sAccept) {
			e.preventDefault(true);
			e.stopPropagation();
		}
	};

	return E;

});