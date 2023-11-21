/*global location */
sap.ui.define([
	"com/lesaffre/advance/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/lesaffre/advance/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	'sap/m/Dialog',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, formatter, MessageBox, MessageToast, Dialog, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.lesaffre.advance.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				RqastList: [],
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
					// objid: null,
					// linkVisible: false
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			//Get for usage
			this._oODataModel = this.getOwnerComponent().getModel();

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function(oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getView().getModel("detailView").setProperty("/objid", sObjectId);

			this.getView().getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("AdvanceSet", {
					Reqid: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
			this._getRqast();
		},

		_getRqast: function() {
			var that = this;
			var oModel = this.getModel();
			var aFilters = [new Filter("Vhtyp", FilterOperator.EQ, "RQAST", "")];
			oModel.read("/ValueHelpSet", {
				filters: aFilters,
				success: function(oData) {
					that.getModel("detailView").setProperty("/RqastList", oData.results);
				},
				error: function(oError) {
					sap.m.MessageToast.show(oError.toString());
				}
			});
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					expand: 'WfStepSet'
				},
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Reqid,
				sObjectName = oObject.Advtx,
				// sObjectAdvty = oObject.Advty,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			// if (sObjectAdvty === 'TI') {
			// 	oViewModel.setProperty("/linkVisible", true);
			// }else{
			// 	oViewModel.setProperty("/linkVisible", false);
			// }
		},

		_onMetadataLoaded: function() {
			// // Store original busy indicator delay for the detail view
			// var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
			// 	oViewModel = this.getModel("detailView"),
			// 	oLineItemTable = this.byId("lineItemsList");
			// 	// iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// // Make sure busy indicator is displayed immediately when
			// // detail view is displayed for the first time
			// oViewModel.setProperty("/delay", 0);
			// oViewModel.setProperty("/lineItemTableDelay", 0);

			// // oLineItemTable.attachEventOnce("updateFinished", function () {
			// // 	// Restore original busy indicator delay for line item table
			// // 	oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			// // });

			// // Binding the view will set it to not busy - so the view is always busy if it is not bound
			// oViewModel.setProperty("/busy", true);
			// // Restore original busy indicator delay for the detail view
			// oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		onDelete: function() {
			var oViewModel = this.getModel("detailView");
			var that = this;
			var RqastList = oViewModel.getProperty("/RqastList");
			var Rqast = this.getView().byId("Rqast").getText();
			var Reqid = this.getView().byId("Reqid").getText();
			var oValRqast;
			RqastList.forEach(function(item) {
				if (item.Vhval === Rqast) {
					Rqast = item.Vhkey;
				}
			});
			oViewModel.setProperty("/busy", true);

			var doDelete = function() {
				if (Rqast === '01') {
					oViewModel.setProperty("/busy", true);
					var mParameters = {
						"Reqid": Reqid,
						"Rqast": Rqast
					};

					var sServiceURL = "/sap/opu/odata/sap/ZHCM_UX_ADVANCE_SRV/";
					var oModelCurr = new sap.ui.model.odata.ODataModel(sServiceURL);
					//var oModelView = new sap.ui.model.json.JSONModel();

					oModelCurr.callFunction("/batchDelete", {
						method: "GET",
						urlParameters: mParameters,

						//async: true,
						success: function(oData) {
							if (oData) {
								/*	oModelView.setData({
										APR: oData.results
									});*/
								oValRqast = oData.results[0];
								if (oValRqast.Rqast === "99") {
									//var oViewModel = this.getModel("detailView");
									oViewModel.setProperty("/delay", 2);
									oViewModel.setProperty("/busy", false);
									that._oODataModel.refresh();
									MessageToast.show("Silme işlemi gerçekleşti");
								} else if (oValRqast.Rqast === "98") {
									oViewModel.setProperty("/busy", false);
									MessageToast.show("Talep reddedildiği veye onaylandığı için silme işlemi gerçekleşmedi");
								}
							}
							//////////////////////////
						},
						error: function(oError) {
							sap.m.MessageToast.show("Silme işlemi başarısız");
							//		reject(M);
							that.getView().setBusy(false);
						}
					});
				} else if (Rqast === "04") {
					sap.m.MessageToast.show("İptal edilmiş talepleri silemezsiniz.");
					oViewModel.setProperty("/busy", false);
				} else {
					sap.m.MessageToast.show("Onaylanmış/reddedilmiş talepleri silemezsiniz.");
					oViewModel.setProperty("/busy", false);
				}
			};

			var oDeleteDialog = new sap.m.Dialog({
				title: "Silme Onayı",
				type: "Message",
				state: "Warning",
				content: new sap.m.VBox({
					items: [
						new sap.m.Text({
							text: "Bu işlem sonucunda talep silinecektir."
						}).addStyleClass("sapUiTinyMarginBottom"),
						new sap.m.Text({
							text: "Devam etmek istiyor musunuz?"
						})
					]
				}),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Reject,
					text: "Sil",
					press: function() {
						doDelete();
						oDeleteDialog.close();
						oViewModel.setProperty("/busy", false);
					}
				}),
				endButton: new sap.m.Button({
					text: "İptal",
					press: function() {
						oDeleteDialog.close();
						oViewModel.setProperty("/busy", false);
					}
				}),
				afterClose: function() {
					oDeleteDialog.destroy();
				}
			});

			oDeleteDialog.open();

		}
	});

});