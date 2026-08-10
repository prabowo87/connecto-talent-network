import { getDriver, closeDriver } from "./db.js";
import { people, companies, skillsList } from "./data/seed-data.js";

/**
 * Loads realistic seed data into the graph database.
 *
 * Everything uses MERGE so the script is idempotent — run it as many times as
 * you like; it will update properties but never duplicate nodes or edges.
 */

const MERGE_COMPANY = `
  MERGE (c:Company {id: $id})
  ON CREATE SET c.name = $name, c.industry = $industry, c.location = $location
  ON MATCH SET c.name = $name, c.industry = $industry, c.location = $location
`;

const MERGE_SKILL = `
  MERGE (s:Skill {name: $name})
  ON CREATE SET s.category = $category
  ON MATCH SET s.category = $category
`;

const MERGE_PERSON = `
  MERGE (p:Person {id: $id})
  ON CREATE SET p.name = $name, p.title = $title, p.email = $email,
                p.location = $location, p.yearsExperience = $yearsExperience,
                p.summary = $summary, p.avatarColor = $avatarColor
  ON MATCH SET p.name = $name, p.title = $title, p.email = $email,
               p.location = $location, p.yearsExperience = $yearsExperience,
               p.summary = $summary, p.avatarColor = $avatarColor
`;

const MERGE_WORKS_AT = `
  MATCH (p:Person {id: $personId})
  MATCH (c:Company {id: $companyId})
  MERGE (p)-[w:WORKS_AT]->(c)
  ON CREATE SET w.role = $role
  ON MATCH SET w.role = $role
`;

const MERGE_WORKED_AT = `
  MATCH (p:Person {id: $personId})
  MATCH (c:Company {id: $companyId})
  MERGE (p)-[w:WORKED_AT]->(c)
  ON CREATE SET w.role = $role, w.from = $from, w.to = $to
  ON MATCH SET w.role = $role, w.from = $from, w.to = $to
`;

const MERGE_HAS_SKILL = `
  MATCH (p:Person {id: $personId})
  MATCH (s:Skill {name: $skillName})
  MERGE (p)-[hs:HAS_SKILL]->(s)
  ON CREATE SET hs.proficiency = $proficiency
  ON MATCH SET hs.proficiency = $proficiency
`;

const MERGE_KNOWS = `
  MATCH (a:Person {id: $fromId})
  MATCH (b:Person {id: $toId})
  MERGE (a)-[k:KNOWS]->(b)
  ON CREATE SET k.strength = $strength
  ON MATCH SET k.strength = $strength
`;

async function seed() {
  const driver = getDriver();

  const run = async (query, params) => {
    const session = driver.session();
    try {
      await session.run(query, params);
    } finally {
      await session.close();
    }
  };

  // 1. Companies
  for (const c of companies) await run(MERGE_COMPANY, c);

  // 2. Skills
  for (const s of skillsList) await run(MERGE_SKILL, s);

  // 3. People
  for (const p of people) {
    await run(MERGE_PERSON, {
      id: p.id, name: p.name, title: p.title, email: p.email,
      location: p.location, yearsExperience: p.yearsExperience,
      summary: p.summary, avatarColor: p.avatarColor,
    });
  }

  // 4. Relationships
  let relationships = 0;
  for (const p of people) {
    if (p.companyId) {
      await run(MERGE_WORKS_AT, { personId: p.id, companyId: p.companyId, role: p.role });
      relationships++;
    }
    for (const h of p.history) {
      await run(MERGE_WORKED_AT, { personId: p.id, companyId: h.companyId, role: h.role, from: h.from, to: h.to });
      relationships++;
    }
    for (const s of p.skills) {
      await run(MERGE_HAS_SKILL, { personId: p.id, skillName: s.name, proficiency: s.proficiency });
      relationships++;
    }
    for (const k of p.knows) {
      await run(MERGE_KNOWS, { fromId: p.id, toId: k.id, strength: k.strength });
      relationships++;
    }
  }

  const verify = driver.session();
  try {
    const result = await verify.run(`
      MATCH (p:Person)
      OPTIONAL MATCH (p)-[k:KNOWS]-()
      OPTIONAL MATCH (p)-[:WORKS_AT]->(c)
      RETURN count(DISTINCT p) AS people,
             count(DISTINCT k) AS knows,
             count(DISTINCT c) AS companies
    `);
    const counts = result.records[0];
    console.log("Seed complete.");
    console.table({
      people: counts.get("people").toNumber(),
      "KNOWS edges": counts.get("knows").toNumber(),
      "companies headed": counts.get("companies").toNumber(),
    });
    console.log(`Loaded ${relationships} relationship statements.`);
  } finally {
    await verify.close();
  }

  await closeDriver();
}

seed().catch((err) => {
  console.error("Seed failed.\n");
  console.error(err);
  process.exit(1);
});