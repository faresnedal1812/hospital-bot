// In-Memory session store
// Map<userId, {step: String, data: Object, department: Department, currentMetricIndex: Number}>

const sessions = new Map();

const getSession = (userId) => sessions.get(userId);

const createSession = (userId, department) => {
  sessions.set(userId, {
    step: "START",
    department: department,
    data: {},
    currentMetricIndex: 0,
  });

  return sessions.get(userId);
};

const clearSession = (userId) => sessions.delete(userId);

const updateSession = (userId, updates) => {
  const session = sessions.get(userId);
  if (session) {
    Object.assign(session, updates);
  }
  return session;
};

module.exports = {
  getSession,
  createSession,
  clearSession,
  updateSession,
};
