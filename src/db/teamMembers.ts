import { db } from './index.ts';
import { teamMembers } from './schema.ts';
import { eq } from 'drizzle-orm';
import { TeamMember } from '../types.ts';

export async function getTeamMembers() {
  try {
    return await db.select().from(teamMembers);
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to fetch team members", { cause: error });
  }
}

export async function getTeamMember(id: string) {
  try {
    const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return result[0];
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to fetch team member", { cause: error });
  }
}

export async function upsertTeamMember(data: any) {
  try {
    const { createdAt, ...updateData } = data;
    const insertData = { ...updateData };
    if (createdAt) {
      insertData.createdAt = new Date(createdAt);
    }

    const result = await db.insert(teamMembers)
      .values(insertData)
      .onConflictDoUpdate({
        target: teamMembers.id,
        set: updateData,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to save team member", { cause: error });
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to delete team member", { cause: error });
  }
}
