# hotspot/services.py

class MikroTikService:
    def create_hotspot_user(self, username, password, profile, uptime_limit):
        # Mock for now — replace internals when you have the router
        print(f"[MOCK] Created hotspot user: {username} | Profile: {profile} | Uptime: {uptime_limit}")
        return True

    def delete_hotspot_user(self, username):
        print(f"[MOCK] Deleted hotspot user: {username}")
        return True

    def check_user_active(self, username):
        print(f"[MOCK] Checking if {username} is active")
        return True