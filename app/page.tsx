"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function TestPage() {
  // Login state
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Purchase state
  const [purchaseData, setPurchaseData] = useState({
    eventId: "1",
    quantity: 1,
    buyer_name: "",
    phone: "",
    email: "",
    reference_number: "",
    attendees: [{ name: "" }]
  });
  const [file, setFile] = useState<File | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
// Admin test state
const [adminData, setAdminData] = useState<any>(null);
const [adminError, setAdminError] = useState<string | null>(null);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    try {
      const result = await apiClient.login(loginData.username, loginData.password);
      setLoginResult(result);
      setIsLoggedIn(true);
      setLoginError(null);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setLoginError(errorMessage);
      
      // Show additional error details if available
      if (error instanceof Error && (error as any).data) {
        console.log("Additional error info:", (error as any).data);
      }
    }
  };

  
// Test an admin endpoint
const testAdminEndpoint = async () => {
  try {
    const events = await apiClient.getEvents(); // Example admin endpoint
    setAdminData(events);
    setAdminError(null);
  } catch (error) {
    setAdminError(error instanceof Error ? error.message : "Admin request failed");
    console.error("Admin error:", error);
  }
};


  // Handle purchase
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError(null);

    if (!file) {
      setPurchaseError("Please upload a payslip image");
      return;
    }

    try {
      const result = await apiClient.purchaseTickets(
        purchaseData.eventId,
        {
          quantity: Number(purchaseData.quantity),
          buyer_name: purchaseData.buyer_name,
          phone: purchaseData.phone,
          email: purchaseData.email,
          reference_number: purchaseData.reference_number,
          attendees: purchaseData.attendees.filter(a => a.name.trim() !== "")
        },
        file
      );
      setPurchaseResult(result);
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMessage = error instanceof Error ? error.message : "Purchase failed";
      setPurchaseError(errorMessage);
      
      // Show backend validation errors if available
      if (error instanceof Error && (error as any).data) {
        console.log("Backend validation errors:", (error as any).data);
        // You could display these specific errors in your UI
      }
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">API Client Tests</h1>

      {/* Login Test Section */}
      <section className="mb-12 p-6 bg-gray-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Login Test</h2>
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1">Username</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Test Login
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-green-600">✓ Logged in successfully</p>
            <button
              onClick={() => {
                apiClient.logout();
                setIsLoggedIn(false);
                setLoginResult(null);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Logout
            </button>
          </div>
        )}
        
        {loginError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            <p>Login Error: {loginError}</p>
          </div>
        )}
      </section>

{isLoggedIn && (
  <section className="mb-12 p-6 bg-blue-50 rounded-lg border">
    <h2 className="text-xl font-semibold mb-4">Admin Function Test</h2>
    <button
      onClick={testAdminEndpoint}
      className="px-4 py-2 bg-blue-700 text-white rounded mb-4"
    >
      Test Admin Endpoint (Get All Events)
    </button>

    {adminError && (
      <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
        Admin Error: {adminError}
      </div>
    )}

    {adminData && (
      <div>
        <h3 className="font-medium mb-2">Admin Data:</h3>
        <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
          {JSON.stringify(adminData, null, 2)}
        </pre>
      </div>
    )}
  </section>
)}

      {/* Purchase Test Section */}
      <section className="p-6 bg-gray-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Ticket Purchase Test</h2>
        <form onSubmit={handlePurchase} className="space-y-4">
          {/* ... (keep your existing purchase form fields) ... */}
          {/* Add all your purchase form fields here */}
          
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={!isLoggedIn}
          >
            {!isLoggedIn ? "Login to Purchase" : "Submit Purchase"}
          </button>
        </form>

        {purchaseError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            <p>Purchase Error: {purchaseError}</p>
          </div>
        )}

        {purchaseResult && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            <p>✓ Purchase successful!</p>
            <pre className="text-xs mt-2 overflow-x-auto">
              {JSON.stringify(purchaseResult, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}