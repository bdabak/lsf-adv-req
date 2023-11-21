sap.ui.define(
	[
		"com/lesaffre/advance/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/format/NumberFormat",
		"sap/m/MessageBox",
		"sap/m/MessageToast"
	],
	function(BaseController, JSONModel, NumberFormat, MessageBox, MessageToast) {
		"use strict";
		var globalPernr_id;
		var globalName_id;
		return BaseController.extend(
			"com.lesaffre.advance.controller.CreateEntity", {
				/* =========================================================== */
				/* lifecycle methods                                           */
				/* =========================================================== */

				onInit: function() {
					this.getRouter()
						.getTargets()
						.getTarget("create")
						.attachDisplay(null, this._onAdvanceCreateMatched, this);
					var oViewModel = new JSONModel({
						busy: false,
						delay: 0,
						Waers: "TRY",
						DisplayEnabled: false,
						Issnd: null,
						Request: this.initiateRequest()
					});
					this.setModel(oViewModel, "advanceModel");
				},
				initiateRequest: function() {
					return {
						Pernr: null,
						Ename: null,
						Advam: null,
						Advlm: null,
						Waers: null,
						Rqdat: null,
						Advrs: ""
					};
				},
				convertToLocalDecimal: function(a) {
					var oFormat = NumberFormat.getFloatInstance({
						groupingEnabled: false, // grouping is enabled
						decimalSeparator: "," // the decimal separator must be different from the grouping separator
					});
					try {
						return oFormat.format(a);
					} catch (r) {
						return a;
					}
				},

				onChangeRqdat: function() {
					var that = this;
					var oViewModel = this.getModel("advanceModel");
					var oAdvance = oViewModel.getProperty("/Request");
					var mParameters = {
						"Pernr": oAdvance.Pernr,
						"Rqdat": oAdvance.Rqdat
					};

					var sServiceURL = "/sap/opu/odata/sap/ZHCM_UX_ADVANCE_SRV/";
					var oModelCurr = new sap.ui.model.odata.ODataModel(sServiceURL);
					//var oModelView = new sap.ui.model.json.JSONModel();
					oViewModel.setProperty("/busy", true);
					oModelCurr.callFunction("/AdvanceLimitControl", {
						method: "GET",
						urlParameters: mParameters,
						//async: true,
						success: function(oData) {
							oViewModel.setProperty("/Request/Advlm", oData.results[0].Advlm);
							oViewModel.setProperty("/busy", false);
						},
						error: function(oError) {
							oViewModel.setProperty("/busy", false);
						}
					});
				},

				_onAdvanceCreateMatched: function() {
					var that = this;
					var oModel = this.getModel();
					var oViewModel = this.getModel("advanceModel");

					oModel.read("/F4HelpPersonSet(Pernr='" + "00000000" + "')", {
						success: function(oData) {
							if (oData.Error.length > 0) {
								MessageToast.show(oData.Message);
								oViewModel.setProperty("/Request", that.initiateRequest());
							} else if (oData.Message.length > 0) {
								MessageToast.show(oData.Message);
								oViewModel.setProperty("/Request", {
									Pernr: oData.Pernr,
									Ename: oData.Ename,
									Advam: 0,
									Advlm: oData.Advlm,
									Waers: oData.Waers,
									Advrs: "",
									Rqdat: oData.Rqdat
								});
								globalPernr_id = oData.Pernr;
								globalName_id = oData.Ename;
							} else {
								oViewModel.setProperty("/Request", {
									Pernr: oData.Pernr,
									Ename: oData.Ename,
									Advam: 0,
									Advlm: oData.Advlm,
									Waers: oData.Waers,
									Advrs: "",
									Rqdat: oData.Rqdat
								});

								globalPernr_id = oData.Pernr;
								globalName_id = oData.Ename;
							}
						},
						error: function(oError) {
							// console.log(oError);
						}
					});
				},

				/* =========================================================== */
				/* event handlers                                              */
				/* =========================================================== */

				/**
				 * Event handler (attached declaratively) for the view save button. Saves the changes added by the user.&nbsp;
				 * @function
				 * @public
				 */
				onSave: function() {
					var that = this;
					var oModel = this.getModel();
					var oViewModel = this.getModel("advanceModel");
					var oAdvance = oViewModel.getProperty("/Request");

					if (oAdvance.Advam === "" || parseInt(oAdvance.Advam) <= 0) {
						MessageBox.error(that.getText("advanceAmountZero"));
						return;
					}

					if (parseInt(oAdvance.Advam) > parseFloat(oAdvance.Advlm)) {
						MessageBox.error(that.getText("advanceLimitExceeded", [this.convertToLocalDecimal(oAdvance.Advlm), oAdvance.Waers]));
						return;
					}

					if (oAdvance.Advrs === "") {
						MessageBox.error(that.getText("reasonEmpty"));
						return;
					}

					if (oAdvance.Rqdat === "" || oAdvance.Rqdat === undefined) {
						MessageBox.error(that.getText("advanceDateEmpty"));
						return;
					}

					if (
						this.getView().byId("Advam_id").getValue() === "" ||
						parseInt(this.getView().byId("Advam_id").getValue()) <= 0
					) {
						MessageBox.error(that.getText("advanceAmountZero"));
						return;
					}

					if (this.getView().byId("Advrs_id").getValue() === "") {
						MessageBox.error(that.getText("reasonEmpty"));
						return;
					}

					oModel.create(
						"/AdvanceSet", {
							Rqoid: oAdvance.Pernr,
							Advat: oAdvance.Advam,
							Advcr: oAdvance.Waers,
							Advrs: oAdvance.Advrs,
							Rqdat: oAdvance.Rqdat
						}, {
							success: function(oData) {
								if (oData.Error === "X") {
									var a = oData.Message.split("*");
									for (var i = 0; i < a.length - 1; i++) {
										MessageBox.error(a[i]);
									}
								} else {
									MessageToast.show(that.getText("requestCreated"));
									that.getRouter().getTargets().display("master");
								}
							},
							error: function(oError) {
								MessageToast.show(that.getText("requestError"));
							}
						}
					);
				},
				onCancel: function() {
					this.initiateRequest();
					this.getRouter().navTo("master");
				},
				onNavBack: function() {
					this.getRouter().getTargets().display("master");
				},

				// getPersData: function (oEvent) {
				//   var that = this;
				//   this.getView()
				//     .getModel()
				//     .read("/F4HelpPersonSet('" + oEvent.getParameter("value") + "')", {
				//       success: function (oData) {
				//         if (oData.Error.length > 0) {
				//           MessageToast.show(oData.Message);
				//           that.getView().byId("Pernr_id").setValue("");
				//           that.getView().byId("Name_id").setValue("");
				//         } else if (oData.Message.length > 0) {
				//           MessageToast.show(oData.Message);
				//           that.getView().byId("Pernr_id").setValue(oData.Pernr);
				//           that.getView().byId("Name_id").setValue(oData.Ename);
				//         } else {
				//           //					that.onClear();
				//           that.getView().byId("Pernr_id").setValue(oData.Pernr);
				//           that.getView().byId("Name_id").setValue(oData.Ename);
				//         }
				//       },
				//       error: function (oError) {
				//         // console.log(oError);
				//       },
				//     });
				// },
				// onSearchPersonnel: function (oEvent) {
				//   this._getF4ValueHelpDialog().open();
				// },

				// _getF4ValueHelpDialog: function () {
				//   if (!this._oF4ValueHelpDialog) {
				//     this._oF4ValueHelpDialog = sap.ui.xmlfragment(
				//       "com.lesaffre.advance.fragment.F4ValueHelpDialog",
				//       this
				//     );
				//     this._oF4ValueHelpDialog.setRememberSelections(false);
				//     this.getView().addDependent(this._oF4ValueHelpDialog);
				//     jQuery.sap.syncStyleClass(
				//       "sapUiSizeCompact",
				//       this.getView(),
				//       this._oF4ValueHelpDialog
				//     );
				//   }

				//   return this._oF4ValueHelpDialog;
				// },
				// onF4ValueHelpSearch: function (oEvent) {
				//   this.searchF4ValueHelp(oEvent.getParameter("value"));
				// },
				// searchF4ValueHelp: function (sSearchStr) {
				//   //	var sId = this._oF4ValueHelpInput.sId;
				//   var upper = sSearchStr.charAt(0).toUpperCase() + sSearchStr.slice(1);
				//   var aFilter = [];
				//   if (sSearchStr) {
				//     aFilter.push(
				//       new sap.ui.model.Filter(
				//         "Ename",
				//         sap.ui.model.FilterOperator.Contains,
				//         upper
				//       )
				//     );
				//   }
				//   var oDialog = this._getF4ValueHelpDialog();
				//   var oBinding = oDialog.getBinding("items");
				//   oBinding.filter(aFilter);
				// },
				// onF4ValueHelpSelected: function (oEvent) {
				//   var aContexts = oEvent.getParameter("selectedContexts");
				//   if (aContexts.length) {
				//     var oContent = aContexts[0]
				//       .getModel()
				//       .getData(aContexts[0].getPath());

				//     this.getView().byId("Pernr_id").setValue(oContent.Pernr);
				//     this.getView().byId("Name_id").setValue(oContent.Ename);
				//   }
				// },

				/* =========================================================== */
				/* Internal functions
		/* =========================================================== */
				/**
				 * Navigates back in the browser history, if the entry was created by this app.
				 * If not, it navigates to the Details page
				 * @private
				 */
				_navBack: function() {
					var oHistory = sap.ui.core.routing.History.getInstance(),
						sPreviousHash = oHistory.getPreviousHash();

					this.getView().unbindObject();
					if (sPreviousHash !== undefined) {
						// The history contains a previous entry
						history.go(-1);
					} else {
						this.getRouter().getTargets().display("master");
					}
				},

				// onCurrencyValueHelpRequest: function (oEvent) {
				//   this._getCurrencyHelpDialog().open();
				// },
				// _getCurrencyHelpDialog: function () {
				//   if (!this._oCurrencyDialog) {
				//     this._oCurrencyDialog = sap.ui.xmlfragment(
				//       "com.lesaffre.advance.fragment.currency",
				//       this
				//     );
				//     this._oCurrencyDialog.setRememberSelections(false);
				//     this.getView().addDependent(this._oCurrencyDialog);
				//     jQuery.sap.syncStyleClass(
				//       "sapUiSizeCompact",
				//       this.getView(),
				//       this._oCurrencyDialog
				//     );
				//   }

				//   return this._oCurrencyDialog;
				// },

				// onCurrencySelected: function (oEvent) {
				//   var aContexts = oEvent.getParameter("selectedContexts");
				//   if (aContexts.length) {
				//     var oContent = aContexts[0]
				//       .getModel()
				//       .getData(aContexts[0].getPath());
				//     //var idx = this._getActiveElement();
				//     this.getView().byId("Advcr_id").setValue(oContent.Advcr);
				//   }
				// },

				_handleClose: function(oEvent) {
					var oSelectedItem = oEvent.getParameter("selectedItem");
					if (oSelectedItem) {
						this._oODataModel.setProperty("Advcr", "TRY");
						this.getView().byId("Advcr_id").setValue(oSelectedItem.getTitle());
					}
					oEvent.getSource().getBinding("items").filter([]);
				}
			}
		);
	}
);