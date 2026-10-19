# Admin dashboard prototype

The `/admin` area is a frontend demonstration, not a security boundary. Its simulated administrator session is stored separately from the customer demo session in browser storage. Anyone who can access the browser can modify that state. Do not deploy this as authorization: production access control, role assignment, and every administrative API operation must be authenticated and authorized by the backend. Public registration must never grant administrator privileges.

Bookings use the same browser-backed booking service as the customer dashboard, so status updates are visible in both views in the same browser. Services, portfolio entries, contact inquiries, and admin settings are also saved locally for demonstration. Browser storage is not durable or synchronized across users, browsers, or devices. Replace these service implementations with authenticated API/database calls for production persistence.

Portfolio image references and URLs are previews only; the prototype does not upload image files. Integrate managed object/image storage (for example, a server-side upload endpoint backed by an image-storage provider) and store its returned asset reference with the portfolio record. Inquiry status changes do not send email; connect a backend notification or email integration before offering replies.
