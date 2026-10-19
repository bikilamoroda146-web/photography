import { readStored, writeStored, createDemoId } from './demoStorage'

const INQUIRIES_KEY = 'sami_demo_inquiries_v1'
export const INQUIRY_STATUSES = ['New', 'In Progress', 'Resolved']

const validInquiries = (value) => Array.isArray(value) && value.every((item) => item
  && typeof item.id === 'string' && typeof item.reference === 'string'
  && typeof item.name === 'string' && typeof item.email === 'string'
  && typeof item.service === 'string' && typeof item.message === 'string'
  && typeof item.submittedAt === 'string' && INQUIRY_STATUSES.includes(item.status))

export function getInquiries() {
  return readStored(INQUIRIES_KEY, [], validInquiries)
    .slice().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export function createInquiry(fields) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)
    || ['name', 'email', 'service', 'message'].some((key) => typeof fields[key] !== 'string' || !fields[key].trim())) {
    throw new Error('Complete your name, email, service and message before submitting.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) throw new Error('Enter a valid email address.')
  const id = createDemoId('inquiry')
  const inquiry = {
    id,
    reference: `INQ-${new Date().getFullYear()}-${id.slice(-6).toUpperCase()}`,
    name: fields.name.trim(),
    email: fields.email.trim().toLowerCase(),
    phone: fields.phone?.trim() || '',
    service: fields.service.trim(),
    preferredDate: fields.date?.trim() || '',
    message: fields.message.trim(),
    submittedAt: new Date().toISOString(),
    status: 'New',
  }
  writeStored(INQUIRIES_KEY, [inquiry, ...getInquiries()])
  return inquiry
}

export function updateInquiryStatus(inquiryId, status) {
  if (!INQUIRY_STATUSES.includes(status)) throw new Error('Choose a valid inquiry status.')
  const inquiries = getInquiries()
  if (!inquiries.some((inquiry) => inquiry.id === inquiryId)) throw new Error('This inquiry could not be found.')
  writeStored(INQUIRIES_KEY, inquiries.map((inquiry) => inquiry.id === inquiryId ? { ...inquiry, status } : inquiry))
}
