import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  guest_name: string;
  email: string;
  phone: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  special_requests?: string;
}

const getRoomTypeName = (roomType: string): string => {
  switch (roomType) {
    case "standard-room-only":
      return "Standard Double - Room Only (₵250/night)";
    case "standard-with-breakfast":
      return "Standard Double - With Breakfast (₵280/night)";
    default:
      return roomType;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received booking notification request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingNotificationRequest = await req.json();
    console.log("Booking data:", JSON.stringify(booking));

    const roomTypeName = getRoomTypeName(booking.room_type);

    // Send confirmation email to guest
    const guestEmailResponse = await resend.emails.send({
      from: "Edibec Guest House <onboarding@resend.dev>",
      to: [booking.email],
      subject: "Booking Request Received - Edibec Guest House",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.6; color: #1a1a2e; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); color: #d4af37; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f8f6f0; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #1a1a2e; }
            .value { color: #555; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .gold { color: #d4af37; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Edibec Guest House</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Booking Request Confirmation</p>
            </div>
            <div class="content">
              <p>Dear <strong>${booking.guest_name}</strong>,</p>
              <p>Thank you for choosing Edibec Guest House! We have received your booking request and will contact you within 24 hours to confirm availability.</p>
              
              <div class="booking-details">
                <h3 style="margin-top: 0; color: #1a1a2e;">Your Booking Details</h3>
                <div class="detail-row">
                  <span class="label">Room Type:</span>
                  <span class="value">${roomTypeName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Check-in:</span>
                  <span class="value">${booking.check_in_date}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Check-out:</span>
                  <span class="value">${booking.check_out_date}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Guests:</span>
                  <span class="value">${booking.guests_count}</span>
                </div>
                ${booking.special_requests ? `
                <div class="detail-row">
                  <span class="label">Special Requests:</span>
                  <span class="value">${booking.special_requests}</span>
                </div>
                ` : ''}
              </div>

              <p>If you have any questions, feel free to contact us:</p>
              <ul>
                <li>Phone: <a href="tel:+233553157354" class="gold">0553 157 354</a></li>
                <li>WhatsApp: <a href="https://wa.me/233553157354" class="gold">+233 553 157 354</a></li>
              </ul>

              <div class="footer">
                <p>We look forward to hosting you!</p>
                <p><strong>Edibec Guest House</strong><br>Takoradi, Ghana</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Guest email sent:", guestEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking notification sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
