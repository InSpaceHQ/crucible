"use client";

import { CreateCompetitionIntegrated } from "~/components/controls/create-competition-integrated";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function CreateCompetitionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Competition</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateCompetitionIntegrated />
      </CardContent>
    </Card>
  );
}
