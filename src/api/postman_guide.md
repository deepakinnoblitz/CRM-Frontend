# Postman Integration Guide

This guide explains how to configure Postman to interact with the system's APIs.

## 1. Authentication

The system primarily uses session-based authentication. In Postman, you can authenticate in two ways:

### Option A: Using Session Cookies (Easiest)
1. Log in to the application in your web browser.
2. Open Postman.
3. Postman automatically captures cookies if you have the **Postman Interceptor** extension, or you can manually add the `sid` cookie to your request.

### Option B: Using API Key & Secret
1. Go to the **User** document for your account in the Frappe Desk.
2. Scroll to the **API Access** section.
3. Click **Generate Keys**.
4. Use these in Postman's **Authorization** tab:
   - **Type**: API Key
   - **Key**: `Authorization`
   - **Value**: `token YOUR_API_KEY:YOUR_API_SECRET`

---

## 2. Global Headers

For all requests (especially `POST`, `PUT`, `DELETE`), include these headers:

| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required for all requests with a body. |
| `Accept` | `application/json` | Ensures the server returns JSON. |
| `X-Frappe-CSRF-Token`| `{{csrf_token}}` | **Required for POST/PUT/DELETE**. |

---

## 3. Handling CSRF Tokens

To perform `POST` requests, you must first fetch a valid CSRF token.

1. Create a `GET` request to:
   `{{base_url}}/api/method/company.company.frontend_api.get_csrf_token`
2. In the **Tests** tab of this request in Postman, add this snippet to automate it:
   ```javascript
   const jsonData = pm.response.json();
   pm.environment.set("csrf_token", jsonData.message);
   ```
3. Run this request once before your other API calls.

---

## 4. Request Examples

### GET Request (List Records)
- **URL**: `{{base_url}}/api/method/frappe.client.get_list`
- **Params**:
    - `doctype`: `Lead`
    - `fields`: `["name", "lead_name"]`
    - `filters`: `[["Lead", "status", "=", "Open"]]`

### POST Request (Create Record)
- **URL**: `{{base_url}}/api/method/frappe.client.insert`
- **Body** (Raw JSON):
    ```json
    {
      "doc": {
        "doctype": "Lead",
        "lead_name": "John Doe",
        "email_id": "john@example.com"
      }
    }
    ```

### PUT Request (Update Record)
- **URL**: `{{base_url}}/api/method/frappe.client.set_value`
- **Body** (Raw JSON):
    ```json
    {
      "doctype": "Lead",
      "name": "LEAD-00001",
      "fieldname": {
        "status": "Interested"
      }
    }
    ```

---

## 5. Environment Variables

We recommend setting up a Postman Environment with these variables:
- `base_url`: `http://your-server-url`
- `csrf_token`: (Leave blank, will be filled by step 3)
