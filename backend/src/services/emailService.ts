import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Fleet Management <noreply@fleetmanagement.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

export const sendBookingConfirmationEmail = async (
  customerEmail: string,
  bookingDetails: {
    bookingId: string;
    vehicleInfo: string;
    startDate: Date;
    endDate: Date;
    totalCost: number;
  }
): Promise<void> => {
  const html = `
    <h1>Booking Confirmation</h1>
    <p>Your booking has been confirmed!</p>
    <h2>Booking Details:</h2>
    <ul>
      <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
      <li><strong>Vehicle:</strong> ${bookingDetails.vehicleInfo}</li>
      <li><strong>Start Date:</strong> ${bookingDetails.startDate.toLocaleDateString()}</li>
      <li><strong>End Date:</strong> ${bookingDetails.endDate.toLocaleDateString()}</li>
      <li><strong>Total Cost:</strong> $${bookingDetails.totalCost}</li>
    </ul>
    <p>Thank you for choosing our fleet management service!</p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: 'Booking Confirmation - Fleet Management',
    html,
  });
};

export const sendTripCompletionEmail = async (
  customerEmail: string,
  tripDetails: {
    tripId: string;
    vehicleInfo: string;
    startTime: Date;
    endTime: Date;
    startOdometer: number;
    endOdometer: number;
  }
): Promise<void> => {
  const distance = tripDetails.endOdometer - tripDetails.startOdometer;
  const html = `
    <h1>Trip Completed</h1>
    <p>Your trip has been completed successfully!</p>
    <h2>Trip Details:</h2>
    <ul>
      <li><strong>Trip ID:</strong> ${tripDetails.tripId}</li>
      <li><strong>Vehicle:</strong> ${tripDetails.vehicleInfo}</li>
      <li><strong>Start Time:</strong> ${tripDetails.startTime.toLocaleString()}</li>
      <li><strong>End Time:</strong> ${tripDetails.endTime.toLocaleString()}</li>
      <li><strong>Distance Traveled:</strong> ${distance} km</li>
    </ul>
    <p>Thank you for using our service!</p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: 'Trip Completed - Fleet Management',
    html,
  });
};

export const sendTripCancellationEmail = async (
  customerEmail: string,
  cancellationDetails: {
    tripId: string;
    vehicleInfo: string;
    bookingId: string;
  }
): Promise<void> => {
  const html = `
    <h1>Trip Cancelled</h1>
    <p>Your trip has been cancelled.</p>
    <h2>Cancellation Details:</h2>
    <ul>
      <li><strong>Trip ID:</strong> ${cancellationDetails.tripId}</li>
      <li><strong>Booking ID:</strong> ${cancellationDetails.bookingId}</li>
      <li><strong>Vehicle:</strong> ${cancellationDetails.vehicleInfo}</li>
    </ul>
    <p>If you have any questions, please contact our support team.</p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: 'Trip Cancelled - Fleet Management',
    html,
  });
};
