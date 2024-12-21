// App related

export type Picklist = {
   createdTime: number;
   title: string;
   teams: {
      teamKey: string;
      comment: string;
      excluded: boolean;
   }[];
};