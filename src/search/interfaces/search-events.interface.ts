interface ISearchEvent {
  id: number;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  language: string;
  address: string;
  location: string;
  placesLeft: number;
}
