import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import {
  Subscription,
  BillingPlan,
  Invoice,
  PaymentMethod,
  Payment,
  Refund,
  Coupon,
  BillingSettings,
  BillingAnalytics,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  CreateInvoiceRequest,
  ProcessPaymentRequest,
  CreateCouponRequest,
  UpdateBillingSettingsRequest,
  BillingWebhookEvent,
  BillingService
} from '../types/billing'

export class BillingServiceImpl implements BillingService {
  private stripe?: Stripe

  constructor(
    private prisma: PrismaClient,
    stripeSecretKey?: string
  ) {
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16'
      })
    }
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  async createSubscription(companyId: string, data: CreateSubscriptionRequest): Promise<Subscription> {
    // Get plan details
    const plan = await this.prisma.billingPlan.findUnique({
      where: { id: data.planId }
    })

    if (!plan) throw new Error('Plan not found')

    let stripeSubscription: Stripe.Subscription | undefined

    if (this.stripe && plan.externalId) {
      // Create Stripe subscription
      const stripeData: Stripe.SubscriptionCreateParams = {
        customer: companyId, // This should be the Stripe customer ID
        items: [{
          price: plan.externalId,
          quantity: data.quantity || 1
        }],
        metadata: data.metadata || {}
      }

      if (data.trialDays && data.trialDays > 0) {
        stripeData.trial_period_days = data.trialDays
      }

      if (data.couponCode) {
        const coupon = await this.validateCoupon(data.couponCode)
        if (coupon?.externalId) {
          stripeData.coupon = coupon.externalId
        }
      }

      stripeSubscription = await this.stripe.subscriptions.create(stripeData)
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        companyId,
        planId: data.planId,
        planName: plan.name,
        status: stripeSubscription?.status || 'active',
        currentPeriodStart: stripeSubscription?.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
          : new Date().toISOString(),
        currentPeriodEnd: stripeSubscription?.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trialStart: stripeSubscription?.trial_start
          ? new Date(stripeSubscription.trial_start * 1000).toISOString()
          : undefined,
        trialEnd: stripeSubscription?.trial_end
          ? new Date(stripeSubscription.trial_end * 1000).toISOString()
          : undefined,
        quantity: data.quantity || 1,
        unitAmount: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
        metadata: data.metadata || {},
        externalId: stripeSubscription?.id
      }
    })

    return {
      id: subscription.id,
      companyId: subscription.companyId,
      planId: subscription.planId,
      planName: subscription.planName,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      trialStart: subscription.trialStart?.toISOString(),
      trialEnd: subscription.trialEnd?.toISOString(),
      cancelAt: subscription.cancelAt?.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt?.toISOString(),
      endedAt: subscription.endedAt?.toISOString(),
      quantity: subscription.quantity,
      unitAmount: subscription.unitAmount,
      currency: subscription.currency,
      interval: subscription.interval,
      intervalCount: subscription.intervalCount,
      metadata: subscription.metadata as any,
      externalId: subscription.externalId || undefined,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString()
    }
  }

  async getSubscriptions(companyId: string): Promise<Subscription[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return subscriptions.map(sub => ({
      id: sub.id,
      companyId: sub.companyId,
      planId: sub.planId,
      planName: sub.planName,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      trialStart: sub.trialStart?.toISOString(),
      trialEnd: sub.trialEnd?.toISOString(),
      cancelAt: sub.cancelAt?.toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      canceledAt: sub.canceledAt?.toISOString(),
      endedAt: sub.endedAt?.toISOString(),
      quantity: sub.quantity,
      unitAmount: sub.unitAmount,
      currency: sub.currency,
      interval: sub.interval,
      intervalCount: sub.intervalCount,
      metadata: sub.metadata as any,
      externalId: sub.externalId || undefined,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString()
    }))
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    })

    if (!subscription) return null

    return {
      id: subscription.id,
      companyId: subscription.companyId,
      planId: subscription.planId,
      planName: subscription.planName,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      trialStart: subscription.trialStart?.toISOString(),
      trialEnd: subscription.trialEnd?.toISOString(),
      cancelAt: subscription.cancelAt?.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt?.toISOString(),
      endedAt: subscription.endedAt?.toISOString(),
      quantity: subscription.quantity,
      unitAmount: subscription.unitAmount,
      currency: subscription.currency,
      interval: subscription.interval,
      intervalCount: subscription.intervalCount,
      metadata: subscription.metadata as any,
      externalId: subscription.externalId || undefined,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString()
    }
  }

  async updateSubscription(id: string, updates: UpdateSubscriptionRequest): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    })

    if (!subscription) throw new Error('Subscription not found')

    if (this.stripe && subscription.externalId) {
      // Update Stripe subscription
      const stripeUpdates: Stripe.SubscriptionUpdateParams = {}

      if (updates.quantity) {
        stripeUpdates.items = [{
          id: subscription.externalId, // This should be the subscription item ID
          quantity: updates.quantity
        }]
      }

      if (updates.cancelAtPeriodEnd !== undefined) {
        stripeUpdates.cancel_at_period_end = updates.cancelAtPeriodEnd
      }

      await this.stripe.subscriptions.update(subscription.externalId, stripeUpdates)
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        quantity: updates.quantity,
        cancelAtPeriodEnd: updates.cancelAtPeriodEnd,
        metadata: updates.metadata
      }
    })

    return {
      id: updatedSubscription.id,
      companyId: updatedSubscription.companyId,
      planId: updatedSubscription.planId,
      planName: updatedSubscription.planName,
      status: updatedSubscription.status,
      currentPeriodStart: updatedSubscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: updatedSubscription.currentPeriodEnd.toISOString(),
      trialStart: updatedSubscription.trialStart?.toISOString(),
      trialEnd: updatedSubscription.trialEnd?.toISOString(),
      cancelAt: updatedSubscription.cancelAt?.toISOString(),
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      canceledAt: updatedSubscription.canceledAt?.toISOString(),
      endedAt: updatedSubscription.endedAt?.toISOString(),
      quantity: updatedSubscription.quantity,
      unitAmount: updatedSubscription.unitAmount,
      currency: updatedSubscription.currency,
      interval: updatedSubscription.interval,
      intervalCount: updatedSubscription.intervalCount,
      metadata: updatedSubscription.metadata as any,
      externalId: updatedSubscription.externalId || undefined,
      createdAt: updatedSubscription.createdAt.toISOString(),
      updatedAt: updatedSubscription.updatedAt.toISOString()
    }
  }

  async cancelSubscription(id: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    })

    if (!subscription) throw new Error('Subscription not found')

    if (this.stripe && subscription.externalId) {
      if (cancelAtPeriodEnd) {
        await this.stripe.subscriptions.update(subscription.externalId, {
          cancel_at_period_end: true
        })
      } else {
        await this.stripe.subscriptions.cancel(subscription.externalId)
      }
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? undefined : new Date(),
        status: cancelAtPeriodEnd ? 'active' : 'canceled'
      }
    })

    return {
      id: updatedSubscription.id,
      companyId: updatedSubscription.companyId,
      planId: updatedSubscription.planId,
      planName: updatedSubscription.planName,
      status: updatedSubscription.status,
      currentPeriodStart: updatedSubscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: updatedSubscription.currentPeriodEnd.toISOString(),
      trialStart: updatedSubscription.trialStart?.toISOString(),
      trialEnd: updatedSubscription.trialEnd?.toISOString(),
      cancelAt: updatedSubscription.cancelAt?.toISOString(),
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      canceledAt: updatedSubscription.canceledAt?.toISOString(),
      endedAt: updatedSubscription.endedAt?.toISOString(),
      quantity: updatedSubscription.quantity,
      unitAmount: updatedSubscription.unitAmount,
      currency: updatedSubscription.currency,
      interval: updatedSubscription.interval,
      intervalCount: updatedSubscription.intervalCount,
      metadata: updatedSubscription.metadata as any,
      externalId: updatedSubscription.externalId || undefined,
      createdAt: updatedSubscription.createdAt.toISOString(),
      updatedAt: updatedSubscription.updatedAt.toISOString()
    }
  }

  async reactivateSubscription(id: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    })

    if (!subscription) throw new Error('Subscription not found')

    if (this.stripe && subscription.externalId) {
      await this.stripe.subscriptions.update(subscription.externalId, {
        cancel_at_period_end: false
      })
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        status: 'active'
      }
    })

    return {
      id: updatedSubscription.id,
      companyId: updatedSubscription.companyId,
      planId: updatedSubscription.planId,
      planName: updatedSubscription.planName,
      status: updatedSubscription.status,
      currentPeriodStart: updatedSubscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: updatedSubscription.currentPeriodEnd.toISOString(),
      trialStart: updatedSubscription.trialStart?.toISOString(),
      trialEnd: updatedSubscription.trialEnd?.toISOString(),
      cancelAt: updatedSubscription.cancelAt?.toISOString(),
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      canceledAt: updatedSubscription.canceledAt?.toISOString(),
      endedAt: updatedSubscription.endedAt?.toISOString(),
      quantity: updatedSubscription.quantity,
      unitAmount: updatedSubscription.unitAmount,
      currency: updatedSubscription.currency,
      interval: updatedSubscription.interval,
      intervalCount: updatedSubscription.intervalCount,
      metadata: updatedSubscription.metadata as any,
      externalId: updatedSubscription.externalId || undefined,
      createdAt: updatedSubscription.createdAt.toISOString(),
      updatedAt: updatedSubscription.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  async createPlan(plan: Omit<BillingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillingPlan> {
    let stripePrice: Stripe.Price | undefined

    if (this.stripe) {
      stripePrice = await this.stripe.prices.create({
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
          interval_count: plan.intervalCount
        },
        product_data: {
          name: plan.name,
          description: plan.description
        }
      })
    }

    const createdPlan = await this.prisma.billingPlan.create({
      data: {
        ...plan,
        externalId: stripePrice?.id
      }
    })

    return {
      id: createdPlan.id,
      name: createdPlan.name,
      description: createdPlan.description,
      price: createdPlan.price,
      currency: createdPlan.currency,
      interval: createdPlan.interval,
      intervalCount: createdPlan.intervalCount,
      trialDays: createdPlan.trialDays,
      features: createdPlan.features as any,
      limits: createdPlan.limits as any,
      isActive: createdPlan.isActive,
      isPopular: createdPlan.isPopular,
      sortOrder: createdPlan.sortOrder,
      externalId: createdPlan.externalId || undefined,
      createdAt: createdPlan.createdAt.toISOString(),
      updatedAt: createdPlan.updatedAt.toISOString()
    }
  }

  async getPlans(): Promise<BillingPlan[]> {
    const plans = await this.prisma.billingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      trialDays: plan.trialDays,
      features: plan.features as any,
      limits: plan.limits as any,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder,
      externalId: plan.externalId || undefined,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString()
    }))
  }

  async updatePlan(id: string, updates: Partial<BillingPlan>): Promise<BillingPlan> {
    const plan = await this.prisma.billingPlan.update({
      where: { id },
      data: updates
    })

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      trialDays: plan.trialDays,
      features: plan.features as any,
      limits: plan.limits as any,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder,
      externalId: plan.externalId || undefined,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString()
    }
  }

  async deletePlan(id: string): Promise<void> {
    await this.prisma.billingPlan.update({
      where: { id },
      data: { isActive: false }
    })
  }

  // ============================================================================
  // PAYMENT METHOD MANAGEMENT
  // ============================================================================

  async createPaymentMethod(companyId: string, data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    let stripePaymentMethod: Stripe.PaymentMethod | undefined

    if (this.stripe) {
      if (data.type === 'card' && data.card) {
        stripePaymentMethod = await this.stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: data.card.number,
            exp_month: data.card.expMonth,
            exp_year: data.card.expYear,
            cvc: data.card.cvc
          },
          billing_details: {
            name: data.billingDetails.name,
            email: data.billingDetails.email,
            phone: data.billingDetails.phone,
            address: data.billingDetails.address ? {
              line1: data.billingDetails.address.line1,
              line2: data.billingDetails.address.line2,
              city: data.billingDetails.address.city,
              state: data.billingDetails.address.state,
              postal_code: data.billingDetails.address.postalCode,
              country: data.billingDetails.address.country
            } : undefined
          }
        })
      }
    }

    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        companyId,
        type: data.type,
        isDefault: false,
        card: data.card ? {
          brand: stripePaymentMethod?.card?.brand || 'unknown',
          last4: stripePaymentMethod?.card?.last4 || data.card.number.slice(-4),
          expMonth: data.card.expMonth,
          expYear: data.card.expYear
        } : undefined,
        bankAccount: data.bankAccount ? {
          bankName: 'Unknown',
          last4: data.bankAccount.accountNumber.slice(-4),
          accountHolderType: data.bankAccount.accountHolderType,
          currency: data.bankAccount.currency
        } : undefined,
        billingDetails: data.billingDetails,
        externalId: stripePaymentMethod?.id
      }
    })

    return {
      id: paymentMethod.id,
      companyId: paymentMethod.companyId,
      type: paymentMethod.type,
      isDefault: paymentMethod.isDefault,
      card: paymentMethod.card as any,
      bankAccount: paymentMethod.bankAccount as any,
      paypal: paymentMethod.paypal as any,
      billingDetails: paymentMethod.billingDetails as any,
      externalId: paymentMethod.externalId || undefined,
      createdAt: paymentMethod.createdAt.toISOString(),
      updatedAt: paymentMethod.updatedAt.toISOString()
    }
  }

  async getPaymentMethods(companyId: string): Promise<PaymentMethod[]> {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { companyId },
      orderBy: { isDefault: 'desc' }
    })

    return paymentMethods.map(pm => ({
      id: pm.id,
      companyId: pm.companyId,
      type: pm.type,
      isDefault: pm.isDefault,
      card: pm.card as any,
      bankAccount: pm.bankAccount as any,
      paypal: pm.paypal as any,
      billingDetails: pm.billingDetails as any,
      externalId: pm.externalId || undefined,
      createdAt: pm.createdAt.toISOString(),
      updatedAt: pm.updatedAt.toISOString()
    }))
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const paymentMethod = await this.prisma.paymentMethod.update({
      where: { id },
      data: updates
    })

    return {
      id: paymentMethod.id,
      companyId: paymentMethod.companyId,
      type: paymentMethod.type,
      isDefault: paymentMethod.isDefault,
      card: paymentMethod.card as any,
      bankAccount: paymentMethod.bankAccount as any,
      paypal: paymentMethod.paypal as any,
      billingDetails: paymentMethod.billingDetails as any,
      externalId: paymentMethod.externalId || undefined,
      createdAt: paymentMethod.createdAt.toISOString(),
      updatedAt: paymentMethod.updatedAt.toISOString()
    }
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id }
    })

    if (!paymentMethod) throw new Error('Payment method not found')

    if (this.stripe && paymentMethod.externalId) {
      await this.stripe.paymentMethods.detach(paymentMethod.externalId)
    }

    await this.prisma.paymentMethod.delete({ where: { id } })
  }

  async setDefaultPaymentMethod(companyId: string, paymentMethodId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.paymentMethod.updateMany({
        where: { companyId },
        data: { isDefault: false }
      }),
      this.prisma.paymentMethod.update({
        where: { id: paymentMethodId },
        data: { isDefault: true }
      })
    ])
  }

  // ============================================================================
  // INVOICE MANAGEMENT
  // ============================================================================

  async createInvoice(companyId: string, data: CreateInvoiceRequest): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber()

    const subtotal = data.lines?.reduce((sum, line) => sum + (line.amount * (line.quantity || 1)), 0) || data.amount || 0
    const tax = subtotal * 0.2 // Default 20% tax
    const total = subtotal + tax

    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        number: invoiceNumber,
        status: 'draft',
        currency: data.currency || 'GBP',
        subtotal,
        tax,
        total,
        amountDue: total,
        amountPaid: 0,
        amountRemaining: total,
        billingReason: data.subscriptionId ? 'subscription_cycle' : 'manual',
        periodStart: data.subscriptionId ? new Date() : undefined,
        periodEnd: data.subscriptionId ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: data.description,
        lines: data.lines || [],
        metadata: data.metadata || {}
      }
    })

    return {
      id: invoice.id,
      companyId: invoice.companyId,
      number: invoice.number,
      status: invoice.status,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      amountRemaining: invoice.amountRemaining,
      billingReason: invoice.billingReason,
      periodStart: invoice.periodStart?.toISOString(),
      periodEnd: invoice.periodEnd?.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      attempted: invoice.attempted,
      attemptedAt: invoice.attemptedAt?.toISOString(),
      collectionMethod: invoice.collectionMethod,
      description: invoice.description || undefined,
      lines: invoice.lines as any,
      paymentIntentId: invoice.paymentIntentId || undefined,
      externalId: invoice.externalId || undefined,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl || undefined,
      invoicePdf: invoice.invoicePdf || undefined,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }
  }

  async getInvoices(companyId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return invoices.map(invoice => ({
      id: invoice.id,
      companyId: invoice.companyId,
      number: invoice.number,
      status: invoice.status,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      amountRemaining: invoice.amountRemaining,
      billingReason: invoice.billingReason,
      periodStart: invoice.periodStart?.toISOString(),
      periodEnd: invoice.periodEnd?.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      attempted: invoice.attempted,
      attemptedAt: invoice.attemptedAt?.toISOString(),
      collectionMethod: invoice.collectionMethod,
      description: invoice.description || undefined,
      lines: invoice.lines as any,
      paymentIntentId: invoice.paymentIntentId || undefined,
      externalId: invoice.externalId || undefined,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl || undefined,
      invoicePdf: invoice.invoicePdf || undefined,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }))
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) return null

    return {
      id: invoice.id,
      companyId: invoice.companyId,
      number: invoice.number,
      status: invoice.status,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      amountRemaining: invoice.amountRemaining,
      billingReason: invoice.billingReason,
      periodStart: invoice.periodStart?.toISOString(),
      periodEnd: invoice.periodEnd?.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      attempted: invoice.attempted,
      attemptedAt: invoice.attemptedAt?.toISOString(),
      collectionMethod: invoice.collectionMethod,
      description: invoice.description || undefined,
      lines: invoice.lines as any,
      paymentIntentId: invoice.paymentIntentId || undefined,
      externalId: invoice.externalId || undefined,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl || undefined,
      invoicePdf: invoice.invoicePdf || undefined,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updates
    })

    return {
      id: invoice.id,
      companyId: invoice.companyId,
      number: invoice.number,
      status: invoice.status,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      amountRemaining: invoice.amountRemaining,
      billingReason: invoice.billingReason,
      periodStart: invoice.periodStart?.toISOString(),
      periodEnd: invoice.periodEnd?.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      attempted: invoice.attempted,
      attemptedAt: invoice.attemptedAt?.toISOString(),
      collectionMethod: invoice.collectionMethod,
      description: invoice.description || undefined,
      lines: invoice.lines as any,
      paymentIntentId: invoice.paymentIntentId || undefined,
      externalId: invoice.externalId || undefined,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl || undefined,
      invoicePdf: invoice.invoicePdf || undefined,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }
  }

  async finalizeInvoice(id: string): Promise<Invoice> {
    return this.updateInvoice(id, { status: 'open', attempted: true, attemptedAt: new Date() })
  }

  async payInvoice(id: string, paymentMethodId?: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) throw new Error('Invoice not found')

    // Process payment
    const payment = await this.processPayment(invoice.companyId, {
      paymentMethodId: paymentMethodId || 'default',
      amount: invoice.amountDue,
      currency: invoice.currency,
      invoiceId: id,
      description: `Payment for invoice ${invoice.number}`
    })

    return this.updateInvoice(id, {
      status: 'paid',
      amountPaid: invoice.amountDue,
      amountRemaining: 0,
      paidAt: new Date(),
      paymentIntentId: payment.externalId
    })
  }

  async voidInvoice(id: string): Promise<Invoice> {
    return this.updateInvoice(id, { status: 'void' })
  }

  // ============================================================================
  // PAYMENT PROCESSING
  // ============================================================================

  async processPayment(companyId: string, data: ProcessPaymentRequest): Promise<Payment> {
    let stripePaymentIntent: Stripe.PaymentIntent | undefined

    if (this.stripe) {
      stripePaymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        payment_method: data.paymentMethodId,
        confirmation_method: 'automatic',
        metadata: data.metadata || {}
      })
    }

    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        currency: data.currency,
        status: stripePaymentIntent?.status === 'succeeded' ? 'succeeded' : 'pending',
        paymentMethodId: data.paymentMethodId,
        paymentMethodType: 'card', // Simplified
        description: data.description,
        externalId: stripePaymentIntent?.id,
        metadata: data.metadata || {}
      }
    })

    return {
      id: payment.id,
      companyId: payment.companyId,
      invoiceId: payment.invoiceId || undefined,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethodId: payment.paymentMethodId,
      paymentMethodType: payment.paymentMethodType,
      description: payment.description || undefined,
      receiptUrl: payment.receiptUrl || undefined,
      failureCode: payment.failureCode || undefined,
      failureMessage: payment.failureMessage || undefined,
      refunded: payment.refunded,
      refundAmount: payment.refundAmount,
      disputeId: payment.disputeId || undefined,
      externalId: payment.externalId || undefined,
      metadata: payment.metadata as any,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    }
  }

  async getPayments(companyId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return payments.map(payment => ({
      id: payment.id,
      companyId: payment.companyId,
      invoiceId: payment.invoiceId || undefined,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethodId: payment.paymentMethodId,
      paymentMethodType: payment.paymentMethodType,
      description: payment.description || undefined,
      receiptUrl: payment.receiptUrl || undefined,
      failureCode: payment.failureCode || undefined,
      failureMessage: payment.failureMessage || undefined,
      refunded: payment.refunded,
      refundAmount: payment.refundAmount,
      disputeId: payment.disputeId || undefined,
      externalId: payment.externalId || undefined,
      metadata: payment.metadata as any,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    }))
  }

  async getPayment(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id }
    })

    if (!payment) return null

    return {
      id: payment.id,
      companyId: payment.companyId,
      invoiceId: payment.invoiceId || undefined,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethodId: payment.paymentMethodId,
      paymentMethodType: payment.paymentMethodType,
      description: payment.description || undefined,
      receiptUrl: payment.receiptUrl || undefined,
      failureCode: payment.failureCode || undefined,
      failureMessage: payment.failureMessage || undefined,
      refunded: payment.refunded,
      refundAmount: payment.refundAmount,
      disputeId: payment.disputeId || undefined,
      externalId: payment.externalId || undefined,
      metadata: payment.metadata as any,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    }
  }

  async refundPayment(paymentId: string, amount: number, reason: string): Promise<Refund> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) throw new Error('Payment not found')

    let stripeRefund: Stripe.Refund | undefined

    if (this.stripe && payment.externalId) {
      stripeRefund = await this.stripe.refunds.create({
        payment_intent: payment.externalId,
        amount: Math.round(amount * 100),
        reason: reason as Stripe.RefundCreateParams.Reason
      })
    }

    const refund = await this.prisma.refund.create({
      data: {
        paymentId,
        amount,
        currency: payment.currency,
        reason: reason as any,
        status: stripeRefund?.status || 'succeeded',
        externalId: stripeRefund?.id
      }
    })

    // Update payment refund status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        refunded: true,
        refundAmount: payment.refundAmount + amount
      }
    })

    return {
      id: refund.id,
      paymentId: refund.paymentId,
      amount: refund.amount,
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
      description: refund.description || undefined,
      externalId: refund.externalId || undefined,
      createdAt: refund.createdAt.toISOString(),
      updatedAt: refund.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // COUPON MANAGEMENT
  // ============================================================================

  async createCoupon(data: CreateCouponRequest): Promise<Coupon> {
    let stripeCoupon: Stripe.Coupon | undefined

    if (this.stripe) {
      const couponData: Stripe.CouponCreateParams = {
        name: data.name,
        percent_off: data.percentOff,
        amount_off: data.amountOff ? Math.round(data.amountOff * 100) : undefined,
        currency: data.currency,
        duration: data.duration,
        duration_in_months: data.durationInMonths,
        max_redemptions: data.maxRedemptions,
        redeem_by: data.validUntil ? Math.floor(new Date(data.validUntil).getTime() / 1000) : undefined
      }

      stripeCoupon = await this.stripe.coupons.create(couponData)
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code: data.code,
        name: data.name,
        percentOff: data.percentOff,
        amountOff: data.amountOff,
        currency: data.currency,
        duration: data.duration,
        durationInMonths: data.durationInMonths,
        maxRedemptions: data.maxRedemptions,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        applicablePlans: data.applicablePlans || [],
        externalId: stripeCoupon?.id
      }
    })

    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || undefined,
      percentOff: coupon.percentOff || undefined,
      amountOff: coupon.amountOff || undefined,
      currency: coupon.currency || undefined,
      duration: coupon.duration,
      durationInMonths: coupon.durationInMonths || undefined,
      maxRedemptions: coupon.maxRedemptions || undefined,
      timesRedeemed: coupon.timesRedeemed,
      validFrom: coupon.validFrom?.toISOString(),
      validUntil: coupon.validUntil?.toISOString(),
      applicablePlans: coupon.applicablePlans,
      isActive: coupon.isActive,
      externalId: coupon.externalId || undefined,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString()
    }
  }

  async getCoupons(): Promise<Coupon[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || undefined,
      percentOff: coupon.percentOff || undefined,
      amountOff: coupon.amountOff || undefined,
      currency: coupon.currency || undefined,
      duration: coupon.duration,
      durationInMonths: coupon.durationInMonths || undefined,
      maxRedemptions: coupon.maxRedemptions || undefined,
      timesRedeemed: coupon.timesRedeemed,
      validFrom: coupon.validFrom?.toISOString(),
      validUntil: coupon.validUntil?.toISOString(),
      applicablePlans: coupon.applicablePlans,
      isActive: coupon.isActive,
      externalId: coupon.externalId || undefined,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString()
    }))
  }

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: updates
    })

    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || undefined,
      percentOff: coupon.percentOff || undefined,
      amountOff: coupon.amountOff || undefined,
      currency: coupon.currency || undefined,
      duration: coupon.duration,
      durationInMonths: coupon.durationInMonths || undefined,
      maxRedemptions: coupon.maxRedemptions || undefined,
      timesRedeemed: coupon.timesRedeemed,
      validFrom: coupon.validFrom?.toISOString(),
      validUntil: coupon.validUntil?.toISOString(),
      applicablePlans: coupon.applicablePlans,
      isActive: coupon.isActive,
      externalId: coupon.externalId || undefined,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString()
    }
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { id },
      data: { isActive: false }
    })
  }

  async validateCoupon(code: string, planId?: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } }
        ],
        OR: [
          { applicablePlans: { isEmpty: true } },
          planId ? { applicablePlans: { has: planId } } : {}
        ]
      }
    })

    if (!coupon) return null

    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || undefined,
      percentOff: coupon.percentOff || undefined,
      amountOff: coupon.amountOff || undefined,
      currency: coupon.currency || undefined,
      duration: coupon.duration,
      durationInMonths: coupon.durationInMonths || undefined,
      maxRedemptions: coupon.maxRedemptions || undefined,
      timesRedeemed: coupon.timesRedeemed,
      validFrom: coupon.validFrom?.toISOString(),
      validUntil: coupon.validUntil?.toISOString(),
      applicablePlans: coupon.applicablePlans,
      isActive: coupon.isActive,
      externalId: coupon.externalId || undefined,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  async getBillingSettings(companyId: string): Promise<any | null> {
    const settings = await this.prisma.billingSettings.findUnique({
      where: { companyId }
    })

    if (!settings) return null

    return {
      id: settings.id,
      companyId: settings.companyId,
      defaultCurrency: settings.defaultCurrency,
      taxRate: settings.taxRate,
      taxId: settings.taxId || undefined,
      invoiceFooter: settings.invoiceFooter || undefined,
      paymentMethods: settings.paymentMethods as any,
      billingAddress: settings.billingAddress as any,
      notifications: settings.notifications as any,
      autoAdvanceInvoices: settings.autoAdvanceInvoices,
      daysUntilDue: settings.daysUntilDue,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  async updateBillingSettings(companyId: string, updates: UpdateBillingSettingsRequest): Promise<any> {
    const settings = await this.prisma.billingSettings.upsert({
      where: { companyId },
      update: updates,
      create: {
        companyId,
        defaultCurrency: 'GBP',
        taxRate: 0.2,
        paymentMethods: {
          stripe: true,
          paypal: false,
          bankTransfer: false
        },
        billingAddress: {
          line1: '',
          city: '',
          postalCode: '',
          country: 'GB'
        },
        notifications: {
          invoiceCreated: true,
          paymentFailed: true,
          paymentSucceeded: true,
          subscriptionCanceled: true,
          trialEnding: true
        },
        autoAdvanceInvoices: true,
        daysUntilDue: 30
      }
    })

    return {
      id: settings.id,
      companyId: settings.companyId,
      defaultCurrency: settings.defaultCurrency,
      taxRate: settings.taxRate,
      taxId: settings.taxId || undefined,
      invoiceFooter: settings.invoiceFooter || undefined,
      paymentMethods: settings.paymentMethods as any,
      billingAddress: settings.billingAddress as any,
      notifications: settings.notifications as any,
      autoAdvanceInvoices: settings.autoAdvanceInvoices,
      daysUntilDue: settings.daysUntilDue,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async getBillingAnalytics(companyId: string, period: { start: string; end: string }): Promise<BillingAnalytics> {
    const startDate = new Date(period.start)
    const endDate = new Date(period.end)

    const [payments, subscriptions, invoices] = await Promise.all([
      this.prisma.payment.findMany({
        where: { companyId, createdAt: { gte: startDate, lte: endDate } }
      }),
      this.prisma.subscription.findMany({
        where: { companyId }
      }),
      this.prisma.invoice.findMany({
        where: { companyId, createdAt: { gte: startDate, lte: endDate } }
      })
    ])

    const totalRevenue = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0)

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
    const monthlyRecurringRevenue = subscriptions
      .filter(s => s.status === 'active' && s.interval === 'month')
      .reduce((sum, s) => sum + (s.unitAmount * s.quantity), 0)

    const annualRecurringRevenue = subscriptions
      .filter(s => s.status === 'active' && s.interval === 'year')
      .reduce((sum, s) => sum + (s.unitAmount * s.quantity), 0)

    const paymentSuccessRate = payments.length > 0
      ? (payments.filter(p => p.status === 'succeeded').length / payments.length) * 100
      : 100

    return {
      totalRevenue,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      averageRevenuePerUser: activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0,
      churnRate: 0, // Would need historical data
      lifetimeValue: activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0,
      paymentSuccessRate,
      outstandingInvoices: invoices.filter(i => i.status === 'open').length,
      overdueInvoices: invoices.filter(i => i.status === 'open' && i.dueDate && i.dueDate < new Date()).length,
      recentPayments: payments.slice(0, 5).map(p => ({
        id: p.id,
        companyId: p.companyId,
        invoiceId: p.invoiceId || undefined,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paymentMethodId: p.paymentMethodId,
        paymentMethodType: p.paymentMethodType,
        description: p.description || undefined,
        receiptUrl: p.receiptUrl || undefined,
        failureCode: p.failureCode || undefined,
        failureMessage: p.failureMessage || undefined,
        refunded: p.refunded,
        refundAmount: p.refundAmount,
        disputeId: p.disputeId || undefined,
        externalId: p.externalId || undefined,
        metadata: p.metadata as any,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      })),
      revenueByPlan: {},
      revenueByMonth: {},
      subscriptionMetrics: {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions,
        canceledSubscriptions: subscriptions.filter(s => s.status === 'canceled').length,
        trialSubscriptions: subscriptions.filter(s => s.status === 'trialing').length,
        conversionRate: subscriptions.length > 0
          ? (activeSubscriptions / subscriptions.length) * 100
          : 100
      },
      period
    }
  }

  // ============================================================================
  // WEBHOOKS & INTEGRATIONS
  // ============================================================================

  async handleWebhookEvent(event: BillingWebhookEvent): Promise<void> {
    // Handle different Stripe webhook events
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data)
        break
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data)
        break
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data)
        break
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data)
        break
    }
  }

  async syncWithStripe(companyId: string): Promise<void> {
    // Sync subscriptions, invoices, and payments from Stripe
    console.log(`Syncing company ${companyId} with Stripe`)
  }

  async getUpcomingInvoice(companyId: string): Promise<Invoice | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        companyId,
        status: 'active',
        currentPeriodEnd: { gt: new Date() }
      },
      orderBy: { currentPeriodEnd: 'asc' }
    })

    if (!subscription) return null

    // Generate upcoming invoice preview
    return this.createInvoice(companyId, {
      subscriptionId: subscription.id,
      customerId: companyId,
      amount: subscription.unitAmount * subscription.quantity,
      currency: subscription.currency,
      description: `Subscription renewal for ${subscription.planName}`
    })
  }

  // ============================================================================
  // USAGE & LIMITS
  // ============================================================================

  async checkPlanLimits(companyId: string, resource: string): Promise<{ allowed: boolean; current: number; limit: number }> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { companyId, status: 'active' },
      include: { plan: true }
    })

    if (!subscription?.plan) {
      return { allowed: false, current: 0, limit: 0 }
    }

    const limit = subscription.plan.limits?.find((l: any) => l.resource === resource)?.limit || 0
    const current = await this.getCurrentUsage(companyId, resource)

    return {
      allowed: current < limit,
      current,
      limit
    }
  }

  async recordUsage(companyId: string, resource: string, quantity: number): Promise<void> {
    // Record usage for billing/limits tracking
    console.log(`Recording ${quantity} usage of ${resource} for company ${companyId}`)
  }

  async getUsage(companyId: string, period: { start: string; end: string }): Promise<Record<string, number>> {
    // Return usage statistics
    return {}
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async sendInvoiceNotification(invoiceId: string): Promise<void> {
    // Send invoice notification email
    console.log(`Sending invoice notification for invoice ${invoiceId}`)
  }

  async sendPaymentNotification(paymentId: string): Promise<void> {
    // Send payment notification email
    console.log(`Sending payment notification for payment ${paymentId}`)
  }

  async sendSubscriptionNotification(subscriptionId: string, type: 'created' | 'updated' | 'canceled' | 'trial_ending'): Promise<void> {
    // Send subscription notification email
    console.log(`Sending ${type} notification for subscription ${subscriptionId}`)
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')

    // Get count of invoices this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const invoiceCount = await this.prisma.invoice.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    })

    return `INV-${year}${month}-${String(invoiceCount + 1).padStart(4, '0')}`
  }

  private async getCurrentUsage(companyId: string, resource: string): Promise<number> {
    // Mock usage calculation - would integrate with actual usage tracking
    return Math.floor(Math.random() * 100)
  }

  private async handlePaymentSucceeded(data: any): Promise<void> {
    // Handle successful payment webhook
    console.log('Payment succeeded:', data)
  }

  private async handlePaymentFailed(data: any): Promise<void> {
    // Handle failed payment webhook
    console.log('Payment failed:', data)
  }

  private async handleSubscriptionCreated(data: any): Promise<void> {
    // Handle subscription created webhook
    console.log('Subscription created:', data)
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    // Handle subscription updated webhook
    console.log('Subscription updated:', data)
  }

  private async handleSubscriptionDeleted(data: any): Promise<void> {
    // Handle subscription deleted webhook
    console.log('Subscription deleted:', data)
  }
}