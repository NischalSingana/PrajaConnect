import { db } from '../db/index';
import { issues, users } from '../db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  console.log('--- DATABASE DIAGNOSTICS ---');
  try {
    const allIssues = await db.select().from(issues).orderBy(desc(issues.createdAt));
    console.log(`Total Issues: ${allIssues.length}`);
    allIssues.forEach(iss => {
      console.log(`- [${iss.id}] ${iss.title} | Category: ${iss.category} | Reporter: ${iss.reporterId}`);
    });

    const allUsers = await db.select().from(users);
    console.log(`Total Users: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`- [${u.id}] ${u.name} (${u.email})`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

main();
