import crypto from 'crypto'
import Razorpay from 'razorpay'

/**
 * Create a Razorpay order
 * @param {Object} options - Order options
 * @param {number} options.amount - Amount in paise (INR)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.receipt - Receipt ID
 * @param {Object} options.notes - Additional notes
 * @returns {Promise<Object>} The created order
 */
export async function createRazorpayOrder(options) {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = options

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    })

    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Verify a Razorpay payment
 * @param {Object} options - Verification options
 * @param {string} options.orderId - Razorpay order ID
 * @param {string} options.paymentId - Razorpay payment ID
 * @param {string} options.signature - Razorpay signature
 * @returns {Object} Verification result
 */
export function verifyRazorpayPayment(options) {
  try {
    const { orderId, paymentId, signature } = options

    // Create a signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    // Compare the signatures
    const isValid = expectedSignature === signature

    return {
      success: isValid,
      message: isValid
        ? 'Payment verification successful'
        : 'Payment verification failed',
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Fetch a Razorpay payment
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} The payment details
 */
export async function fetchRazorpayPayment(paymentId) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const payment = await razorpay.payments.fetch(paymentId)

    return {
      success: true,
      payment,
    }
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Refund a Razorpay payment
 * @param {Object} options - Refund options
 * @param {string} options.paymentId - Razorpay payment ID
 * @param {number} options.amount - Amount to refund in paise (INR)
 * @param {string} options.notes - Refund notes
 * @returns {Promise<Object>} The refund details
 */
export async function refundRazorpayPayment(options) {
  try {
    const { paymentId, amount, notes } = options

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const refund = await razorpay.payments.refund(paymentId, {
      amount,
      notes,
    })

    return {
      success: true,
      refund,
    }
  } catch (error) {
    console.error('Error refunding Razorpay payment:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
