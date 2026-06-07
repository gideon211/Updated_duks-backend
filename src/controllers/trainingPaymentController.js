// src/controllers/trainingPaymentController.js
import crypto from "crypto";
import axios from "axios";
import TrainingRegistration from "../models/TrainingRegistration.js";
import Training from "../models/Training.js";
import { sendEmail } from "../utils/Email.js";

/* ==================== HELPERS ==================== */

// Structured logging
const logEvent = (event, data) => {
  console.log(`[TRAINING_PAYMENT ${event}]`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Verify Paystack webhook signature
const verifyPaystackSignature = (req) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return hash === req.headers["x-paystack-signature"];
};

// Validate participant data
const validateParticipant = (participant) => {
  const errors = [];
  if (!participant?.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push("Valid email is required");
  }
  if (!participant?.phone || participant.phone.length < 10) {
    errors.push("Valid phone number is required");
  }
  if (!participant?.fullName || participant.fullName.length < 2) {
    errors.push("Full name is required");
  }
  if (!participant?.gender || !["Male", "Female", "Other", "Prefer not to say"].includes(participant.gender)) {
    errors.push("Gender is required");
  }
  return errors;
};

// Send customer confirmation email
const sendCustomerEmail = async (registration, participant) => {
  if (!participant?.email) return;

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f5132; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Training Registration Confirmed</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hi ${participant.fullName},</p>
          <p>You have successfully registered for the training program! Your payment has been confirmed and your spot is secured. Thank you for choosing Duks.</p>
          
       

          <h3>Training Details:</h3>
          <div style="background: #fff; padding: 15px; border-left: 4px solid #0f5132; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Program:</strong> ${registration.trainingName}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${registration.duration}</p>
            <p style="margin: 5px 0;"><strong>Format:</strong> ${registration.format}</p>
            <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(registration.startDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Schedule:</strong> ${registration.schedule}</p>
          </div>

       
          
          <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #0f5132;">
            <p style="margin: 0; font-size: 20px; font-weight: bold;">Total Paid: ₵${registration.price.toFixed(2)}</p>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-weight: bold; color: #856404;">Important Information:</p>
            <p style="margin: 10px 0 0; color: #856404;">
              Please arrive 15 minutes early on your first day, Thank you!
            </p>
          </div>

          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If you have any questions, feel free to contact us. We're excited to have you join our training program!
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: participant.email,
      subject: `Training Registration Confirmed - ${registration.trainingName}`,
      html,
    });

    logEvent("CUSTOMER_EMAIL_SENT", { 
      registrationId: registration._id, 
      email: participant.email 
    });
  } catch (error) {
    console.error("Failed to send customer email:", error);
    logEvent("CUSTOMER_EMAIL_FAILED", { 
      registrationId: registration._id, 
      error: error.message 
    });
  }
};

