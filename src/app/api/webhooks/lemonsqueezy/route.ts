import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import prisma from '@/lib/prisma'

// Verify Lemon Squeezy webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return digest === signature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || ''
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ''

    // Verify HMAC signature
    if (secret && !verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventName = event.meta?.event_name
    const customData = event.meta?.custom_data || {}
    const clinicSlug = customData.clinic_slug
    const attrs = event.data?.attributes || {}

    console.log(`[LemonSqueezy Webhook] Event: ${eventName}, Clinic: ${clinicSlug}`)

    if (!clinicSlug) {
      return NextResponse.json({ error: 'Missing clinic_slug in custom_data' }, { status: 400 })
    }

    switch (eventName) {
      case 'subscription_created': {
        const plan = mapVariantToPlan(attrs.variant_id)
        await prisma.clinic.update({
          where: { slug: clinicSlug },
          data: {
            lsSubscriptionId: String(event.data.id),
            lsCustomerId: String(attrs.customer_id),
            subscriptionStatus: attrs.status === 'on_trial' ? 'trialing' : 'active',
            plan: plan,
            trialEndsAt: attrs.trial_ends_at ? new Date(attrs.trial_ends_at) : null,
            currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
          },
        })
        break
      }

      case 'subscription_updated': {
        const plan = mapVariantToPlan(attrs.variant_id)
        await prisma.clinic.update({
          where: { slug: clinicSlug },
          data: {
            subscriptionStatus: mapLsStatus(attrs.status),
            plan: plan,
            currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
          },
        })
        break
      }

      case 'subscription_cancelled': {
        await prisma.clinic.update({
          where: { slug: clinicSlug },
          data: {
            subscriptionStatus: 'cancelled',
          },
        })
        break
      }

      case 'subscription_payment_success': {
        await prisma.clinic.update({
          where: { slug: clinicSlug },
          data: {
            subscriptionStatus: 'active',
            currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
          },
        })
        break
      }

      case 'subscription_payment_failed': {
        await prisma.clinic.update({
          where: { slug: clinicSlug },
          data: {
            subscriptionStatus: 'past_due',
          },
        })
        break
      }

      default:
        console.log(`[LemonSqueezy Webhook] Unhandled event: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[LemonSqueezy Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Map Lemon Squeezy variant IDs to plan names
// TODO: Replace with real variant IDs from Lemon Squeezy dashboard
function mapVariantToPlan(variantId: number): string {
  const variantMap: Record<number, string> = {
    // Replace these with your actual Lemon Squeezy variant IDs
    0: 'core',       // Starter $49/mes
    1: 'pro',        // Profesional $99/mes  
    2: 'enterprise', // Elite custom
  }
  return variantMap[variantId] || 'core'
}

// Map Lemon Squeezy status to our internal status
function mapLsStatus(lsStatus: string): string {
  const statusMap: Record<string, string> = {
    'on_trial': 'trialing',
    'active': 'active',
    'paused': 'cancelled',
    'past_due': 'past_due',
    'unpaid': 'past_due',
    'cancelled': 'cancelled',
    'expired': 'cancelled',
  }
  return statusMap[lsStatus] || 'trialing'
}
