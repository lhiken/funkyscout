import { fetchNexusData } from "./fetch";

interface NexusEvent {
   eventKey: string;
   dataAsOfTime: number;
   nowQueuing: string;
   matches: NexusMatch[];
   announcements: NexusAnnouncement[];
   partsRequests: NexusPartRequest[];
}

interface NexusMatch {
   label: string;
   status: "On field" | "On deck" | "Now queuing" | "Queuing soon";
   redTeams: string[];
   blueTeams: string[];
   times: {
      estimatedQueueTime: number;
      estimatedOnDeckTime: number;
      estimatedOnFieldTime: number;
      estimatedStartTime: number;
      actualQueueTime: number;
      actualOnDeckTime: number;
      actualOnFieldTime: number;
   };
}

interface NexusAnnouncement {
   id: string;
   announcement: string;
   postedTime: number;
}

interface NexusPartRequest {
   id: string;
   parts: string;
   postedTime: number;
   requestedByTeam: string;
}

async function getNexusEventStatus(event: string) {
   const eventData: NexusEvent = await fetchNexusData(
      `/event/${event}`,
      "GET",
   );

   if (!eventData) {
      return false;
   }

   return eventData;
}

export { getNexusEventStatus };
export type { NexusAnnouncement, NexusEvent, NexusMatch, NexusPartRequest };
