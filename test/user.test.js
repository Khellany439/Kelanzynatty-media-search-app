/**
 * API ENDPOINT TEST SUITE
 * VERIFIES USER REGISTRATION FUNCTIONALITY AND ERROR HANDLING
 * 
 * TEST STRATEGY:
 * - HAPPY PATH TESTING FOR SUCCESSFUL REGISTRATION
 * - ERROR CASE TESTING FOR DUPLICATE USERS
 * - INPUT VALIDATION TESTING
 * - RESPONSE STRUCTURE VALIDATION
 * 
 * DEPENDENCIES:
 * - SUPEREST: HTTP ASSERTION LIBRARY
 * - JEST: TESTING FRAMEWORK
 * - TEST DATABASE: SEPARATE DB INSTANCE FOR TESTING
 */

const request = require("supertest");
const app = require("../src/server");
const db = require("../src/db");

// TEST USER CREDENTIALS
const TEST_USER = {
  username: `testuser_${Date.now()}@example.com`, // UNIQUE USERNAME
  password: "ValidPass123!"
};

beforeAll(async () => {
  // ENSURE CLEAN TEST ENVIRONMENT
  await db.query("DELETE FROM users WHERE username LIKE $1", ['testuser_%']);
});

afterAll(async () => {
  // CLEANUP TEST DATA
  await db.query("DELETE FROM users WHERE username LIKE $1", ['testuser_%']);
  await db.pool.end(); // CLOSE DB CONNECTION
});

describe("USER REGISTRATION ENDPOINT", () => {
  describe("POST /api/register", () => {
    it("SHOULD SUCCESSFULLY REGISTER NEW USER WITH VALID CREDENTIALS", async () => {
      const res = await request(app)
        .post("/api/register")
        .send(TEST_USER);

      // STATUS CODE VALIDATION
      expect(res.status).toBe(201); // 201 CREATED PROTOCOL

      // RESPONSE BODY VALIDATION
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("username", TEST_USER.username);
      
      // SECURITY CHECKS
      expect(res.body).not.toHaveProperty("password"); // NO PASSWORD LEAKAGE
    });

    it("SHOULD REJECT DUPLICATE USER REGISTRATION", async () => {
      // FIRST REGISTRATION (SUCCESS)
      await request(app).post("/api/register").send(TEST_USER);
      
      // SECOND REGISTRATION (FAILURE)
      const res = await request(app)
        .post("/api/register")
        .send(TEST_USER);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error", "USERNAME ALREADY EXISTS");
    });

    it("SHOULD REJECT INVALID CREDENTIAL FORMATS", async () => {
      const testCases = [
        { username: "", password: "ValidPass123!" }, // EMPTY USERNAME
        { username: "invalid-email", password: "ValidPass123!" }, // INVALID EMAIL
        { username: TEST_USER.username, password: "short" }, // SHORT PASSWORD
        { password: "MissingUsername123!" }, // MISSING USERNAME
      ];

      for (const payload of testCases) {
        const res = await request(app)
          .post("/api/register")
          .send(payload);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      }
    });
  });
});
