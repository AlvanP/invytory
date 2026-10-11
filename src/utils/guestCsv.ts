import type { Guest } from '@/types'

export interface CsvGuestRow {
  guest: Guest
  /** Shown in the "Ceremony" column; leave empty for a single ceremony export. */
  ceremony?: string
}

const HEADERS_WITH_CEREMONY = ['Ceremony', 'Name', 'Attendance', 'Number of guests', 'Phone', 'Message', 'Response date']

/**
 * One cell, made safe for spreadsheets:
 * - a cell that starts with = + - @ could run as a formula when opened in
 *   Excel (guests type these fields themselves), so it gets a leading apostrophe;
 *   plain phone numbers such as "+234 803 123 4567" are left alone;
 * - quotes, commas and line breaks are wrapped and escaped the standard way.
 */
export function csvCell(value: string | number | undefined | null): string {
  let text = value === undefined || value === null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text) && !/^[+-]?[\d\s()-]+$/.test(text)) {
    text = `'${text}`
  }
  if (/[",\r\n]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const statusWord: Record<Guest['status'], string> = {
  confirmed: 'Attending',
  declined: 'Declined',
  pending: 'Pending',
}

export function guestsToCsv(rows: CsvGuestRow[], includeCeremony: boolean): string {
  const headers = includeCeremony ? HEADERS_WITH_CEREMONY : HEADERS_WITH_CEREMONY.slice(1)
  const lines = [headers.map(csvCell).join(',')]
  for (const { guest: g, ceremony } of rows) {
    const cells = [
      ...(includeCeremony ? [ceremony ?? ''] : []),
      g.fullName,
      statusWord[g.status],
      g.status === 'confirmed' ? g.numberOfGuests : 0,
      g.phone ?? '',
      g.message ?? '',
      g.responseDate ? g.responseDate.slice(0, 10) : '',
    ]
    lines.push(cells.map(csvCell).join(','))
  }
  // Excel needs the byte-order mark to show accented names correctly.
  return `﻿${lines.join('\r\n')}\r\n`
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function safeFilename(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'guests'
}