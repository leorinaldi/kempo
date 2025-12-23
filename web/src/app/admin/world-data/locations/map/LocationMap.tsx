"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Nation {
  id: string
  name: string
  shortCode: string | null
  lat: number
  long: number
  article: { id: string;  } | null
}

interface State {
  id: string
  name: string
  abbreviation: string | null
  lat: number
  long: number
  nation: { name: string }
  article: { id: string;  } | null
}

interface City {
  id: string
  name: string
  cityType: string
  lat: number
  long: number
  state: { name: string; nation: { name: string } }
  article: { id: string;  } | null
}

interface Place {
  id: string
  name: string
  placeType: string
  lat: number
  long: number
  city: { name: string; state: { name: string } }
  article: { id: string;  } | null
}

interface LocationData {
  nations: Nation[]
  states: State[]
  cities: City[]
  places: Place[]
}

interface Filters {
  nations: boolean
  states: boolean
  cities: boolean
  places: boolean
}

// Custom marker icons for each type
const createIcon = (color: string) =>
  new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })

const nationIcon = createIcon("#3b82f6") // blue
const stateIcon = createIcon("#6366f1") // indigo
const cityIcon = createIcon("#06b6d4") // cyan
const placeIcon = createIcon("#10b981") // emerald

// Component to fit bounds to all markers
function FitBounds({ locations, filters }: { locations: LocationData; filters: Filters }) {
  const map = useMap()

  useEffect(() => {
    const allCoords: [number, number][] = []

    if (filters.nations) {
      locations.nations.forEach((n) => allCoords.push([n.lat, n.long]))
    }
    if (filters.states) {
      locations.states.forEach((s) => allCoords.push([s.lat, s.long]))
    }
    if (filters.cities) {
      locations.cities.forEach((c) => allCoords.push([c.lat, c.long]))
    }
    if (filters.places) {
      locations.places.forEach((p) => allCoords.push([p.lat, p.long]))
    }

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, locations, filters])

  return null
}

export default function LocationMap({
  locations,
  filters,
}: {
  locations: LocationData
  filters: Filters
}) {
  return (
    <MapContainer
      center={[39.8, -98.6]}
      zoom={4}
      style={{ height: "600px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds locations={locations} filters={filters} />

      {/* Nations */}
      {filters.nations &&
        locations.nations.map((nation) => (
          <Marker key={`nation-${nation.id}`} position={[nation.lat, nation.long]} icon={nationIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-blue-600">{nation.name}</p>
                {nation.shortCode && <p className="text-gray-500">{nation.shortCode}</p>}
                <p className="text-xs text-gray-400 mt-1">Nation</p>
                {nation.article && (
                  <a
                    href={`/kemponet/kempopedia/wiki/${nation.article.id}`}
                    className="text-blue-500 hover:underline text-xs mt-2 block"
                  >
                    View Kempopedia article
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* States */}
      {filters.states &&
        locations.states.map((state) => (
          <Marker key={`state-${state.id}`} position={[state.lat, state.long]} icon={stateIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-indigo-600">
                  {state.name}
                  {state.abbreviation && ` (${state.abbreviation})`}
                </p>
                <p className="text-gray-500">{state.nation.name}</p>
                <p className="text-xs text-gray-400 mt-1">State</p>
                {state.article && (
                  <a
                    href={`/kemponet/kempopedia/wiki/${state.article.id}`}
                    className="text-indigo-500 hover:underline text-xs mt-2 block"
                  >
                    View Kempopedia article
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Cities */}
      {filters.cities &&
        locations.cities.map((city) => (
          <Marker key={`city-${city.id}`} position={[city.lat, city.long]} icon={cityIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-cyan-600">{city.name}</p>
                <p className="text-gray-500">
                  {city.state.name}, {city.state.nation.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {city.cityType.charAt(0).toUpperCase() + city.cityType.slice(1)}
                </p>
                {city.article && (
                  <a
                    href={`/kemponet/kempopedia/wiki/${city.article.id}`}
                    className="text-cyan-500 hover:underline text-xs mt-2 block"
                  >
                    View Kempopedia article
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Places */}
      {filters.places &&
        locations.places.map((place) => (
          <Marker key={`place-${place.id}`} position={[place.lat, place.long]} icon={placeIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-emerald-600">{place.name}</p>
                <p className="text-gray-500">
                  {place.city.name}, {place.city.state.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {place.placeType.charAt(0).toUpperCase() + place.placeType.slice(1)}
                </p>
                {place.article && (
                  <a
                    href={`/kemponet/kempopedia/wiki/${place.article.id}`}
                    className="text-emerald-500 hover:underline text-xs mt-2 block"
                  >
                    View Kempopedia article
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}
