import { NextRequest, NextResponse } from "next/server";
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      try {
        const { getDocumentProxy } = await import("unpdf");
        const doc = await getDocumentProxy(new Uint8Array(buffer));
        let fullText = "";
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        extractedText = fullText.trim();
      } catch (err: any) {
        console.error("PDF extraction failed:", err);
        Sentry.captureException(err);
        return NextResponse.json(
          { error: `PDF extraction failed: ${err.message}` },
          { status: 500 }
        );
      }
    } else if (fileName.endsWith(".docx")) {
      try {
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (err: any) {
        console.error("DOCX extraction failed:", err);
        Sentry.captureException(err);
        return NextResponse.json(
          { error: `DOCX extraction failed: ${err.message}` },
          { status: 500 }
        );
      }
    } else {
      // Standard Text files or fallback
      extractedText = buffer.toString("utf8") || "";
    }

    if (!extractedText || extractedText.length < 5) {
      return NextResponse.json(
        { error: "No readable text content found in document." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error("❌ Parse Error:", error);
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
