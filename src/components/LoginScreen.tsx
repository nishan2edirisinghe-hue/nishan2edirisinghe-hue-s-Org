import { useState } from "react";
import { ArrowRight, Globe, Lock, Phone, ShieldCheck, Sparkles, User } from "lucide-react";

interface LoginScreenProps {
  onLogin: (username: string, method: "demo" | "email" | "phone" | "google") => void;
  onNotify: (msg: string) => void;
}

export function LoginScreen({ onLogin, onNotify }: LoginScreenProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [username, setUsername] = useState("Kasun_CMB");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);

  const [countryCode, setCountryCode] = useState("+94");
  const [phoneNumber, setPhoneNumber] = useState("77 458 9012");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim();
    if (!clean || !password.trim()) {
      onNotify("Please enter both username and password");
      return;
    }
    onLogin(clean, "email");
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneNumber.replace(/\D/g, "");
    if (!phoneNumber.trim() || digits.length < 7) {
      onNotify("Please enter a valid mobile number");
      return;
    }

    if (!otpSent) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setOtpSent(true);
      setOtpCode(code);
      onNotify(`SMS verification code sent: ${code}`);
      return;
    }

    if (otpCode.trim().length !== 6) {
      onNotify("Please enter the 6-digit verification code");
      return;
    }

    onLogin(`${countryCode} ${phoneNumber.trim()}`, "phone");
  };

  const handleResendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(code);
    onNotify(`New SMS verification code sent: ${code}`);
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-zinc-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-[#17171B] border border-zinc-800/90 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Brand Editorial Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-b from-[#1D1D23] to-[#121216] border-r border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#F5C518] text-black flex items-center justify-center font-extrabold text-xl shadow-md">
                G
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">GRINDR</span>
            </div>

            <h1 className="mt-10 text-3xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance]">
              Meet guys nearby in real time.
            </h1>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Browse the proximity grid, send instant Taps, share locations, or start real-time voice conversations right inside any chat.
            </p>
          </div>

          <div className="space-y-4 pt-8 border-t border-zinc-800/80 text-xs text-zinc-400">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-medium">Proximity Discovery</span>
              <span className="font-mono tabular-nums text-[#F5C518]">85m – 2km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-medium">Live Voice & Wingman</span>
              <span className="text-zinc-400">Real-time audio</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-medium">Local Persistence</span>
              <span className="text-zinc-400">Saved on device</span>
            </div>
          </div>
        </div>

        {/* Right Sign-In Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between">
          <div>
            {/* Mobile Brand Header */}
            <div className="lg:hidden flex flex-col items-center text-center mb-6 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F5C518] text-black flex items-center justify-center font-extrabold text-2xl shadow-lg mb-3">
                G
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">GRINDR</h1>
              <p className="text-xs text-zinc-400 mt-1">Connect with guys nearby in real time</p>
            </div>

            <div className="hidden lg:block mb-6">
              <h2 className="text-xl font-bold text-white">Sign in to continue</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Use one-tap demo access or sign in with your credentials.
              </p>
            </div>

            {/* One-Tap Demo Shortcut */}
            <button
              type="button"
              onClick={() => onLogin("Kasun_CMB", "demo")}
              className="w-full min-h-[48px] mb-5 px-4 py-3 rounded-xl bg-[#F5C518] hover:bg-[#E0B20F] text-black font-bold text-sm flex items-center justify-between transition active:scale-[0.99] shadow-lg shadow-[#F5C518]/10 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>One-Tap Demo Sign-In (Kasun_CMB)</span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            {/* Login Method Segmented Switch */}
            <div className="grid grid-cols-2 bg-[#0E0E10] p-1 rounded-xl border border-zinc-800 mb-5">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`min-h-[40px] py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  method === "email"
                    ? "bg-[#222228] text-white border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Username / Email
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`min-h-[40px] py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  method === "phone"
                    ? "bg-[#222228] text-white border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Phone Number
              </button>
            </div>

            {method === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-username"
                    className="block text-xs font-semibold text-zinc-300 mb-1.5"
                  >
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-[#0E0E10] text-sm text-white rounded-xl pl-10 pr-4 py-3 border border-zinc-800 focus:border-[#F5C518] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-zinc-300 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0E0E10] text-sm text-white rounded-xl pl-10 pr-4 py-3 border border-zinc-800 focus:border-[#F5C518] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer min-h-[36px]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-[#F5C518] rounded w-4 h-4"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => onNotify("Password reset instructions sent to your email")}
                    className="text-[#F5C518] hover:underline font-semibold min-h-[36px] px-1 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[46px] py-3 rounded-xl bg-zinc-100 hover:bg-white text-black font-bold text-sm transition active:scale-[0.99] cursor-pointer"
                >
                  Log In
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                {!otpSent ? (
                  <div>
                    <label
                      htmlFor="login-phone"
                      className="block text-xs font-semibold text-zinc-300 mb-1.5"
                    >
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country code"
                        className="bg-[#0E0E10] text-sm text-white font-semibold rounded-xl px-3 py-3 border border-zinc-800 focus:border-[#F5C518] focus:outline-none font-mono"
                      >
                        <option value="+94">+94 LK</option>
                        <option value="+1">+1 US</option>
                        <option value="+44">+44 UK</option>
                        <option value="+66">+66 TH</option>
                        <option value="+91">+91 IN</option>
                        <option value="+61">+61 AU</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          id="login-phone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="77 123 4567"
                          className="w-full bg-[#0E0E10] text-sm text-white rounded-xl pl-10 pr-4 py-3 border border-zinc-800 focus:border-[#F5C518] focus:outline-none font-mono tabular-nums"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1.5">
                      We will generate a 6-digit verification code for instant verification.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-otp"
                        className="block text-xs font-semibold text-zinc-300"
                      >
                        Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                        }}
                        className="text-xs text-[#F5C518] hover:underline font-semibold cursor-pointer"
                      >
                        Change number
                      </button>
                    </div>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                      <input
                        id="login-otp"
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="6-digit OTP"
                        className="w-full bg-[#0E0E10] text-sm text-white tracking-widest font-mono font-bold rounded-xl pl-10 pr-4 py-3 border border-zinc-800 focus:border-[#F5C518] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-mono">
                        Sent to {countryCode} {phoneNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[#F5C518] hover:underline font-semibold cursor-pointer"
                      >
                        Resend SMS
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[46px] py-3 rounded-xl bg-zinc-100 hover:bg-white text-black font-bold text-sm transition active:scale-[0.99] cursor-pointer"
                >
                  {otpSent ? "Verify & Sign In" : "Send Verification Code"}
                </button>
              </form>
            )}

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-zinc-800" />
              <span className="mx-3 text-xs text-zinc-500 font-medium">or continue with</span>
              <div className="flex-grow border-t border-zinc-800" />
            </div>

            <button
              type="button"
              onClick={() => onLogin("Kasun (Google)", "google")}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#222228] hover:bg-zinc-800 text-zinc-100 font-semibold text-xs border border-zinc-700/80 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#F5C518]" />
              <span>Sign in with Google & Location</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-zinc-500 mt-6">
            Approximate proximity is stored locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
