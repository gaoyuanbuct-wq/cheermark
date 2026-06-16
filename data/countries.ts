import type { Country } from "@/types/cheermark";

export const countries: Country[] = [
  { id: "brazil",      name: "Brazil",      code: "BRA", colors: ["#009C3B", "#FFDF00", "#002776"], mascot: "a cheerful jaguar" },
  { id: "germany",     name: "Germany",     code: "GER", colors: ["#000000", "#DD0000", "#FFCE00"], mascot: "a proud black eagle" },
  { id: "france",      name: "France",      code: "FRA", colors: ["#002395", "#FFFFFF", "#ED2939"], mascot: "a spirited rooster" },
  { id: "england",     name: "England",     code: "ENG", colors: ["#FFFFFF", "#CE1124"],            mascot: "a majestic lion" },
  { id: "spain",       name: "Spain",       code: "ESP", colors: ["#AA151B", "#F1BF00"],            mascot: "a bold bull" },
  { id: "argentina",   name: "Argentina",   code: "ARG", colors: ["#74ACDF", "#FFFFFF"],            mascot: "a leaping puma" },
  { id: "italy",       name: "Italy",       code: "ITA", colors: ["#009246", "#FFFFFF", "#CE2B37"], mascot: "a fierce azzurri wolf" },
  { id: "portugal",    name: "Portugal",    code: "POR", colors: ["#006600", "#FF0000"],            mascot: "an Iberian wolf" },
  { id: "netherlands", name: "Netherlands", code: "NED", colors: ["#AE1C28", "#FFFFFF", "#21468B"], mascot: "an orange lion" },
  { id: "usa",         name: "USA",         code: "USA", colors: ["#B22234", "#FFFFFF", "#3C3B6E"], mascot: "a bald eagle" },
  { id: "mexico",      name: "Mexico",      code: "MEX", colors: ["#006847", "#FFFFFF", "#CE1126"], mascot: "a golden eagle" },
  { id: "japan",       name: "Japan",       code: "JPN", colors: ["#FFFFFF", "#BC002D"],            mascot: "a samurai crane" },
  { id: "south-korea", name: "South Korea", code: "KOR", colors: ["#FFFFFF", "#CD2E3A"],            mascot: "a tiger" },
  { id: "australia",   name: "Australia",   code: "AUS", colors: ["#00008B", "#FFFFFF", "#FF0000"], mascot: "a kangaroo" },
  { id: "morocco",     name: "Morocco",     code: "MAR", colors: ["#C1272D", "#006233"],            mascot: "an Atlas lion" },
  { id: "senegal",     name: "Senegal",     code: "SEN", colors: ["#00853F", "#FDEF42", "#E31B23"], mascot: "a teranga lion" },
  { id: "nigeria",     name: "Nigeria",     code: "NGA", colors: ["#008751", "#FFFFFF"],            mascot: "a super eagle" },
  { id: "croatia",     name: "Croatia",     code: "CRO", colors: ["#FF0000", "#FFFFFF", "#171796"], mascot: "a checkered knight" },
  { id: "belgium",     name: "Belgium",     code: "BEL", colors: ["#000000", "#FFD90C", "#EF3340"], mascot: "a red devil" },
  { id: "switzerland", name: "Switzerland", code: "SUI", colors: ["#FF0000", "#FFFFFF"],            mascot: "a Swiss ibex" },
];

export function getCountry(id: string): Country | undefined {
  return countries.find((c) => c.id === id);
}
