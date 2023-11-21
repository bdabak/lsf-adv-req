/*global history */
var fnResolve, fnReject, timer, oValFragment;
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/Dialog",
    "com/lesaffre/advance/controls/SmodCodeInput",
  ],
  function (Controller, History, Dialog, SmodCodeInput) {
    "use strict";

    return Controller.extend("com.lesaffre.advance.controller.BaseController", {
      /**
       * Convenience method for accessing the router in every controller of the application.
       * @public
       * @returns {sap.ui.core.routing.Router} the router for this component
       */
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      oValFragment: null,

      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @public
       * @param {string} sName the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      /**
       * Convenience method for setting the view model in every controller of the application.
       * @public
       * @param {sap.ui.model.Model} oModel the model instance
       * @param {string} sName the model name
       * @returns {sap.ui.mvc.View} the view instance
       */
      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },
      // --- Validation Begin
      onValidate: function (oEvent) {
        var that = this;
        var oValModel = this.getModel("valModel");
        this._sendValidation(
          oValModel.getProperty("/validationCode"),
          oValModel.getProperty("/Fvlid"),
          this._getParameter
        );
      },
      onNewRequest: function () {
        this.getRouter().navTo("create");
      },
      onResend: function (oEvent) {
        var that = this;
        var oValModel = this.getModel("valModel");
        oValModel.setProperty("/Resend", false);
        oValModel.setProperty("/ValEnabled", true);
        that._getParameter(
          "EXPTM",
          that._getIsValidated,
          that.getView(),
          fnResolve,
          fnReject,
          that
        );
      },
      _getValidationFragment: function (oView, sTime, oThis, that) {
        /*var oMainText = new sap.m.Text({
				text: that.getResourceBundle().getText("CommunicationInformation") + " " + that.getModel("valModel").getProperty("/Fvlpn") + " " +
					that.getResourceBundle().getText("Validate")
			});
			oMainText.addStyleClass("valMainText sapUiTinyMarginEnd")
		
			var oFlexBoxMain = new sap.m.FlexBox({
				justifyContent: "Center",
				items: [oMainText]
			});
			var oRemainingText = new sap.m.Text({
				text: that.getModel("valModel").getProperty("/Remaining")
			});
			oRemainingText.addStyleClass("valTimerText sapUiMediumMarginTop sapUiMediumMarginLeft")
			var oFlexBoxRemaining = new sap.m.FlexBox({
				justifyContent: "Center",
				items: [oRemainingText]
			});
			var oSmodCodeInput = new SmodCodeInput({
				length: 4,
				validated: that.getModel("valModel").getProperty("/validated"),
				value: that.getModel("valModel").getProperty("/validationCode")
			});
			var oFlexBoxSmodControls = new sap.m.FlexBox({
				justifyContent: "Center",
				items: [oSmodCodeInput]
			});
			var oBeginButton = new sap.m.Button({
				text: that.getResourceBundle().getText("Resend"),
				enabled: that.getModel("valModel").getProperty("/Resend"),
				press: that.onResend
			});
			var oEndButton = new sap.m.Button({
				enabled: "{valModel>/validated}",
				type: "Emphasized",
				text: that.getResourceBundle().getText("ValidateButton"),
				press: that.onValidate
			});
			oValFragment = new Dialog({
				title: that.getResourceBundle().getText("ValidationCode"),
				contentHeight: "35%",
				contentWidth: "42%",
				beginButton: oBeginButton,
				endButton: oEndButton,
				content: [oFlexBoxMain, oFlexBoxRemaining, oFlexBoxSmodControls]

			});
			oValFragment.addStyleClass("valDialog")*/
        if (oValFragment) {
          oValFragment = null;
        }
        if (!oValFragment) {
          oValFragment = sap.ui.xmlfragment(
            "com.lesaffre.advance.fragment.Sval",
            oThis
          );
          oView.addDependent(oValFragment);
          oValFragment.attachBrowserEvent("keydown", function (oEvent) {
            if (oEvent.keyCode === 27 || oEvent.keyCode === 123) {
              oEvent.stopPropagation();
              oEvent.preventDefault();
            }
          });
        }
        oValFragment.open();
        //	var sTime = 180;
        var oValModel = oThis.getModel("valModel");
        clearInterval(timer);
        timer = null;

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
            oValModel.setProperty("/validated", false);
            oValModel.setProperty("/validationCode", "");
            oValModel.setProperty("/Remaining", "Kodun süresi doldu");
            clearInterval(timer);
            timer = null;
          } else {
            oValModel.setProperty("/Remaining", "Kalan Süre: " + sLeft);
          }

          sTime--;
        };
        timer = setInterval(startCountDown, 1000);
      },

      _getIsValidated: function (
        fnCallback,
        oView,
        sTime,
        resolveCb,
        rejectCb,
        that
      ) {
        fnReject = rejectCb;
        fnResolve = resolveCb;
        var oValModel = that.getModel("valModel");
        that.getModel("Validation").callFunction("/GetIsValidated", {
          urlParameters: {
            Fvlap: "OTHER",
          },
          success: function (oData) {
            if (oData.results[0].Fvliv !== "X") {
              if (oData.results[0].Fverc === "F") {
                sap.m.MessageBox.error(oData.results[0].Fvlms);
              } else if (oData.results[0].Fverc === "T") {
                sap.m.MessageBox.error(oData.results[0].Fvlms);
                that._getParamater(
                  "EXPTM",
                  that._getIsValidated,
                  oView,
                  resolveCb,
                  rejectCb,
                  that
                );
              } else {
                fnCallback(oView, sTime, that, that);
                oValModel.setProperty(
                  "/Fvlid",
                  oData.results[0].Fvlid.replace(
                    /[^a-zA-Z0-9]/g,
                    ""
                  ).toUpperCase()
                );
                oValModel.setProperty(
                  "/Fvlpn",
                  "*********" +
                    oData.results[0].Fvlpn.substr(
                      oData.results[0].Fvlpn.length - 2
                    )
                );
              }
              /*fnCallback(oView, sTime, that, that);
						oValModel.setProperty("/Fvlid", oData.results[0].Fvlid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
						oValModel.setProperty("/Fvlpn", "*********" + oData.results[0].Fvlpn.substr(oData.results[0].Fvlpn.length - 2));*/
            } else {
              resolveCb("Validated");
            }
          },
          errror: function (oError) {},
        });
      },
      _getParameter: function (
        sParvl,
        fnCallback,
        oView,
        resolveCb,
        rejectCb,
        that
      ) {
        that.getModel("Validation").callFunction("/GetParameter", {
          urlParameters: {
            Parnm: sParvl,
          },
          success: function (oData) {
            fnCallback(
              that._getValidationFragment,
              oView,
              oData.results[0].Parvl,
              resolveCb,
              rejectCb,
              that
            );
          },
          errror: function (oError) {},
        });
      },
      _sendValidation: function (sFvlco, sFvlid, fnCallback) {
        var that = this;
        this.getModel("Validation").callFunction("/SendValidation", {
          urlParameters: {
            Fvlco: sFvlco,
            Fvlid: sFvlid,
          },
          success: function (oData) {
            if (oData.results[0].Fvliv === "X") {
              oValFragment.close();
              fnResolve();
            } else {
              sap.m.MessageToast.show("Yanlış Doğrulama");
              var oValModel = that.getModel("valModel");
              oValModel.setProperty("/validated", false);
              oValModel.setProperty("/validationCode", "");
              //	fnCallback("EXPTM", that._getIsValidated, that.getView(), fnResolve, fnReject, that);
            }
          },
          errror: function (oError) {},
        });
      },

      // - Validation End

      /**
       * Convenience method for getting the resource bundle.
       * @public
       * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
       */
      getResourceBundle: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      getText: function (sTextCode, aParam = []) {
        return this.getResourceBundle().getText(sTextCode, aParam);
      },

      /**
       * Event handler for navigating back.
       * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the master route.
       * @public
       */
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash(),
          oCrossAppNavigator = sap.ushell.Container.getService(
            "CrossApplicationNavigation"
          );

        if (
          sPreviousHash !== undefined ||
          !oCrossAppNavigator.isInitialNavigation()
        ) {
          history.go(-1);
        } else {
          this.getRouter().navTo("master", {}, true);
        }
      },
    });
  }
);
