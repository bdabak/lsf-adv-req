jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"com/lesaffre/advance/test/integration/NavigationJourneyPhone",
		"com/lesaffre/advance/test/integration/NotFoundJourneyPhone",
		"com/lesaffre/advance/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});