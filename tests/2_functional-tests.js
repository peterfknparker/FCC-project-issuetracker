const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
	var firstIssueId;
	/////////////////////////////////////////////////////////////////////////
	//CREATE AN ISSUE
	/////////////////////////////////////////////////////////////////////////
	suite("Create an issue", function () {
		test("1. Create an issue with every field: POST request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.post("/api/issues/functionaltests")
				.send({
					project_name: "functionaltests",
					issue_title: "Test 1",
					issue_text: "Create an issue with every field",
					created_by: "Mocha-Chai",
					assigned_to: "Admin",
					status_text: "Generated by system",
				})
				.end(function (err, res) {
					// console.log("herewego", res);
					// assert.equal(res.status, 200, "response status should be 200");

					assert.equal(res.type, "application/json", "json");
					assert.equal(res.body.project_name, "functionaltests");
					assert.equal(res.body.issue_title, "Test 1");
					assert.equal(res.body.issue_text, "Create an issue with every field");
					assert.equal(res.body.created_by, "Mocha-Chai");
					assert.equal(res.body.assigned_to, "Admin");
					assert.equal(res.body.status_text, "Generated by system");
					firstIssueId = res.body._id;
					done();
				});
		});

		test("2. Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.post("/api/issues/functionaltests")
				.send({
					project_name: "functionaltests",
					issue_title: "Test 2",
					issue_text: "Create an issue with only required fields",
					created_by: "Mocha-Chai",
				})
				.end(function (err, res) {
					// assert.equal(res.status, 200, "response status should be 200");
					project_2_id = res.body._id;
					assert.equal(res.type, "application/json", "json");
					assert.equal(res.body.project_name, "functionaltests");
					assert.equal(res.body.issue_title, "Test 2");
					assert.equal(
						res.body.issue_text,
						"Create an issue with only required fields"
					);
					assert.equal(res.body.created_by, "Mocha-Chai");
					assert.equal(res.body.assigned_to, "");
					assert.equal(res.body.status_text, "");
				});
			done();
		});

		test("3. Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.post("/api/issues/functionaltests")
				.send({
					created_by: "Mocha-Chai",
					assigned_to: "Admin",
					status_text: "Generated by system",
				})
				.end(function (err, res) {
					// assert.equal(res.status, 200, "response status should be 200");
					assert.equal(res.type, "application/json", "json");
					assert.equal(res.body.error, "required field(s) missing");
				});
			done();
		});
	});
	/////////////////////////////////////////////////////////////////////////
	//VIEW ISSUES ON A PROJECT
	/////////////////////////////////////////////////////////////////////////
	suite("View issues on a project", function () {
		test("4. View issues on a project: GET request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.get("/api/issues/functionaltests")
				.end(function (err, res) {
					assert.containsAllKeys(res.body[0], [
						"_id",
						"project_name",
						"issue_title",
						"issue_text",
						"created_by",
						"status_text",
						"assigned_to",
						"created_on",
						"updated_on",
						"open",
					]);
				});
			done();
		});

		test("5. View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.get("/api/issues/functionaltests?assigned_to=Admin")
				.end(function (err, res) {
					assert.containsAllKeys(res.body[0], [
						"_id",
						"project_name",
						"issue_title",
						"issue_text",
						"created_by",
						"status_text",
						"assigned_to",
						"created_on",
						"updated_on",
						"open",
					]);
				});
			done();
		});

		test("6. View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.get(
					"/api/issues/functionaltests?assigned_to=Admin&created_by=Mocha-Chai"
				)
				.end(function (err, res) {
					assert.containsAllKeys(res.body[0], [
						"_id",
						"project_name",
						"issue_title",
						"issue_text",
						"created_by",
						"status_text",
						"assigned_to",
						"created_on",
						"updated_on",
						"open",
					]);
				});
			done();
		});
	});

	/////////////////////////////////////////////////////////////////////////
	//UPDATE AN ISSUE
	/////////////////////////////////////////////////////////////////////////
	suite("Update an issue", function () {
		test("7. Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.put("/api/issues/functionaltests")
				.send({
					_id: firstIssueId,
					status_text: "Updated by system",
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.deepEqual(res.body, {
						result: "successfully updated",
						_id: firstIssueId,
					});
				});
			done();
		});

		test("8. Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.put("/api/issues/functionaltests")
				.send({
					_id: firstIssueId,
					assigned_to: "Anonymous",
					status_text: "Updated by system",
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.deepEqual(res.body, {
						result: "successfully updated",
						_id: firstIssueId,
					});
				});
			done();
		});

		test("9. Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.put("/api/issues/functionaltests")
				.send({
					assigned_to: "Anonymous",
					status_text: "Updated by system",
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.equal(res.body.error, "missing _id");
				});
			done();
		});

		test("10. Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.put("/api/issues/functionaltests")
				.send({
					_id: firstIssueId,
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.equal(res.body.error, "no update field(s) sent");
				});
			done();
		});

		test("11. Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.put("/api/issues/functionaltests")
				.send({
					_id: "foobar",
					assigned_to: "Anonymous",
					status_text: "Updated by system",
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.equal(res.body.error, "could not update");
					assert.equal(res.body._id, "foobar");
				});
			done();
		});
	});
	/////////////////////////////////////////////////////////////////////////
	//DELETE AN ISSUE
	/////////////////////////////////////////////////////////////////////////
	suite("Delete an issue", function () {
		test("12. Delete an issue: DELETE request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.delete("/api/issues/functionaltests")
				.send({
					_id: firstIssueId,
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.deepEqual(res.body, {
						result: "successfully deleted",
						_id: firstIssueId,
					});
				});
			done();
		});

		test("13. Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.delete("/api/issues/functionaltests")
				.send({
					_id: "foobar",
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.deepEqual(res.body, {
						error: "could not delete",
						_id: "foobar",
					});
				});
			done();
		});

		test("14. Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
			chai
				.request(server)
				.delete("/api/issues/functionaltests")
				.send({
					_id: "",
				})
				.end(function (err, res) {
					assert.equal(res.type, "application/json", "json");
					assert.deepEqual(res.body, { error: "missing _id" });
				});
			done();
		});
	});
});
