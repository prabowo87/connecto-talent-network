/**
 * All Cypher in one place. Every query is parameterised — no string
 * concatenation — and uses only standard openCypher (as spoken by CognoDB).
 */

export const queries = {
  // --- Overview ----------------------------------------------------------
  statsCounts: `
    MATCH (p:Person)
    RETURN count(p) AS people
  `,
  statsCompanies: `
    MATCH (c:Company)
    RETURN count(c) AS companies
  `,
  statsSkills: `
    MATCH (s:Skill)
    RETURN count(s) AS skills
  `,
  statsConnections: `
    MATCH ()-[k:KNOWS]->()
    RETURN count(k) AS connections
  `,
  topConnected: `
    MATCH (p:Person)-[k:KNOWS]-()
    RETURN p.id AS id, p.name AS name, p.title AS title,
           count(DISTINCT k) AS connections
    ORDER BY connections DESC
    LIMIT $limit
  `,
  topSkills: `
    MATCH (p:Person)-[hs:HAS_SKILL]->(s:Skill)
    RETURN s.name AS skill, count(DISTINCT p) AS peopleWithSkill
    ORDER BY peopleWithSkill DESC
    LIMIT $limit
  `,

  // --- People ------------------------------------------------------------
  listPeople: `
    MATCH (p:Person)
    OPTIONAL MATCH (c:Company)<-[:WORKS_AT]-(p)
    RETURN p.id AS id, p.name AS name, p.title AS title, p.location AS location,
           c.name AS company
    ORDER BY p.name
    LIMIT $limit
  `,
  searchPeople: `
    MATCH (p:Person)
    WHERE toLower(p.name) CONTAINS toLower($q)
       OR toLower(p.title) CONTAINS toLower($q)
       OR toLower(p.location) CONTAINS toLower($q)
    OPTIONAL MATCH (p)-[:WORKS_AT]->(c:Company)
    RETURN p.id AS id, p.name AS name, p.title AS title, p.location AS location,
           c.name AS company
    ORDER BY p.name
    LIMIT $limit
  `,

  personProfile: `
    MATCH (p:Person {id: $id})
    OPTIONAL MATCH (p)-[:WORKS_AT]->(c:Company)
    RETURN p.id AS id, p.name AS name, p.title AS title, p.email AS email,
           p.location AS location, p.summary AS summary,
           p.yearsExperience AS yearsExperience, p.avatarColor AS avatarColor,
           c.id AS companyId, c.name AS company
  `,
  personSkills: `
    MATCH (p:Person {id: $id})-[hs:HAS_SKILL]->(s:Skill)
    RETURN s.name AS skill, hs.proficiency AS proficiency
    ORDER BY proficiency DESC
  `,
  personHistory: `
    MATCH (p:Person {id: $id})-[w:WORKED_AT]->(c:Company)
    RETURN c.id AS companyId, c.name AS company, w.role AS role,
           w.from AS from, w.to AS to
    ORDER BY w.to DESC
  `,
  personConnections: `
    MATCH (p:Person {id: $id})-[k:KNOWS]->(f:Person)
    OPTIONAL MATCH (f)-[:WORKS_AT]->(fc:Company)
    RETURN f.id AS id, f.name AS name, f.title AS title, fc.name AS company,
           k.strength AS strength
    ORDER BY k.strength DESC, f.name
  `,
  mutualConnections: `
    MATCH (a:Person {id: $from})-[:KNOWS]-(m:Person)-[:KNOWS]-(b:Person {id: $to})
    WHERE m <> a AND m <> b
    OPTIONAL MATCH (m)-[:WORKS_AT]->(mc:Company)
    RETURN DISTINCT m.id AS id, m.name AS name, m.title AS title, mc.name AS company
    ORDER BY m.name
  `,

  // --- Paths / introductions (the graph earns its place here) ------------
  degreesOfSeparation: `
    MATCH (a:Person {id: $from})
    MATCH (b:Person {id: $to})
    WHERE a <> b
    MATCH p = shortestPath((a)-[:KNOWS*..6]-(b))
    RETURN length(p) AS degrees,
           [n IN nodes(p) | {id: n.id, name: n.name, title: n.title,
                             avatarColor: n.avatarColor}] AS path
  `,
  introducers: `
    MATCH (me:Person {id: $from}), (target:Person {id: $to})
    WHERE me <> target
    // Two hops: me -> mutual -> target (KNOWS is connected undirected).
    // A relational join does this with a pair of self-joins on a friendship
    // table; here it is a single graph pattern.
    MATCH (me)-[k1:KNOWS]-(mutual:Person)-[k2:KNOWS]-(target)
    WHERE mutual <> me AND mutual <> target
    OPTIONAL MATCH (mutual)-[:WORKS_AT]->(mc:Company)
    RETURN DISTINCT mutual.id AS id, mutual.name AS name, mutual.title AS title,
           mc.name AS company, k1.strength AS strengthToMe,
           k2.strength AS strengthToTarget
    ORDER BY (k1.strength + k2.strength) DESC, mutual.name
  `,
  peopleAtCompany: `
    MATCH (me:Person {id: $me}), (co:Company {id: $companyId})
    MATCH (p:Person)-[:WORKS_AT]->(co)
    WHERE p <> me
    MATCH path = shortestPath((me)-[:KNOWS*..4]-(p))
    WITH p, min(length(path)) AS hops, collect(DISTINCT path) AS paths
    OPTIONAL MATCH (p)-[:WORKS_AT]->(c)
    RETURN p.id AS id, p.name AS name, p.title AS title, c.name AS company,
           hops,
           [n IN nodes(head(paths))[1..] | n.name] AS route
    ORDER BY hops ASC, p.name
    LIMIT $limit
  `,

  // --- Recommendations (multi-hop + skill match in one pattern) ----------
  recommendCandidates: `
    MATCH (hm:Person {id: $managerId})
    MATCH (c:Person)-[hs:HAS_SKILL]->(s:Skill)
    WHERE s.name IN $skills AND c <> hm
    WITH c, hm, collect(DISTINCT s.name) AS has, count(DISTINCT hs) AS matchedSkills
    OPTIONAL MATCH path = shortestPath((c)-[:KNOWS*..4]-(hm))
    WITH c, has, matchedSkills, collect(DISTINCT path) AS paths
    OPTIONAL MATCH (c)-[:WORKS_AT]->(cc)
    RETURN c.id AS id, c.name AS name, c.title AS title, c.location AS location,
           cc.name AS company, matchedSkills, has,
           CASE WHEN size(paths) = 0 THEN null ELSE length(head(paths)) END AS hops,
           CASE WHEN size(paths) = 0 THEN [] ELSE
             [n IN nodes(head(paths)) | {id: n.id, name: n.name}] END AS route
    ORDER BY matchedSkills DESC,
             CASE WHEN hops IS NULL THEN 1 ELSE 0 END ASC,
             hops ASC, c.name
    LIMIT $limit
  `,

  // --- Companies ---------------------------------------------------------
  listCompanies: `
    MATCH (c:Company)
    OPTIONAL MATCH (:Person)-[w:WORKS_AT]->(c)
    WITH c, count(w) AS employees
    OPTIONAL MATCH (:Person)-[wh:WORKED_AT]->(c)
    RETURN c.id AS id, c.name AS name, c.industry AS industry,
           c.location AS location, employees, count(DISTINCT wh) AS alumni
    ORDER BY employees DESC, c.name
  `,
  companyProfile: `
    MATCH (c:Company {id: $id})
    OPTIONAL MATCH (p:Person)-[:WORKED_AT]->(c)
    OPTIONAL MATCH (p2:Person)-[:WORKS_AT]->(c)
    RETURN c.id AS id, c.name AS name, c.industry AS industry,
           c.location AS location, c.about AS about,
           count(DISTINCT p) AS alumni, count(DISTINCT p2) AS currentEmployees
  `,
  companyPeople: `
    MATCH (p:Person)-[:WORKS_AT]->(c:Company {id: $id})
    RETURN p.id AS id, p.name AS name, p.title AS title
    ORDER BY p.name
  `,
};