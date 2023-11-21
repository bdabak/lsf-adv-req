jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 AdvanceSet in the list
// * All 3 AdvanceSet have at least one AvansToDetayNav

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/lesaffre/advance/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/lesaffre/advance/test/integration/pages/App",
	"com/lesaffre/advance/test/integration/pages/Browser",
	"com/lesaffre/advance/test/integration/pages/Master",
	"com/lesaffre/advance/test/integration/pages/Detail",
	"com/lesaffre/advance/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.lesaffre.advance.view."
	});

	sap.ui.require([
		"com/lesaffre/advance/test/integration/MasterJourney",
		"com/lesaffre/advance/test/integration/NavigationJourney",
		"com/lesaffre/advance/test/integration/NotFoundJourney",
		"com/lesaffre/advance/test/integration/BusyJourney",
		"com/lesaffre/advance/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});