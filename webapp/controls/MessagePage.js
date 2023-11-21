sap.ui.define([
	"sap/ui/core/Control"
], function(
	Control
) {
	"use strict";

	return Control.extend("com.lesaffre.advance.controls.MessagePage", {

        init: function(){
            var libraryPath = jQuery.sap.getModulePath("com.lesaffre.advance"); //get the server location of the ui library
			jQuery.sap.includeStyleSheet(libraryPath + "/controls/MessagePage.css");
        },

        renderer: function(oRM, oControl){
            oRM.openStart("figure", oControl)
               .class("smod-message-page")
               .openEnd();


            oRM.close("figure");
        }
	});
});