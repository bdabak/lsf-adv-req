sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (a) {
			var oFormat = NumberFormat.getFloatInstance({
				groupingEnabled: false, // grouping is enabled
				decimalSeparator: ",", // the decimal separator must be different from the grouping separator
			  });
			  try {
				return oFormat.format(a);
			  } catch (r) {
				return a;
			  }
		},
		dateValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return sValue.toLocaleDateString();
		},

		getRequestStatus: function (sStatus) {
			switch (sStatus) {
			case "00":
				return "None";
			case "01":
				return "Warning";
			case "02":
				return "Success";
			case "03":
				return "Error";
			case "04":
				return "None";
			case "99":
				return "Success";
			default:
				return sStatus;
			}
		},
		getWfDateVisibility: function (sStatus) {
			try {
				if (sStatus === "A" || sStatus === "R") {
					return true;
				} else {
					return false;
				}
			} catch (oErr) {
				return null;
			}
		},

	};

});