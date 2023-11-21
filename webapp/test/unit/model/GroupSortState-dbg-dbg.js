sap.ui.define([
		"com/lesaffre/advance/model/GroupSortState",
		"sap/ui/model/json/JSONModel"
	], function (GroupSortState, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping and sorting", {
		beforeEach: function () {
			this.oModel = new JSONModel({});
			// System under test
			this.oGroupSortState = new GroupSortState(this.oModel, function() {});
		}
	});

	QUnit.test("Should always return a sorter when sorting", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.sort("Advam").length, 1, "The sorting by Advam returned a sorter");
		assert.strictEqual(this.oGroupSortState.sort("Advtx").length, 1, "The sorting by Advtx returned a sorter");
	});

	QUnit.test("Should return a grouper when grouping", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.group("Advam").length, 1, "The group by Advam returned a sorter");
		assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
	});


	QUnit.test("Should set the sorting to Advam if the user groupes by Advam", function (assert) {
		// Act + Assert
		this.oGroupSortState.group("Advam");
		assert.strictEqual(this.oModel.getProperty("/sortBy"), "Advam", "The sorting is the same as the grouping");
	});

	QUnit.test("Should set the grouping to None if the user sorts by Advtx and there was a grouping before", function (assert) {
		// Arrange
		this.oModel.setProperty("/groupBy", "Advam");

		this.oGroupSortState.sort("Advtx");

		// Assert
		assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
	});
});