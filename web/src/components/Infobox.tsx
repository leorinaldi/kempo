import Link from 'next/link'
import React from 'react'
import { slugify } from '@/lib/articles'

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
  political_party: 'Political party',
  spouse: 'Spouse',
  children: 'Children',
  known_for: 'Known for',
  education: 'Education',
  military_service: 'Military service',
  rank: 'Rank',
  official_name: 'Official name',
  abbreviation: 'Abbreviation',
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
  type: 'Type',
  country: 'Country',
  state: 'State',
  region: 'Region',
  ideology: 'Ideology',
  color: 'Color',
  established: 'Established',
}

// Check if a wikilink target is a date
function isDateLink(target: string): boolean {
  return /\d+\s*k\.y\./.test(target)
}

// Convert k.y. date to timeline page and anchor
function dateToTimelineLink(dateStr: string): { page: string; anchor: string } {
  const months: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  }

  // Match patterns like "March 15, 1945 k.y." or "1945 k.y." or "June 1962 k.y."
  const fullDateMatch = dateStr.match(/(\w+)\s+(\d+),?\s+(\d+)\s*k\.y\./)
  const monthYearMatch = dateStr.match(/(\w+)\s+(\d+)\s*k\.y\./)
  const yearOnlyMatch = dateStr.match(/^(\d+)\s*k\.y\./)

  let year: string
  let anchor: string

  if (fullDateMatch) {
    const [, month, day, yearStr] = fullDateMatch
    year = yearStr
    const monthNum = months[month.toLowerCase()] || '01'
    anchor = `${year}-${monthNum}-${day.padStart(2, '0')}-ky`
  } else if (monthYearMatch && !fullDateMatch) {
    const [, month, yearStr] = monthYearMatch
    year = yearStr
    const monthNum = months[month.toLowerCase()] || '01'
    anchor = `${year}-${monthNum}-ky`
  } else if (yearOnlyMatch) {
    year = yearOnlyMatch[1]
    anchor = `${year}-ky`
  } else {
    return { page: 'master-timeline', anchor: dateStr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
  }

  const yearNum = parseInt(year, 10)

  // Pre-1950: link to decade page
  // 1950+: link to year page
  if (yearNum < 1950) {
    const decade = Math.floor(yearNum / 10) * 10
    return { page: `${decade}s k.y.`, anchor }
  } else {
    return { page: `${year} k.y.`, anchor }
  }
}

// Parse wikilink syntax [[Title|Display Name]] or [[Name]] into link components
function parseWikilinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const target = match[1]
    const display = match[2] || match[1]

    // Check if this is a date link (contains k.y.)
    if (isDateLink(target)) {
      const { page, anchor } = dateToTimelineLink(target)
      const slug = slugify(page)
      parts.push(
        <Link key={match.index} href={`/kemponet/kempopedia/wiki/${slug}#${anchor}`} className="wikilink wikilink-date">
          {display}
        </Link>
      )
    } else {
      // Handle anchors: [[page#anchor|Display]]
      const [pagePart, anchorPart] = target.split('#')
      const slug = slugify(pagePart.trim())
      const href = anchorPart
        ? `/kemponet/kempopedia/wiki/${slug}#${anchorPart}`
        : `/kemponet/kempopedia/wiki/${slug}`
      parts.push(
        <Link key={match.index} href={href} className="wikilink">
          {display}
        </Link>
      )
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function formatValue(value: unknown): React.ReactNode {
  if (Array.isArray(value)) {
    return value.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && ', '}
        {typeof item === 'string' ? parseWikilinks(item) : String(item)}
      </React.Fragment>
    ))
  }
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  if (typeof value === 'string') {
    return parseWikilinks(value)
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
                <a href={image.url} target="_blank" rel="noopener noreferrer">
                  <img src={image.url} alt={title} />
                </a>
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
