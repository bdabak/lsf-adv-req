sap.ui.define([
		"sap/m/Dialog",
		"com/lesaffre/advance/controls/SmodCodeInput"
	],
	function (Dialog, SmodCodeInput) {
		var fnResolve, fnReject, oValFragment, oValModel;

		return {
			onValidate: function (oEvent) {
				var that = this;
				//	var oValModel = this.getModel("valModel");
				this._sendValidation(oValModel.getProperty("/Code"), oValModel.getProperty("/Fvlid"),
					this._getParameter);
			},

			onResend: function (oEvent) {
				var that = this;
				var oValModel = this.getModel("valModel");
				oValModel.setProperty("/Resend", false);
				oValModel.setProperty("/ValEnabled", true);
				that._getParameter("EXPTM", that._getIsValidated, that.getView(), fnResolve, fnReject, that);
			},
			_getValidationFragment: function (oView, sTime, oThis, that) {
				var oMaintext = new sap.m.Text({
					text: "{i18n>CommunicationInformation} {valModel>/Phone} {i18n>Validate}"
				});
				oMaintext.addStyleClass("valMainText");
				oMaintext.addStyleClass("sapUiTinyMarginEnd");
				var oSmodInput = new SmodCodeInput({
					length: 4,
					validated: "{valModel>/validated}",
					value: "{valModel>/validationCode}"
				});
				var oTimer = new sap.m.Text({
					text: "{valModel>/Remaining}"
				});
				oTimer.addStyleClass("valTimerText");
				oTimer.addStyleClass("sapUiMediumMarginTop");

				oValFragment = new Dialog({
					title: "{i18n>ValidationCode}",
					content: [oMaintext, oTimer, oSmodInput],
					beginButton: new sap.m.Button({
						enabled: "{valModel>/validated}",
						type: "Emphasized",
						text: "{valModel>/validationCode} - Onayla",
						press: function () {

						}
					}),
					endButton: new sap.m.Button({
						text: "Yeniden Gönder",
						enabled: "{valModel>/Resend}",
						press: this.onResend
					})
				});
				oValFragment.addStyleClass("valDialog");
				//sap.ui.xmlfragment("com.lesaffre.advance.fragment.Sval", oThis);
				oView.addDependent(oValFragment);
				oValFragment.attachBrowserEvent("keydown", function (oEvent) {
					if (oEvent.keyCode === 27 || oEvent.keyCode === 123) {
						oEvent.stopPropagation();
						oEvent.preventDefault();
					}

				});
				oValFragment.open();
				//	var sTime = 180;
				oValModel = oThis.getModel("valModel");
				var timer;
				var startCountDown = function () {
					var sMinutes = 0;
					var sSeconds = 0;
					var sLeft = "";

					if (sTime > 60) {
						sMinutes = Math.floor(sTime / 60);
						sSeconds = sTime - sMinutes * 60;
						sLeft = sMinutes + " dk " + (sSeconds > 0 ? sSeconds + " sn" : "");

					} else {
						sSeconds = sTime;
						sLeft = sSeconds + " sn";
					}
					if (sTime < 1) {
						oValModel.setProperty("/Resend", true);
						oValModel.setProperty("/ValEnabled", false);
						oValModel.setProperty("/Remaining", "Kodun süresi doldu");
						clearInterval(timer);
					}
					oValModel.setProperty("/Remaining", "Kalan Süre: " + sLeft);

					sTime--;
				};
				timer = setInterval(startCountDown, 1000);
			},

			_getIsValidated: function (fnCallback, oView, sTime, resolveCb, rejectCb, that) {

				fnReject = rejectCb;
				fnResolve = resolveCb;
				var oValModel = that.getModel("valModel");
				that.getModel("Validation").callFunction("/GetIsValidated", {
					success: function (oData) {

						if (oData.results[0].Fvliv !== 'X') {
							fnCallback(oView, sTime, that);
							oValModel.setProperty("/Fvlid", oData.results[0].Fvlid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
						} else {
							resolveCb("Validated");
						}
					},
					errror: function (oError) {

					}
				});
			},
			_getParameter: function (sParvl, fnCallback, oView, resolveCb, rejectCb, that) {
				var oThis = this;
				that.getModel("Validation").callFunction("/GetParameter", {
					urlParameters: {
						Parnm: sParvl
					},
					success: function (oData) {
						fnCallback(oThis._getValidationFragment, oView, oData.results[0].Parvl, resolveCb, rejectCb, that);
					},
					errror: function (oError) {

					}
				});
			},
			_sendValidation: function (sFvlco, sFvlid, fnCallback) {
				var that = this;
				this.getModel("Validation").callFunction("/SendValidation", {
					urlParameters: {
						Fvlco: sFvlco,
						Fvlid: sFvlid
					},
					success: function (oData) {
						if (oData.results[0].Fvliv === "X") {
							oValFragment.close();
							fnResolve();
						} else {
							sap.m.MessageToast.show("Yanlış Doğrulama");
							fnCallback("EXPTM", that._getIsValidated, that.getView(), fnResolve, fnReject, that);
						}

					},
					errror: function (oError) {

					}
				});
			}

		};
	}
);