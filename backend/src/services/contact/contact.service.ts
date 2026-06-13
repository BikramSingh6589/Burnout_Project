import { sendContactFormEmail, type ContactFormPayload } from "../../utils/email.js";

export const submitContactForm = async (payload: ContactFormPayload): Promise<void> => {
  await sendContactFormEmail(payload);
};
