"use client";

import { ScheduleIntegrated } from "~/components/controls/schedule-integrated";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function SchedulePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleIntegrated />
      </CardContent>
    </Card>
  );
}
