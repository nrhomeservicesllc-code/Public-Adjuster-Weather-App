/** Static Florida location data — used as instant search fallback with no external dependency */

export interface FLLocation {
  id: string
  name: string
  displayName: string
  type: "CITY" | "COUNTY" | "ZIP"
  state: "FL"
  county: string | null
  zipCode: string | null
  latitude: number
  longitude: number
  boundingBox: null
}

export const FL_CITIES: FLLocation[] = [
  { id: "fl-miami", name: "Miami", displayName: "Miami, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33101", latitude: 25.7617, longitude: -80.1918, boundingBox: null },
  { id: "fl-jacksonville", name: "Jacksonville", displayName: "Jacksonville, Duval County, FL", type: "CITY", state: "FL", county: "Duval", zipCode: "32099", latitude: 30.3322, longitude: -81.6557, boundingBox: null },
  { id: "fl-tampa", name: "Tampa", displayName: "Tampa, Hillsborough County, FL", type: "CITY", state: "FL", county: "Hillsborough", zipCode: "33601", latitude: 27.9506, longitude: -82.4572, boundingBox: null },
  { id: "fl-orlando", name: "Orlando", displayName: "Orlando, Orange County, FL", type: "CITY", state: "FL", county: "Orange", zipCode: "32801", latitude: 28.5383, longitude: -81.3792, boundingBox: null },
  { id: "fl-stpete", name: "St. Petersburg", displayName: "St. Petersburg, Pinellas County, FL", type: "CITY", state: "FL", county: "Pinellas", zipCode: "33701", latitude: 27.7676, longitude: -82.6403, boundingBox: null },
  { id: "fl-hialeah", name: "Hialeah", displayName: "Hialeah, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33010", latitude: 25.8576, longitude: -80.2781, boundingBox: null },
  { id: "fl-tallahassee", name: "Tallahassee", displayName: "Tallahassee, Leon County, FL", type: "CITY", state: "FL", county: "Leon", zipCode: "32301", latitude: 30.4518, longitude: -84.2807, boundingBox: null },
  { id: "fl-fortlauderdale", name: "Fort Lauderdale", displayName: "Fort Lauderdale, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33301", latitude: 26.1224, longitude: -80.1373, boundingBox: null },
  { id: "fl-capecoral", name: "Cape Coral", displayName: "Cape Coral, Lee County, FL", type: "CITY", state: "FL", county: "Lee", zipCode: "33904", latitude: 26.5629, longitude: -81.9495, boundingBox: null },
  { id: "fl-portStLucie", name: "Port St. Lucie", displayName: "Port St. Lucie, St. Lucie County, FL", type: "CITY", state: "FL", county: "St. Lucie", zipCode: "34952", latitude: 27.2930, longitude: -80.3504, boundingBox: null },
  { id: "fl-pembrokepines", name: "Pembroke Pines", displayName: "Pembroke Pines, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33024", latitude: 26.0071, longitude: -80.2963, boundingBox: null },
  { id: "fl-hollywood", name: "Hollywood", displayName: "Hollywood, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33020", latitude: 26.0112, longitude: -80.1495, boundingBox: null },
  { id: "fl-gainesville", name: "Gainesville", displayName: "Gainesville, Alachua County, FL", type: "CITY", state: "FL", county: "Alachua", zipCode: "32601", latitude: 29.6516, longitude: -82.3248, boundingBox: null },
  { id: "fl-miramar", name: "Miramar", displayName: "Miramar, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33023", latitude: 25.9865, longitude: -80.2322, boundingBox: null },
  { id: "fl-coralsprings", name: "Coral Springs", displayName: "Coral Springs, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33065", latitude: 26.2712, longitude: -80.2706, boundingBox: null },
  { id: "fl-westpalmbeach", name: "West Palm Beach", displayName: "West Palm Beach, Palm Beach County, FL", type: "CITY", state: "FL", county: "Palm Beach", zipCode: "33401", latitude: 26.7153, longitude: -80.0534, boundingBox: null },
  { id: "fl-palmbay", name: "Palm Bay", displayName: "Palm Bay, Brevard County, FL", type: "CITY", state: "FL", county: "Brevard", zipCode: "32905", latitude: 28.0344, longitude: -80.5887, boundingBox: null },
  { id: "fl-pompanocbeach", name: "Pompano Beach", displayName: "Pompano Beach, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33060", latitude: 26.2379, longitude: -80.1248, boundingBox: null },
  { id: "fl-clearwater", name: "Clearwater", displayName: "Clearwater, Pinellas County, FL", type: "CITY", state: "FL", county: "Pinellas", zipCode: "33755", latitude: 27.9659, longitude: -82.8001, boundingBox: null },
  { id: "fl-miamigardnes", name: "Miami Gardens", displayName: "Miami Gardens, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33056", latitude: 25.9421, longitude: -80.2456, boundingBox: null },
  { id: "fl-lakeland", name: "Lakeland", displayName: "Lakeland, Polk County, FL", type: "CITY", state: "FL", county: "Polk", zipCode: "33801", latitude: 28.0395, longitude: -81.9498, boundingBox: null },
  { id: "fl-miambeach", name: "Miami Beach", displayName: "Miami Beach, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33139", latitude: 25.7907, longitude: -80.1300, boundingBox: null },
  { id: "fl-bocaraton", name: "Boca Raton", displayName: "Boca Raton, Palm Beach County, FL", type: "CITY", state: "FL", county: "Palm Beach", zipCode: "33431", latitude: 26.3683, longitude: -80.1289, boundingBox: null },
  { id: "fl-fortmyers", name: "Fort Myers", displayName: "Fort Myers, Lee County, FL", type: "CITY", state: "FL", county: "Lee", zipCode: "33901", latitude: 26.6406, longitude: -81.8723, boundingBox: null },
  { id: "fl-deltona", name: "Deltona", displayName: "Deltona, Volusia County, FL", type: "CITY", state: "FL", county: "Volusia", zipCode: "32725", latitude: 28.9006, longitude: -81.2636, boundingBox: null },
  { id: "fl-sarasota", name: "Sarasota", displayName: "Sarasota, Sarasota County, FL", type: "CITY", state: "FL", county: "Sarasota", zipCode: "34230", latitude: 27.3364, longitude: -82.5307, boundingBox: null },
  { id: "fl-kissimmee", name: "Kissimmee", displayName: "Kissimmee, Osceola County, FL", type: "CITY", state: "FL", county: "Osceola", zipCode: "34741", latitude: 28.2919, longitude: -81.4078, boundingBox: null },
  { id: "fl-ocala", name: "Ocala", displayName: "Ocala, Marion County, FL", type: "CITY", state: "FL", county: "Marion", zipCode: "34470", latitude: 29.1872, longitude: -82.1401, boundingBox: null },
  { id: "fl-daytonabeach", name: "Daytona Beach", displayName: "Daytona Beach, Volusia County, FL", type: "CITY", state: "FL", county: "Volusia", zipCode: "32114", latitude: 29.2108, longitude: -81.0228, boundingBox: null },
  { id: "fl-delraybeach", name: "Delray Beach", displayName: "Delray Beach, Palm Beach County, FL", type: "CITY", state: "FL", county: "Palm Beach", zipCode: "33444", latitude: 26.4615, longitude: -80.0728, boundingBox: null },
  { id: "fl-fortpierce", name: "Fort Pierce", displayName: "Fort Pierce, St. Lucie County, FL", type: "CITY", state: "FL", county: "St. Lucie", zipCode: "34950", latitude: 27.4467, longitude: -80.3256, boundingBox: null },
  { id: "fl-keywest", name: "Key West", displayName: "Key West, Monroe County, FL", type: "CITY", state: "FL", county: "Monroe", zipCode: "33040", latitude: 24.5551, longitude: -81.7800, boundingBox: null },
  { id: "fl-pensacola", name: "Pensacola", displayName: "Pensacola, Escambia County, FL", type: "CITY", state: "FL", county: "Escambia", zipCode: "32501", latitude: 30.4213, longitude: -87.2169, boundingBox: null },
  { id: "fl-naples", name: "Naples", displayName: "Naples, Collier County, FL", type: "CITY", state: "FL", county: "Collier", zipCode: "34102", latitude: 26.1420, longitude: -81.7948, boundingBox: null },
  { id: "fl-boyntonbeach", name: "Boynton Beach", displayName: "Boynton Beach, Palm Beach County, FL", type: "CITY", state: "FL", county: "Palm Beach", zipCode: "33425", latitude: 26.5316, longitude: -80.0905, boundingBox: null },
  { id: "fl-homestead", name: "Homestead", displayName: "Homestead, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33030", latitude: 25.4687, longitude: -80.4776, boundingBox: null },
  { id: "fl-northport", name: "North Port", displayName: "North Port, Sarasota County, FL", type: "CITY", state: "FL", county: "Sarasota", zipCode: "34286", latitude: 27.0442, longitude: -82.2359, boundingBox: null },
  { id: "fl-melbourne", name: "Melbourne", displayName: "Melbourne, Brevard County, FL", type: "CITY", state: "FL", county: "Brevard", zipCode: "32901", latitude: 28.0836, longitude: -80.6081, boundingBox: null },
  { id: "fl-largo", name: "Largo", displayName: "Largo, Pinellas County, FL", type: "CITY", state: "FL", county: "Pinellas", zipCode: "33770", latitude: 27.9095, longitude: -82.7873, boundingBox: null },
  { id: "fl-sanford", name: "Sanford", displayName: "Sanford, Seminole County, FL", type: "CITY", state: "FL", county: "Seminole", zipCode: "32771", latitude: 28.8005, longitude: -81.2731, boundingBox: null },
  { id: "fl-leesburg", name: "Leesburg", displayName: "Leesburg, Lake County, FL", type: "CITY", state: "FL", county: "Lake", zipCode: "34748", latitude: 28.8103, longitude: -81.8801, boundingBox: null },
  { id: "fl-doral", name: "Doral", displayName: "Doral, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33166", latitude: 25.8197, longitude: -80.3548, boundingBox: null },
  { id: "fl-plantation", name: "Plantation", displayName: "Plantation, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33317", latitude: 26.1276, longitude: -80.2331, boundingBox: null },
  { id: "fl-sunrise", name: "Sunrise", displayName: "Sunrise, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33322", latitude: 26.1504, longitude: -80.2564, boundingBox: null },
  { id: "fl-weston", name: "Weston", displayName: "Weston, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33326", latitude: 26.1004, longitude: -80.3997, boundingBox: null },
  { id: "fl-palmcoast", name: "Palm Coast", displayName: "Palm Coast, Flagler County, FL", type: "CITY", state: "FL", county: "Flagler", zipCode: "32137", latitude: 29.5847, longitude: -81.2078, boundingBox: null },
  { id: "fl-margate", name: "Margate", displayName: "Margate, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33063", latitude: 26.2467, longitude: -80.2064, boundingBox: null },
  { id: "fl-davie", name: "Davie", displayName: "Davie, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33314", latitude: 26.0765, longitude: -80.2521, boundingBox: null },
  { id: "fl-tamarac", name: "Tamarac", displayName: "Tamarac, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33321", latitude: 26.2128, longitude: -80.2495, boundingBox: null },
  { id: "fl-deerfieldbeach", name: "Deerfield Beach", displayName: "Deerfield Beach, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33441", latitude: 26.3184, longitude: -80.1000, boundingBox: null },
  { id: "fl-portorange", name: "Port Orange", displayName: "Port Orange, Volusia County, FL", type: "CITY", state: "FL", county: "Volusia", zipCode: "32127", latitude: 29.1211, longitude: -81.0087, boundingBox: null },
  { id: "fl-punta-gorda", name: "Punta Gorda", displayName: "Punta Gorda, Charlotte County, FL", type: "CITY", state: "FL", county: "Charlotte", zipCode: "33950", latitude: 26.9298, longitude: -82.0451, boundingBox: null },
  { id: "fl-apopka", name: "Apopka", displayName: "Apopka, Orange County, FL", type: "CITY", state: "FL", county: "Orange", zipCode: "32703", latitude: 28.6936, longitude: -81.5323, boundingBox: null },
  { id: "fl-titusville", name: "Titusville", displayName: "Titusville, Brevard County, FL", type: "CITY", state: "FL", county: "Brevard", zipCode: "32780", latitude: 28.6122, longitude: -80.8076, boundingBox: null },
  { id: "fl-winterhaven", name: "Winter Haven", displayName: "Winter Haven, Polk County, FL", type: "CITY", state: "FL", county: "Polk", zipCode: "33880", latitude: 28.0222, longitude: -81.7329, boundingBox: null },
  { id: "fl-ocoee", name: "Ocoee", displayName: "Ocoee, Orange County, FL", type: "CITY", state: "FL", county: "Orange", zipCode: "34761", latitude: 28.5686, longitude: -81.5431, boundingBox: null },
  { id: "fl-bradenton", name: "Bradenton", displayName: "Bradenton, Manatee County, FL", type: "CITY", state: "FL", county: "Manatee", zipCode: "34205", latitude: 27.4989, longitude: -82.5748, boundingBox: null },
  { id: "fl-palmbeach", name: "Palm Beach", displayName: "Palm Beach, Palm Beach County, FL", type: "CITY", state: "FL", county: "Palm Beach", zipCode: "33480", latitude: 26.7065, longitude: -80.0362, boundingBox: null },
  { id: "fl-lauderhill", name: "Lauderhill", displayName: "Lauderhill, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33313", latitude: 26.1362, longitude: -80.2136, boundingBox: null },
  { id: "fl-coconutcreek", name: "Coconut Creek", displayName: "Coconut Creek, Broward County, FL", type: "CITY", state: "FL", county: "Broward", zipCode: "33073", latitude: 26.2517, longitude: -80.1789, boundingBox: null },
  { id: "fl-keysbiscayne", name: "Key Biscayne", displayName: "Key Biscayne, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33149", latitude: 25.6944, longitude: -80.1628, boundingBox: null },
  { id: "fl-coralg", name: "Coral Gables", displayName: "Coral Gables, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33134", latitude: 25.7215, longitude: -80.2684, boundingBox: null },
  { id: "fl-aventura", name: "Aventura", displayName: "Aventura, Miami-Dade County, FL", type: "CITY", state: "FL", county: "Miami-Dade", zipCode: "33160", latitude: 25.9565, longitude: -80.1393, boundingBox: null },
]

