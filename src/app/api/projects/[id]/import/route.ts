import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/db";
import yaml from "js-yaml";
import { NodeStatus, NodeType } from "@prisma/client";

interface YamlNode {
  id: string;
  type: string;
  title: string;
  description: string;
  purpose: string;
  order: number;
  parentId: string | null;
  n_pages: number;
  should_split: boolean;
}

interface YamlProject {
  project: {
    id: string;
    name: string;
    nodes: YamlNode[];
  };
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = context.params;
    const projectId = params.id;
    const data = await request.text();
    const parsed = yaml.load(data) as YamlProject;

    if (!parsed.project || !parsed.project.nodes) {
      return NextResponse.json(
        { error: "Invalid YAML structure" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.node.deleteMany({
        where: { projectId }
      });

      const nodes = parsed.project.nodes;
      for (const node of nodes) {
        await tx.node.create({
          data: {
            id: node.id,
            type: node.type.toLowerCase() as NodeType,
            title: node.title,
            description: node.description,
            purpose: node.purpose,
            order: node.order,
            parentId: node.parentId,
            projectId: projectId,
            n_pages: node.n_pages,
            should_split: node.should_split,
            status: NodeStatus.draft,
            metadata: {},
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error importing YAML:", error);
    return NextResponse.json(
      { error: "Failed to import YAML" },
      { status: 500 }
    );
  }
}