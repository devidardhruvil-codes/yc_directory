"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "./utils";
import slugify from "slugify";
import { writeclient } from "@/sanity/lib/write-client";

export const createPitch = async (
  state: any,
  form: FormData,
  Pitch?: string
) => {
  console.log("Received Pitch in server action:", Pitch);

  //   if (!Pitch || Pitch.trim().length === 0) {
  //     return parseServerActionResponse({
  //       error: "Pitch is required",
  //       status: "ERROR",
  //     });
  //   }

  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { title, description, category, link } = Object.fromEntries(form);

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    const startup = {
      title,
      description,
      category,
      image: link,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: session?.id,
      },
      Pitch: Pitch || " ",
    };

    const result = await writeclient.create({ _type: "startup", ...startup });

    return parseServerActionResponse({ ...result, err: "", status: "SUCCESS" });
  } catch (error) {
    console.log("Error saving Pitch:", error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};