export const FL_COUNTIES: FLLocation[] = [
  { id: "co-miami-dade", name: "Miami-Dade County", displayName: "Miami-Dade County, FL", type: "COUNTY", state: "FL", county: "Miami-Dade", zipCode: null, latitude: 25.5584, longitude: -80.4582, boundingBox: null },
  { id: "co-broward", name: "Broward County", displayName: "Broward County, FL", type: "COUNTY", state: "FL", county: "Broward", zipCode: null, latitude: 26.1224, longitude: -80.4139, boundingBox: null },
  { id: "co-palm-beach", name: "Palm Beach County", displayName: "Palm Beach County, FL", type: "COUNTY", state: "FL", county: "Palm Beach", zipCode: null, latitude: 26.6515, longitude: -80.3200, boundingBox: null },
  { id: "co-hillsborough", name: "Hillsborough County", displayName: "Hillsborough County, FL", type: "COUNTY", state: "FL", county: "Hillsborough", zipCode: null, latitude: 27.9944, longitude: -82.4572, boundingBox: null },
  { id: "co-orange", name: "Orange County", displayName: "Orange County, FL", type: "COUNTY", state: "FL", county: "Orange", zipCode: null, latitude: 28.5383, longitude: -81.3792, boundingBox: null },
  { id: "co-pinellas", name: "Pinellas County", displayName: "Pinellas County, FL", type: "COUNTY", state: "FL", county: "Pinellas", zipCode: null, latitude: 27.8770, longitude: -82.7932, boundingBox: null },
  { id: "co-duval", name: "Duval County", displayName: "Duval County, FL", type: "COUNTY", state: "FL", county: "Duval", zipCode: null, latitude: 30.3322, longitude: -81.6557, boundingBox: null },
  { id: "co-lee", name: "Lee County", displayName: "Lee County, FL", type: "COUNTY", state: "FL", county: "Lee", zipCode: null, latitude: 26.5629, longitude: -81.9495, boundingBox: null },
  { id: "co-polk", name: "Polk County", displayName: "Polk County, FL", type: "COUNTY", state: "FL", county: "Polk", zipCode: null, latitude: 27.8967, longitude: -81.8429, boundingBox: null },
  { id: "co-brevard", name: "Brevard County", displayName: "Brevard County, FL", type: "COUNTY", state: "FL", county: "Brevard", zipCode: null, latitude: 28.2696, longitude: -80.7237, boundingBox: null },
  { id: "co-volusia", name: "Volusia County", displayName: "Volusia County, FL", type: "COUNTY", state: "FL", county: "Volusia", zipCode: null, latitude: 29.0700, longitude: -81.0637, boundingBox: null },
  { id: "co-seminole", name: "Seminole County", displayName: "Seminole County, FL", type: "COUNTY", state: "FL", county: "Seminole", zipCode: null, latitude: 28.7000, longitude: -81.2280, boundingBox: null },
  { id: "co-pasco", name: "Pasco County", displayName: "Pasco County, FL", type: "COUNTY", state: "FL", county: "Pasco", zipCode: null, latitude: 28.2316, longitude: -82.4311, boundingBox: null },
  { id: "co-collier", name: "Collier County", displayName: "Collier County, FL", type: "COUNTY", state: "FL", county: "Collier", zipCode: null, latitude: 26.1224, longitude: -81.4003, boundingBox: null },
  { id: "co-sarasota", name: "Sarasota County", displayName: "Sarasota County, FL", type: "COUNTY", state: "FL", county: "Sarasota", zipCode: null, latitude: 27.1895, longitude: -82.4426, boundingBox: null },
  { id: "co-manatee", name: "Manatee County", displayName: "Manatee County, FL", type: "COUNTY", state: "FL", county: "Manatee", zipCode: null, latitude: 27.4798, longitude: -82.3452, boundingBox: null },
  { id: "co-stjohns", name: "St. Johns County", displayName: "St. Johns County, FL", type: "COUNTY", state: "FL", county: "St. Johns", zipCode: null, latitude: 29.9215, longitude: -81.3978, boundingBox: null },
  { id: "co-marion", name: "Marion County", displayName: "Marion County, FL", type: "COUNTY", state: "FL", county: "Marion", zipCode: null, latitude: 29.2086, longitude: -82.0553, boundingBox: null },
  { id: "co-alachua", name: "Alachua County", displayName: "Alachua County, FL", type: "COUNTY", state: "FL", county: "Alachua", zipCode: null, latitude: 29.6519, longitude: -82.3248, boundingBox: null },
  { id: "co-stlucie", name: "St. Lucie County", displayName: "St. Lucie County, FL", type: "COUNTY", state: "FL", county: "St. Lucie", zipCode: null, latitude: 27.3831, longitude: -80.3456, boundingBox: null },
  { id: "co-indianriver", name: "Indian River County", displayName: "Indian River County, FL", type: "COUNTY", state: "FL", county: "Indian River", zipCode: null, latitude: 27.5617, longitude: -80.5122, boundingBox: null },
  { id: "co-osceola", name: "Osceola County", displayName: "Osceola County, FL", type: "COUNTY", state: "FL", county: "Osceola", zipCode: null, latitude: 28.0688, longitude: -81.2731, boundingBox: null },
  { id: "co-lake", name: "Lake County", displayName: "Lake County, FL", type: "COUNTY", state: "FL", county: "Lake", zipCode: null, latitude: 28.8103, longitude: -81.8801, boundingBox: null },
  { id: "co-charlotte", name: "Charlotte County", displayName: "Charlotte County, FL", type: "COUNTY", state: "FL", county: "Charlotte", zipCode: null, latitude: 26.9900, longitude: -82.0580, boundingBox: null },
  { id: "co-hernando", name: "Hernando County", displayName: "Hernando County, FL", type: "COUNTY", state: "FL", county: "Hernando", zipCode: null, latitude: 28.5552, longitude: -82.4677, boundingBox: null },
  { id: "co-escambia", name: "Escambia County", displayName: "Escambia County, FL", type: "COUNTY", state: "FL", county: "Escambia", zipCode: null, latitude: 30.5227, longitude: -87.3403, boundingBox: null },
  { id: "co-leon", name: "Leon County", displayName: "Leon County, FL", type: "COUNTY", state: "FL", county: "Leon", zipCode: null, latitude: 30.4381, longitude: -84.2807, boundingBox: null },
  { id: "co-okaloosa", name: "Okaloosa County", displayName: "Okaloosa County, FL", type: "COUNTY", state: "FL", county: "Okaloosa", zipCode: null, latitude: 30.5227, longitude: -86.4747, boundingBox: null },
  { id: "co-bay", name: "Bay County", displayName: "Bay County (Panama City), FL", type: "COUNTY", state: "FL", county: "Bay", zipCode: null, latitude: 30.3322, longitude: -85.6606, boundingBox: null },
  { id: "co-flagler", name: "Flagler County", displayName: "Flagler County, FL", type: "COUNTY", state: "FL", county: "Flagler", zipCode: null, latitude: 29.4719, longitude: -81.2078, boundingBox: null },
  { id: "co-columbia", name: "Columbia County", displayName: "Columbia County, FL", type: "COUNTY", state: "FL", county: "Columbia", zipCode: null, latitude: 30.2330, longitude: -82.6199, boundingBox: null },
  { id: "co-sumter", name: "Sumter County", displayName: "Sumter County, FL", type: "COUNTY", state: "FL", county: "Sumter", zipCode: null, latitude: 28.7006, longitude: -82.0796, boundingBox: null },
  { id: "co-citrus", name: "Citrus County", displayName: "Citrus County, FL", type: "COUNTY", state: "FL", county: "Citrus", zipCode: null, latitude: 28.8369, longitude: -82.3318, boundingBox: null },
  { id: "co-putnam", name: "Putnam County", displayName: "Putnam County, FL", type: "COUNTY", state: "FL", county: "Putnam", zipCode: null, latitude: 29.6486, longitude: -81.6376, boundingBox: null },
  { id: "co-highlands", name: "Highlands County", displayName: "Highlands County, FL", type: "COUNTY", state: "FL", county: "Highlands", zipCode: null, latitude: 27.3436, longitude: -81.3401, boundingBox: null },
  { id: "co-hardee", name: "Hardee County", displayName: "Hardee County, FL", type: "COUNTY", state: "FL", county: "Hardee", zipCode: null, latitude: 27.5008, longitude: -81.8073, boundingBox: null },
  { id: "co-monroe", name: "Monroe County", displayName: "Monroe County (Florida Keys), FL", type: "COUNTY", state: "FL", county: "Monroe", zipCode: null, latitude: 24.9121, longitude: -81.0124, boundingBox: null },
  { id: "co-nassau", name: "Nassau County", displayName: "Nassau County, FL", type: "COUNTY", state: "FL", county: "Nassau", zipCode: null, latitude: 30.6111, longitude: -81.7704, boundingBox: null },
  { id: "co-baker", name: "Baker County", displayName: "Baker County, FL", type: "COUNTY", state: "FL", county: "Baker", zipCode: null, latitude: 30.3302, longitude: -82.2936, boundingBox: null },
  { id: "co-clay", name: "Clay County", displayName: "Clay County, FL", type: "COUNTY", state: "FL", county: "Clay", zipCode: null, latitude: 29.9924, longitude: -81.7940, boundingBox: null },
]

const ALL_LOCATIONS = [...FL_CITIES, ...FL_COUNTIES]

export function searchFLLocations(q: string, limit = 8): FLLocation[] {
  const query = q.toLowerCase().trim()
  if (!query || query.length < 2) return []

  const scored = ALL_LOCATIONS
    .map((loc) => {
      const name = loc.name.toLowerCase()
      const county = (loc.county ?? "").toLowerCase()
      const zip = loc.zipCode ?? ""

      let score = 0
      if (name === query) score = 100
      else if (name.startsWith(query)) score = 80
      else if (name.includes(query)) score = 60
      else if (county.includes(query)) score = 40
      else if (zip.startsWith(query)) score = 90
      else return null

      return { loc, score }
    })
    .filter((x): x is { loc: FLLocation; score: number } => x !== null)

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.loc)
}
