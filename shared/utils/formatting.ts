function toDateOrNull(dateLike?: string | number | Date | null) {
  if (!dateLike) {
    return null
  }

  const parsed = dateLike instanceof Date
    ? dateLike
    : new Date(dateLike)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

const shortDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

const monthDayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric'
})

export function formatShortDate(dateLike?: string | number | Date | null, fallback = 'Pending') {
  const parsed = toDateOrNull(dateLike)
  return parsed ? shortDateFormatter.format(parsed) : fallback
}

export function formatShortDateOrNull(dateLike?: string | number | Date | null) {
  const parsed = toDateOrNull(dateLike)
  return parsed ? shortDateFormatter.format(parsed) : null
}

export function formatShortDateTime(dateLike?: string | number | Date | null, fallback = 'Just now') {
  const parsed = toDateOrNull(dateLike)
  return parsed ? shortDateTimeFormatter.format(parsed) : fallback
}

export function formatMonthDay(dateLike?: string | number | Date | null, fallback = 'Now') {
  const parsed = toDateOrNull(dateLike)
  return parsed ? monthDayFormatter.format(parsed) : fallback
}

export function formatFileSize(value?: number | null, fallback = 'Unknown size') {
  if (!value) {
    return fallback
  }

  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}
