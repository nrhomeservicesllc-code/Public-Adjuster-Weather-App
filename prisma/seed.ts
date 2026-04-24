import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const FL_CITIES = [
  { name: "Miami", county: "Miami-Dade", lat: 25.7617, lng: -80.1918 },
  { name: "Jacksonville", county: "Duval", lat: 30.3322, lng: -81.6557 },
  { name: "Tampa", county: "Hillsborough", lat: 27.9506, lng: -82.4572 },
  { name: "Orlando", county: "Orange", lat: 28.5383, lng: -81.3792 },
  { name: "St. Petersburg", county: "Pinellas", lat: 27.7676, lng: -82.6403 },
  { name: "Hialeah", county: "Miami-Dade", lat: 25.8576, lng: -80.2781 },
  { name: "Tallahassee", county: "Leon", lat: 30.4518, lng: -84.2807 },
  { name: "Port St. Lucie", county: "St. Lucie", lat: 27.2939, lng: -80.3503 },
  { name: "Cape Coral", county: "Lee", lat: 26.5629, lng: -81.9495 },
  { name: "Fort Lauderdale", county: "Broward", lat: 26.1224, lng: -80.1373 },
  { name: "Pembroke Pines", county: "Broward", lat: 26.0074, lng: -80.2962 },
  { name: "Hollywood", county: "Broward", lat: 26.0112, lng: -80.1495 },
  { name: "Gainesville", county: "Alachua", lat: 29.6516, lng: -82.3248 },
  { name: "Miramar", county: "Broward", lat: 25.9871, lng: -80.3322 },
  { name: "Coral Springs", county: "Broward", lat: 26.2712, lng: -80.2706 },
  { name: "Lakeland", county: "Polk", lat: 28.0395, lng: -81.9498 },
  { name: "West Palm Beach", county: "Palm Beach", lat: 26.7153, lng: -80.0534 },
  { name: "Palm Bay", county: "Brevard", lat: 28.0345, lng: -80.5887 },
  { name: "Clearwater", county: "Pinellas", lat: 27.9659, lng: -82.8001 },
  { name: "Pompano Beach", county: "Broward", lat: 26.2379, lng: -80.1248 },
  { name: "Davie", county: "Broward", lat: 26.0765, lng: -80.2521 },
  { name: "Miami Gardens", county: "Miami-Dade", lat: 25.9420, lng: -80.2456 },
  { name: "Fort Myers", county: "Lee", lat: 26.6406, lng: -81.8723 },
  { name: "Boca Raton", county: "Palm Beach", lat: 26.3683, lng: -80.1289 },
  { name: "Sunrise", county: "Broward", lat: 26.1667, lng: -80.2999 },
  { name: "Deltona", county: "Volusia", lat: 28.9005, lng: -81.2637 },
  { name: "Deerfield Beach", county: "Broward", lat: 26.3184, lng: -80.0998 },
  { name: "Melbourne", county: "Brevard", lat: 28.0836, lng: -80.6081 },
  { name: "Boynton Beach", county: "Palm Beach", lat: 26.5317, lng: -80.0905 },
  { name: "Kendall", county: "Miami-Dade", lat: 25.6751, lng: -80.3162 },
  { name: "Lehigh Acres", county: "Lee", lat: 26.6120, lng: -81.6523 },
  { name: "Kissimmee", county: "Osceola", lat: 28.2919, lng: -81.4076 },
  { name: "Doral", county: "Miami-Dade", lat: 25.8195, lng: -80.3556 },
  { name: "Homestead", county: "Miami-Dade", lat: 25.4687, lng: -80.4776 },
  { name: "Daytona Beach", county: "Volusia", lat: 29.2108, lng: -81.0228 },
  { name: "Sarasota", county: "Sarasota", lat: 27.3364, lng: -82.5307 },
  { name: "Sanford", county: "Seminole", lat: 28.8006, lng: -81.2731 },
  { name: "Bradenton", county: "Manatee", lat: 27.4989, lng: -82.5748 },
  { name: "Spring Hill", county: "Hernando", lat: 28.4728, lng: -82.5193 },
  { name: "Ocala", county: "Marion", lat: 29.1872, lng: -82.1401 },
  { name: "Pensacola", county: "Escambia", lat: 30.4213, lng: -87.2169 },
  { name: "Brandon", county: "Hillsborough", lat: 27.9378, lng: -82.2859 },
  { name: "Riverview", county: "Hillsborough", lat: 27.8661, lng: -82.3287 },
  { name: "Tamarac", county: "Broward", lat: 26.2128, lng: -80.2498 },
  { name: "Plantation", county: "Broward", lat: 26.1267, lng: -80.2331 },
  { name: "Weston", county: "Broward", lat: 26.1003, lng: -80.3998 },
  { name: "Lauderhill", county: "Broward", lat: 26.1665, lng: -80.2135 },
  { name: "Palm Coast", county: "Flagler", lat: 29.5847, lng: -81.2079 },
  { name: "Naples", county: "Collier", lat: 26.1420, lng: -81.7948 },
  { name: "Bonita Springs", county: "Lee", lat: 26.3398, lng: -81.7787 },
  { name: "North Miami", county: "Miami-Dade", lat: 25.8894, lng: -80.1865 },
  { name: "Coconut Creek", county: "Broward", lat: 26.2551, lng: -80.1793 },
  { name: "Apopka", county: "Orange", lat: 28.6936, lng: -81.5325 },
  { name: "North Port", county: "Sarasota", lat: 27.0442, lng: -82.1956 },
  { name: "Fort Pierce", county: "St. Lucie", lat: 27.4467, lng: -80.3256 },
  { name: "Margate", county: "Broward", lat: 26.2468, lng: -80.2062 },
  { name: "Gainesville", county: "Alachua", lat: 29.6516, lng: -82.3248 },
  { name: "Tallahassee", county: "Leon", lat: 30.4518, lng: -84.2807 },
  { name: "Winter Garden", county: "Orange", lat: 28.5653, lng: -81.5862 },
  { name: "Altamonte Springs", county: "Seminole", lat: 28.6611, lng: -81.3659 },
]

