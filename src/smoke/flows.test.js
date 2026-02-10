import test from "node:test";
import assert from "node:assert/strict";
import {
  filterOpenJobs,
  hasDuplicateApplication,
  validateApplicationForm,
  validateBusinessCardForm,
  validateClientForm,
  validateJobForm,
  validateTeamForm,
} from "../lib/flow-guards.js";

test("open positions filter includes only future active operator jobs", () => {
  const now = new Date("2026-02-10T12:00:00Z");
  const jobs = [
    { id: "1", needs_operator: true, status: "pending", start_date: "2026-02-11T12:00:00Z" },
    { id: "2", needs_operator: true, status: "cancelled", start_date: "2026-02-11T12:00:00Z" },
    { id: "3", needs_operator: false, status: "pending", start_date: "2026-02-11T12:00:00Z" },
    { id: "4", needs_operator: true, status: "pending", start_date: "2026-02-09T12:00:00Z" },
  ];

  const filtered = filterOpenJobs(jobs, now);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "1");
});

test("duplicate application guard matches by job and email case-insensitively", () => {
  const applications = [
    { job_id: "job-1", applicant_email: "person@example.com" },
  ];

  assert.equal(hasDuplicateApplication(applications, "job-1", "PERSON@example.com"), true);
  assert.equal(hasDuplicateApplication(applications, "job-2", "PERSON@example.com"), false);
});

test("job validation blocks invalid dates and missing title", () => {
  const missingTitle = validateJobForm({ title: "", start_date: "2026-02-11T10:00" });
  assert.equal(missingTitle.ok, false);

  const invalidRange = validateJobForm({
    title: "Event",
    start_date: "2026-02-11T10:00",
    end_date: "2026-02-10T09:00",
    needs_operator: false,
  });
  assert.equal(invalidRange.ok, false);
});

test("job validation returns normalized payload for create/update flow", () => {
  const validated = validateJobForm({
    title: "  Event A ",
    start_date: "2026-02-11T10:00",
    end_date: "2026-02-11T12:00",
    client_email: "client@example.com",
    needs_operator: true,
    operator_category: "camera_operator",
  });

  assert.equal(validated.ok, true);
  assert.equal(validated.data.title, "Event A");
  assert.ok(validated.data.start_date.includes("T"));
});

test("client and team validators enforce required fields", () => {
  const badClient = validateClientForm({ name: "", email: "x@y.com" });
  assert.equal(badClient.ok, false);

  const badTeam = validateTeamForm({ name: "A", email: "bad-email" });
  assert.equal(badTeam.ok, false);

  const goodTeam = validateTeamForm({ name: " A ", email: "a@example.com" });
  assert.equal(goodTeam.ok, true);
  assert.equal(goodTeam.data.name, "A");
});

test("application and business-card validators reject invalid email/url", () => {
  const badApplication = validateApplicationForm({ name: "User", email: "invalid" });
  assert.equal(badApplication.ok, false);

  const badCard = validateBusinessCardForm({
    name: "Card Owner",
    email: "owner@example.com",
    linkedin_url: "ftp://example.com/user",
  });
  assert.equal(badCard.ok, false);

  const goodCard = validateBusinessCardForm({
    name: " Card Owner ",
    email: "owner@example.com",
    linkedin_url: "https://linkedin.com/in/owner",
  });
  assert.equal(goodCard.ok, true);
  assert.equal(goodCard.data.name, "Card Owner");
});
