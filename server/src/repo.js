import { runQuery } from "./db.js";
import { queries } from "./queries.js";

/** Flat record from { value: name } style rows. */
const flat = (rows, key) => (rows[0] || {})[key] ?? 0;

export const repo = {
  async stats() {
    const [people, companies, skills, connections, topConnected, topSkills] = await Promise.all([
      runQuery(queries.statsCounts),
      runQuery(queries.statsCompanies),
      runQuery(queries.statsSkills),
      runQuery(queries.statsConnections),
      runQuery(queries.topConnected, { limit: 6 }),
      runQuery(queries.topSkills, { limit: 6 }),
    ]);

    return {
      counts: {
        people: flat(people, "people"),
        companies: flat(companies, "companies"),
        skills: flat(skills, "skills"),
        connections: flat(connections, "connections"),
      },
      topConnected,
      topSkills,
    };
  },

  async listPeople(limit = 200) {
    return runQuery(queries.listPeople, { limit });
  },

  async searchPeople(q, limit = 25) {
    return runQuery(queries.searchPeople, { q, limit });
  },

  async person(id) {
    const profile = await runQuery(queries.personProfile, { id });
    if (profile.length === 0) return null;
    const [skills, history, connections] = await Promise.all([
      runQuery(queries.personSkills, { id }),
      runQuery(queries.personHistory, { id }),
      runQuery(queries.personConnections, { id }),
    ]);

    return {
      ...profile[0],
      skills,
      history,
      connections,
      connectionCount: connections.length,
    };
  },

  async degreesOfSeparation(from, to) {
    const rows = await runQuery(queries.degreesOfSeparation, { from, to });
    return rows[0] || null;
  },

  async introducers(from, to) {
    return runQuery(queries.introducers, { from, to });
  },

  async mutualConnections(from, to) {
    return runQuery(queries.mutualConnections, { from, to });
  },

  async peopleAtCompany(me, companyId, limit = 20) {
    return runQuery(queries.peopleAtCompany, { me, companyId, limit });
  },

  async recommendCandidates(managerId, skills, limit = 12) {
    return runQuery(queries.recommendCandidates, { managerId, skills, limit });
  },

  async listCompanies() {
    return runQuery(queries.listCompanies);
  },

  async company(id) {
    const profile = await runQuery(queries.companyProfile, { id });
    if (profile.length === 0) return null;
    const people = await runQuery(queries.companyPeople, { id });
    return { ...profile[0], people };
  },
};