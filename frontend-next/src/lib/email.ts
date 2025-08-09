import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type OrderEmailParams = {
  to: string | string[]
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: OrderEmailParams) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    console.warn('Email not sent: RESEND_API_KEY or FROM_EMAIL is missing')
    return
  }
  await resend.emails.send({
    from: process.env.FROM_EMAIL as string,
    to,
    subject,
    html,
  })
}

export function buildOrderEmailHtml(args: {
  orderId: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  shippingAddress?: string | null
  phone?: string | null
  email: string
}) {
  const { orderId, total, items, shippingAddress, phone, email } = args
  const itemsHtml = items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${it.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">x${it.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">₮${it.price}</td>
      </tr>
    `,
    )
    .join('')

  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
    <h2>Захиалгын баталгаажуулалт</h2>
    <p>Захиалга: <strong>${orderId}</strong></p>
    <table style="width:100%;border-collapse:collapse">${itemsHtml}</table>
    <p style="margin-top:12px">Нийт: <strong>₮${total}</strong></p>
    ${shippingAddress ? `<p>Хаяг: ${shippingAddress}</p>` : ''}
    ${phone ? `<p>Утас: ${phone}</p>` : ''}
    <p>Имэйл: ${email}</p>
  </div>
  `
}