// Send admin notification email
const sendAdminEmail = async (registration, participant) => {
  if (!process.env.ADMIN_EMAIL) return;

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: #0f5132; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">New Training Registration</h2>
          <p style="margin: 10px 0 0;">Registration ID: <strong>${registration._id}</strong></p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <h3 style="margin-top: 0;">Participant Information</h3>
          <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${participant.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${participant.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${participant.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Gender:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${participant.gender}</td>
            </tr>
          </table>

          <h3>Training Details</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Program:</strong> ${registration.trainingName}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${registration.duration}</p>
            <p style="margin: 5px 0;"><strong>Format:</strong> ${registration.format}</p>
            <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(registration.startDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Schedule:</strong> ${registration.schedule}</p>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Payment Reference:</strong> ${registration.paystackReference}</p>
            <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date(registration.createdAt).toLocaleString()}</p>
            <p style="margin: 15px 0 5px; font-size: 20px; font-weight: bold; color: #0f5132;">
              Amount Paid: ₵${registration.price.toFixed(2)}
            </p>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Log into your admin dashboard to manage this registration.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Training Registration — ${participant.fullName}`,
      html,
    });

    logEvent("ADMIN_EMAIL_SENT", { 
      registrationId: registration._id 
    });
  } catch (error) {
    console.error("Failed to send admin email:", error);
    logEvent("ADMIN_EMAIL_FAILED", { 
      registrationId: registration._id, 
      error: error.message 
    });
  }
};

/* ==================== 1. INITIALIZE TRAINING PAYMENT ==================== */
export const initializeTrainingPayment = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      trainingId,
      startDate,
      schedule,
    } = req.body;

    const userId = req.user?._id || null;

    // Build participant object
    const participant = {
      fullName: fullName?.trim() || "",
      email: email?.trim().toLowerCase() || "",
      phone: phone?.trim() || "",
      gender: gender || "",
    };

    // Validate participant information
    const validationErrors = validateParticipant(participant);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid participant information",
        errors: validationErrors,
      });
    }

    // Validate training ID
    if (!trainingId) {
      return res.status(400).json({
        success: false,
        message: "Training service ID is required",
      });
    }

    // Validate start date
    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Training start date is required",
      });
    }

    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date format",
      });
    }

    // Validate schedule
    if (!schedule || schedule.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Training schedule is required",
      });
    }

    // Get training service from database
    const training = await Training.findById(trainingId);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training service not found",
      });
    }

    if (!training.available || training.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This training service is currently unavailable",
      });
    }

    // Check max participants limit
    if (training.maxParticipants && training.currentParticipants >= training.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "This training session is fully booked",
      });
    }

    // Get price from database (NEVER trust frontend)
    const price = training.price;

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid training price",
      });
    }

    // Paystack expects amount in pesewas (kobo)
    const amount = Math.round(price * 100);

    // Prepare metadata
    const metadata = {
      userId: userId?.toString() || null,
      participant,
      trainingId: training._id.toString(),
      trainingName: training.name,
      price,
      duration: training.duration,
      format: training.format,
      startDate: parsedStartDate.toISOString(),
      schedule: schedule.trim(),
      calculatedTotal: price, // For verification in webhook
    };

    logEvent("INIT_PAYMENT", {
      userId,
      email: participant.email,
      amount: price,
      trainingName: training.name,
    });

    // Initialize payment with Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: participant.email,
        amount,
        currency: "GHS",
        callback_url: `${process.env.FRONTEND_URL}/training/registrations`,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error("Training payment initialization error:", error);
    logEvent("INIT_ERROR", {
      error: error.message,
      response: error.response?.data,
    });

    return res.status(500).json({
      success: false,
      message: "Payment initialization failed. Please try again.",
      ...(process.env.NODE_ENV === "development" && {
        error: error.response?.data || error.message,
      }),
    });
  }
};

/* ==================== 2. PAYSTACK WEBHOOK ==================== */
export const webhookTrainingPayment = async (req, res) => {
  console.log('TRAINING WEBHOOK HIT! Event:', req.body?.event, 'Reference:', req.body?.data?.reference);
  
  try {
    // CRITICAL: Verify webhook signature
    if (!verifyPaystackSignature(req)) {
      logEvent("WEBHOOK_INVALID_SIGNATURE", {
        ip: req.ip,
        headers: req.headers,
      });
      return res.status(401).send("Invalid signature");
    }

    const { event, data } = req.body;

    // Only process successful charges
    if (event !== "charge.success") {
      logEvent("WEBHOOK_IGNORED", { event });
      return res.status(200).send("Event ignored");
    }

    const { reference, metadata = {}, amount: paystackAmount } = data;

    // Extract metadata
    const {
      userId,
      participant,
      trainingId,
      trainingName,
      price,
      duration,
      format,
      startDate,
      schedule,
      calculatedTotal,
    } = metadata;

    // Validate required data
    if (!participant || !participant.email) {
      logEvent("WEBHOOK_INVALID_PARTICIPANT", { reference });
      return res.status(400).send("Invalid participant data");
    }

    if (!trainingId || !trainingName) {
      logEvent("WEBHOOK_INVALID_TRAINING", { reference });
      return res.status(400).send("Invalid training data");
    }

    // CRITICAL: Verify payment amount matches calculated total
    const expectedAmount = Math.round(price * 100); // Convert to pesewas
    const amountDifference = Math.abs(paystackAmount - expectedAmount);

    if (amountDifference > 100) { // Allow 1 GHS tolerance
      logEvent("WEBHOOK_AMOUNT_MISMATCH", {
        reference,
        paystackAmount,
        expectedAmount,
        difference: amountDifference,
      });

      // Alert admin about mismatch
      if (process.env.ADMIN_EMAIL) {
        try {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `Training Payment Amount Mismatch - ${reference}`,
            html: `
              <h2>Payment Amount Mismatch Detected</h2>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Paystack Amount:</strong> ₵${(paystackAmount / 100).toFixed(2)}</p>
              <p><strong>Expected Amount:</strong> ₵${price.toFixed(2)}</p>
              <p><strong>Difference:</strong> ₵${(amountDifference / 100).toFixed(2)}</p>
              <p><strong>Participant:</strong> ${participant.email}</p>
              <p style="color: red;"><strong>Action Required:</strong> Manual review needed</p>
            `,
          });
        } catch (err) {
          console.error("Failed to send mismatch alert:", err);
        }
      }
    }

    // Use atomic operation to prevent duplicate registrations
    const registration = await TrainingRegistration.findOneAndUpdate(
      { paystackReference: reference },
      {
        $setOnInsert: {
          userId: userId || null,
          participant,
          trainingId,
          trainingName,
          price,
          duration: duration || "4 weeks",
          format: format || "In-person",
          startDate: new Date(startDate),
          schedule,
          paystackReference: reference,
          paymentStatus: "paid",
          registrationStatus: "confirmed",
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Check if this is a new registration (not duplicate webhook)
    const isNewRegistration = registration.createdAt > new Date(Date.now() - 10000); // Last 10 seconds

    if (!isNewRegistration) {
      logEvent("WEBHOOK_DUPLICATE", {
        registrationId: registration._id,
        reference,
      });
      return res.status(200).send("Registration already processed");
    }

    logEvent("WEBHOOK_REGISTRATION_CREATED", {
      registrationId: registration._id,
      reference,
      price,
      email: participant.email,
    });

    // Increment participant count for the training
    try {
      await Training.findByIdAndUpdate(trainingId, {
        $inc: { currentParticipants: 1 },
      });
      logEvent("TRAINING_PARTICIPANT_INCREMENTED", { trainingId });
    } catch (err) {
      console.warn("Failed to increment participant count:", err);
    }

    // Send emails (async, don't block response)
    Promise.all([
      sendCustomerEmail(registration, participant),
      sendAdminEmail(registration, participant),
    ]).catch(err => console.error("Email error:", err));

    return res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Training webhook error:", error);
    logEvent("WEBHOOK_ERROR", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).send("Webhook processing failed");
  }
};

/* ==================== 3. VERIFY PAYMENT (FALLBACK) ==================== */
export const verifyTrainingPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Check if registration already exists
    const existingRegistration = await TrainingRegistration.findOne({ 
      paystackReference: reference 
    });
    
    if (existingRegistration) {
      logEvent("VERIFY_REGISTRATION_EXISTS", { 
        registrationId: existingRegistration._id, 
        reference 
      });
      return res.redirect(`${process.env.FRONTEND_URL}/training/registrations`);
    }

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      logEvent("VERIFY_PAYMENT_FAILED", { reference, status: data.status });
      return res.status(400).json({
        success: false,
        message: "Payment was not successful",
      });
    }

    // Process similar to webhook (extract and create registration)
    const { metadata = {}, amount: paystackAmount } = data;
    const {
      userId,
      participant,
      trainingId,
      trainingName,
      price,
      duration,
      format,
      startDate,
      schedule,
    } = metadata;

    if (!participant || !trainingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
      });
    }

    const registration = await TrainingRegistration.create({
      userId: userId || null,
      participant,
      trainingId,
      trainingName,
      price,
      duration: duration || "4 weeks",
      format: format || "In-person",
      startDate: new Date(startDate),
      schedule,
      paystackReference: reference,
      paymentStatus: "paid",
      registrationStatus: "confirmed",
    });

    logEvent("VERIFY_REGISTRATION_CREATED", {
      registrationId: registration._id,
      reference,
      price,
    });

    // Increment participant count
    try {
      await Training.findByIdAndUpdate(trainingId, {
        $inc: { currentParticipants: 1 },
      });
    } catch (err) {
      console.warn("Failed to increment participant count:", err);
    }

    // Send emails
    Promise.all([
      sendCustomerEmail(registration, participant),
      sendAdminEmail(registration, participant),
    ]).catch(err => console.error("Email error:", err));

    return res.redirect(`${process.env.FRONTEND_URL}/training/registrations`);
  } catch (error) {
    console.error("Verify training payment error:", error);
    logEvent("VERIFY_ERROR", {
      reference: req.params.reference,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      ...(process.env.NODE_ENV === "development" && {
        error: error.response?.data || error.message,
      }),
    });
  }
};
