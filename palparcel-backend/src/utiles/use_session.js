const httpContext = require("express-http-context");

let payload = {};

/**
 *
 * @description A function that helps get user session
 * @function useSession
 * @returns SessionReturnType
 */

const getSession = () => {
  const session = httpContext.get("session") || {};
  return { ...session, ...payload };
};

const setSession = (record) => {
  const session = getSession();
  const updatedSession = { ...session, ...record };
  httpContext.set("session", updatedSession);
  payload = { ...payload, ...record }; // Update payload with new session data
  return updatedSession;
};

module.exports = {
  getSession,
  setSession,
};
