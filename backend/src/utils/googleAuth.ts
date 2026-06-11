import { OAuth2Client } from "google-auth-library";

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  emailVerified: boolean;
}

export class GoogleTokenVerificationError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getGoogleClientId = (): string => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new GoogleTokenVerificationError(500, "GOOGLE_CLIENT_ID is not configured");
  }
  return clientId;
};

export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleUserProfile> => {
  const clientId = getGoogleClientId();
  const client = new OAuth2Client(clientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new GoogleTokenVerificationError(401, "Invalid Google token");
    }

    if (!payload.email) {
      throw new GoogleTokenVerificationError(400, "Google account does not include an email address");
    }

    if (!payload.email_verified) {
      throw new GoogleTokenVerificationError(403, "Google email address is not verified");
    }

    return {
      googleId: payload.sub,
      email: payload.email.trim().toLowerCase(),
      fullName: payload.name?.trim() || payload.email.split("@")[0],
      profilePicture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    if (error instanceof GoogleTokenVerificationError) {
      throw error;
    }

    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("expired") || message.includes("too late")) {
      throw new GoogleTokenVerificationError(401, "Google token has expired");
    }

    throw new GoogleTokenVerificationError(401, "Invalid Google token");
  }
};
