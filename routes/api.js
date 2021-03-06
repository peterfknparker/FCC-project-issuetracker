"use strict";
const Issue = require("../models/Issue.js");
const mongoose = require("mongoose");

module.exports = function (app, dataBase) {
	app
		.route("/api/projects")

		.get(function (req, res) {
			Issue.find({ ...req.query })
				.distinct("project_name")
				.exec(function (err, issues) {
					if (err) return console.log(err);
					res.json(issues);
				});
		});

	app
		.route("/api/issues/:project")

		.get(function (req, res) {
			let project = req.params.project;

			// 4. You can send a GET request to `/api/issues/{projectname}` for an array of all issues for that specific projectname, with all the fields present for each issue.

			// 5. You can send a GET request to `/api/issues/{projectname}` and filter the request by also passing along any field and value as a URL query `(ie. /api/issues/{project}?open=false)`. You can pass one or more field/value pairs at once.

			Issue.find({ project_name: project, ...req.query })
				.sort({ created_on: -1 })
				.exec(function (err, issues) {
					if (err) return console.log(err);
					res.json(issues);
				});
		})

		.post(function (req, res) {
			let project = req.params.project;

			let {
				issue_title,
				issue_text,
				created_by,
				assigned_to,
				status_text,
				open,
			} = req.body;

			// 1. You can send a POST request to `/api/issues/{projectname}` with form data containing the required fields issue_title, issue_text, created_by, and optionally assigned_to and status_text.

			let newIssue;

			// 3. If you send a POST request to `/api/issues/{projectname}` without the required fields, returned will be the error `{ error: 'required field(s) missing' }`
			if (!issue_title || !issue_text || !created_by || !project) {
				res.json({ error: "required field(s) missing" });
			} else {
				newIssue = new Issue({
					project_name: project,
					issue_title: issue_title,
					issue_text: issue_text,
					created_by: created_by,
					assigned_to: assigned_to,
					open: open,
					status_text: status_text,
				});
				newIssue.save(function (err, issue) {
					// 2. The POST request to `/api/issues/{projectname}` will return the created object, and must include all of the submitted fields. Excluded optional fields will be returned as empty strings. Additionally, include created_on `(date/time)`, updated_on `(date/time)`, open `(boolean, true for open - default value, false for closed)`, and \_id.
					if (err) return console.log(err);
					res.json(issue);
					console.log("New issue saved in database");
				});
			}
		})

		.put(function (req, res) {
			let project = req.params.project;

			let {
				_id,
				issue_title,
				issue_text,
				created_by,
				assigned_to,
				status_text,
				open,
			} = req.body;
			let updatedIssue = {
				updated_on: Date.now(),
				open: open || true,
			};

			if (issue_title) {
				updatedIssue.issue_title = issue_title;
			}
			if (issue_text) {
				updatedIssue.issue_text = issue_text;
			}
			if (created_by) {
				updatedIssue.created_by = created_by;
			}
			if (assigned_to) {
				updatedIssue.assigned_to = assigned_to;
			}
			if (status_text) {
				updatedIssue.status_text = status_text;
			}

			// 7. When the PUT request sent to `/api/issues/{projectname}` does not include an \_id, the return value is `{ error: 'missing _id' }`.

			if (!_id) {
				return res.json({ error: "missing _id" });
			} else if (
				!issue_title &&
				!issue_text &&
				!created_by &&
				!assigned_to &&
				!status_text &&
				!open
			) {
				// 8. When the PUT request sent to `/api/issues/{projectname}` does not include update fields, the return value is `{ error: 'no update field(s) sent', '_id': _id }`. On any other error, the return value is `{ error: 'could not update', '_id': _id }`.

				return res.json({ error: "no update field(s) sent", _id: _id });
			} else {
				Issue.findByIdAndUpdate(
					_id,
					updatedIssue,
					{ new: true },
					function (err, updated) {
						if (!err && updated) {
							return res.json({
								result: "successfully updated",
								_id: _id,
							});
						} else if (!updated) {
							return res.json({ error: "could not update", _id: _id });
						}
						// 6. You can send a PUT request to `/api/issues/{projectname}` with an \_id and one or more fields to update. On success, the updated_on field should be updated, and returned should be `{ result: 'successfully updated', '_id': _id }`.
					}
				);
			}
		})

		// 9. You can send a DELETE request to `/api/issues/{projectname}` with an \_id to delete an issue. If no \_id is sent, the return value is `{ error: 'missing _id' }`. On success, the return value is `{ result: 'successfully deleted', '_id': _id }`. On failure, the return value is `{ error: 'could not delete', '_id': _id }`.
		.delete(function (req, res) {
			let project = req.params.project;
			let { _id } = req.body;
			if (!_id) {
				return res.json({ error: "missing _id" });
			} else {
				Issue.findByIdAndRemove({ _id: _id }, function (err, deleted) {
					if (!err && deleted) {
						return res.json({ result: "successfully deleted", _id: _id });
					} else if (!deleted) {
						return res.json({ error: "could not delete", _id: _id });
					}
				});
			}
		});
};