const FL_COUNTIES = [
  { name: "Miami-Dade County", county: "Miami-Dade", lat: 25.7617, lng: -80.4 },
  { name: "Broward County", county: "Broward", lat: 26.1224, lng: -80.45 },
  { name: "Palm Beach County", county: "Palm Beach", lat: 26.7, lng: -80.15 },
  { name: "Hillsborough County", county: "Hillsborough", lat: 27.9506, lng: -82.4 },
  { name: "Orange County", county: "Orange", lat: 28.5383, lng: -81.35 },
  { name: "Pinellas County", county: "Pinellas", lat: 27.87, lng: -82.78 },
  { name: "Duval County", county: "Duval", lat: 30.3322, lng: -81.65 },
  { name: "Polk County", county: "Polk", lat: 28.0395, lng: -81.95 },
  { name: "Lee County", county: "Lee", lat: 26.67, lng: -81.87 },
  { name: "Brevard County", county: "Brevard", lat: 28.27, lng: -80.70 },
  { name: "Volusia County", county: "Volusia", lat: 29.0, lng: -81.25 },
  { name: "Sarasota County", county: "Sarasota", lat: 27.2, lng: -82.45 },
  { name: "Manatee County", county: "Manatee", lat: 27.5, lng: -82.6 },
  { name: "Seminole County", county: "Seminole", lat: 28.7, lng: -81.2 },
  { name: "Collier County", county: "Collier", lat: 26.1, lng: -81.5 },
  { name: "Osceola County", county: "Osceola", lat: 28.2, lng: -81.0 },
  { name: "Marion County", county: "Marion", lat: 29.2, lng: -82.1 },
  { name: "St. Lucie County", county: "St. Lucie", lat: 27.4, lng: -80.45 },
  { name: "Leon County", county: "Leon", lat: 30.45, lng: -84.28 },
  { name: "Alachua County", county: "Alachua", lat: 29.65, lng: -82.32 },
  { name: "Escambia County", county: "Escambia", lat: 30.6, lng: -87.34 },
  { name: "Pasco County", county: "Pasco", lat: 28.3, lng: -82.43 },
  { name: "Hernando County", county: "Hernando", lat: 28.5, lng: -82.47 },
  { name: "Lake County", county: "Lake", lat: 28.73, lng: -81.7 },
  { name: "Indian River County", county: "Indian River", lat: 27.7, lng: -80.55 },
]

async function main() {
  console.log("Seeding Florida locations...")

  for (const city of FL_CITIES) {
    await prisma.location.upsert({
      where: { id: `city-${city.name.toLowerCase().replace(/\s+/g, "-")}-fl` },
      create: {
        id: `city-${city.name.toLowerCase().replace(/\s+/g, "-")}-fl`,
        name: city.name,
        displayName: `${city.name}, ${city.county} County, FL`,
        type: "CITY",
        state: "FL",
        county: city.county,
        latitude: city.lat,
        longitude: city.lng,
      },
      update: {},
    })
  }
  console.log(`Seeded ${FL_CITIES.length} cities`)

  for (const county of FL_COUNTIES) {
    await prisma.location.upsert({
      where: { id: `county-${county.name.toLowerCase().replace(/\s+/g, "-")}` },
      create: {
        id: `county-${county.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: county.name,
        displayName: `${county.name}, Florida`,
        type: "COUNTY",
        state: "FL",
        county: county.county,
        latitude: county.lat,
        longitude: county.lng,
      },
      update: {},
    })
  }
  console.log(`Seeded ${FL_COUNTIES.length} counties`)

  console.log("Seed complete!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
