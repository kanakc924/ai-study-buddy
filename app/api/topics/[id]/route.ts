import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Topic from "../../../../models/Topic";
import { withAuth, AuthenticatedRequest } from "../../../../lib/middleware";

async function updateTopic(req: AuthenticatedRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = req.user.id;
    const { id } = await context.params;
    const body = await req.json();

    const topic = await Topic.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!topic) {
      return NextResponse.json(
        { success: false, error: { message: "Topic not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: topic });
  } catch (error: any) {
    console.error("Update Topic Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

async function deleteTopic(req: AuthenticatedRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = req.user.id;
    const { id } = await context.params;

    const topic = await Topic.findOneAndDelete({ _id: id, userId });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: { message: "Topic not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    console.error("Delete Topic Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

async function getTopic(req: AuthenticatedRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = req.user.id;
    const { id } = await context.params;

    const topic = await Topic.findOne({ _id: id, userId }).populate("subjectId");

    if (!topic) {
      return NextResponse.json(
        { success: false, error: { message: "Topic not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: topic });
  } catch (error: any) {
    console.error("Get Topic Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getTopic);
export const PUT = withAuth(updateTopic);
export const DELETE = withAuth(deleteTopic);
