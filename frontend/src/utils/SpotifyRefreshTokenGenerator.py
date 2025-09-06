# Spotify Refresh Token Generator
# This script guides you through the Spotify Authorization Code Flow
# to get your initial refresh token.

# Instructions:
# 1. Make sure you have the 'requests' library installed: pip install requests
# 2. Go to your Spotify Developer Dashboard: https://developer.spotify.com/dashboard/
# 3. Create an app or use an existing one.
# 4. Copy your "Client ID" and "Client Secret" and paste them below.
# 5. Go to your app's "Settings".
# 6. Under "Redirect URIs", add "http://localhost:8888/callback".
# 7. Run this script. It will open a browser window for you to log in and authorize.
# 8. After you authorize, you will be redirected to a blank page.
#    The script will then print your refresh token in the console.

import os
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import requests
import base64
from dotenv import load_dotenv

# --- CONFIGURATION ---
# Paste your Client ID and Client Secret from the Spotify Developer Dashboard
load_dotenv()
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI = "http://127.0.0.1:8888/callback"
# Define the scopes your application needs.
# You can find a full list here: https://developer.spotify.com/documentation/web-api/concepts/scopes
# For general use, these are a good starting point.
SCOPE = "user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read"

# --- DO NOT EDIT BELOW THIS LINE ---

auth_code = None
auth_event = threading.Event()

class CallbackHandler(BaseHTTPRequestHandler):
    """A simple HTTP request handler to catch the Spotify redirect."""
    def do_GET(self):
        global auth_code
        
        # Parse the query parameters from the request URL
        query_components = parse_qs(urlparse(self.path).query)
        
        # Check if the 'code' parameter exists
        if 'code' in query_components:
            auth_code = query_components["code"][0]
            message = "<h1>Authorization Successful!</h1><p>You can close this window and return to the script.</p>"
            self.send_response(200)
        else:
            error = query_components.get("error", ["Unknown error"])[0]
            message = f"<h1>Authorization Failed</h1><p>Error: {error}. Please try again.</p>"
            self.send_response(400)
            
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(bytes(message, "utf8"))
        
        # Signal that the authorization code has been received
        auth_event.set()

def start_server():
    """Starts the local HTTP server in a separate thread."""
    server = HTTPServer(('localhost', 8888), CallbackHandler)
    # The server will run until the auth code is received and the server is shut down.
    server.serve_forever()

def get_refresh_token(code):
    """Exchanges the authorization code for an access token and refresh token."""
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    auth_bytes = auth_string.encode('utf-8')
    auth_base64 = base64.b64encode(auth_bytes).decode('utf-8')

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI
    }

    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()  # Raise an exception for bad status codes
        token_info = response.json()
        
        if 'refresh_token' in token_info:
            return token_info['refresh_token']
        else:
            print("\nError: 'refresh_token' not found in the response.")
            print("Response from Spotify:", token_info)
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"\nAn error occurred while requesting the token: {e}")
        print("Response content:", e.response.text if e.response else "No response")
        return None

def main():
    """Main function to run the authorization process."""
    if CLIENT_ID == "YOUR_CLIENT_ID" or CLIENT_SECRET == "YOUR_CLIENT_SECRET":
        print("Error: Please update the CLIENT_ID and CLIENT_SECRET variables in the script.")
        return

    # Start the local server in a background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Construct the authorization URL
    auth_url = (
        "https://accounts.spotify.com/authorize"
        f"?client_id={CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope={SCOPE}"
    )

    print("\nOpening your browser to authorize the application...")
    print(f"If it doesn't open, please go to this URL:\n{auth_url}")
    webbrowser.open(auth_url)

    # Wait for the user to authorize and for the auth code to be received
    print("\nWaiting for authorization...")
    auth_event.wait(timeout=120) # Wait for 2 minutes

    if auth_code:
        print("Authorization code received. Exchanging for refresh token...")
        refresh_token = get_refresh_token(auth_code)
        if refresh_token:
            print("\n" + "="*50)
            print("      SUCCESS! Here is your Refresh Token:")
            print("="*50)
            print(f"\n{refresh_token}\n")
            print("="*50)
            print("Store this token securely. You will use it in your main script.")
            print("="*50)
    else:
        print("\nAuthorization timed out or failed. Please run the script again.")
    
    # The script will now exit as the daemon thread will be terminated.
    # A more robust shutdown is not needed for this one-time script.
    os._exit(0)


if __name__ == "__main__":
    main()
