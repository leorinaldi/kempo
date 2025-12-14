interface InfoboxProps {
  title: string
  type: string
  image?: {
    url: string
    caption: string
  }
  fields: Record<string, unknown>
}

const fieldLabels: Record<string, string> = {
  full_name: 'Full name',
  birth_date: 'Born',
  birth_place: 'Birthplace',
  death_date: 'Died',
  death_place: 'Place of death',
  nationality: 'Nationality',
  occupation: 'Occupation',
  spouse: 'Spouse',
  children: 'Children',
  known_for: 'Known for',
  official_name: 'Official name',
  founded: 'Founded',
  dissolved: 'Dissolved',
  capital: 'Capital',
  largest_city: 'Largest city',
  government_type: 'Government',
  head_of_state: 'Head of state',
  head_of_government: 'Head of government',
  population: 'Population',
  population_year: 'Population (year)',
  currency: 'Currency',
  official_languages: 'Languages',
  date: 'Date',
  end_date: 'End date',
  location: 'Location',
  participants: 'Participants',
  outcome: 'Outcome',
  casualties: 'Casualties',
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value)
}

export default function Infobox({ title, type, image, fields }: InfoboxProps) {
  return (
    <table className="infobox">
      <tbody>
        <tr>
          <th colSpan={2} className="infobox-header">
            {title}
          </th>
        </tr>

        {image && image.url && (
          <>
            <tr>
              <td colSpan={2} className="infobox-image">
                <img src={image.url} alt={title} />
              </td>
            </tr>
            {image.caption && (
              <tr>
                <td colSpan={2} className="infobox-caption">
                  {image.caption}
                </td>
              </tr>
            )}
          </>
        )}

        {Object.entries(fields).map(([key, value]) => {
          if (value === null || value === undefined || value === '') return null
          return (
            <tr key={key} className="infobox-row">
              <th className="infobox-label">
                {fieldLabels[key] || key.replace(/_/g, ' ')}
              </th>
              <td className="infobox-value">
                {formatValue(value)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
