import { NextRequest, NextResponse } from "next/server";
import translate from "translate";

translate.engine = "google";

const cache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (cache.has(text)) {
      return NextResponse.json({
        translated: cache.get(text),
        cached: true,
      });
    }

    const translated = await translate(text, {
      from: "en",
      to: "vi",
    });

    cache.set(text, translated);

    return NextResponse.json({
      translated,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}