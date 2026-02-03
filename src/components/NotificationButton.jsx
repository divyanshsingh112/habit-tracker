import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationButton({ user }) {
  const [isSubscribed, setIsSubscribed] = useState(Notification.permission === 'granted');
  const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-m9uw.onrender.com';
  // MUST match the Public Key from Step 2
  const VAPID_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_FROM_STEP_2'; 

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.uid, subscription }),
        headers: { 'Content-Type': 'application/json' }
      });

      setIsSubscribed(true);
      alert("Reminders Enabled! You'll get a notification at 9 AM.");
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Failed to enable notifications.");
    }
  };

  return (
    <button 
      onClick={subscribeUser} 
      className="crumb-btn"
      style={{ 
        marginLeft: '8px', 
        display: 'flex', alignItems: 'center', gap: '6px',
        color: isSubscribed ? 'var(--primary)' : 'var(--text-sub)'
      }}
    >
      {isSubscribed ? <Bell size={16} /> : <BellOff size={16} />}
      <span>{isSubscribed ? 'On' : 'Remind'}</span>
    </button>
  );
}