"use client";

import { createFlagsmithInstance } from "flagsmith";
import { FlagsmithProvider as FlagsmithProviderOG } from "flagsmith/react";
import type { ReactNode } from "react";

const environmentID = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
const api = process.env.NEXT_PUBLIC_FLAGSMITH_API;

if (!environmentID)
  throw new Error("Missing NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID");
if (!api) throw new Error("Missing NEXT_PUBLIC_FLAGSMITH_API");

const flagsmith = createFlagsmithInstance();

export function FlagsmithProvider({ children }: { children: ReactNode }) {
  return (
    <FlagsmithProviderOG flagsmith={flagsmith} options={{ environmentID, api }}>
      {children}
    </FlagsmithProviderOG>
  );
}
