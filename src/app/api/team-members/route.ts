import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(teamMembers);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
