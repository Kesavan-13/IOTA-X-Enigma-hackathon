import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, LoaderCircle, ShieldAlert } from 'lucide-react';
import { DEMO_ACCOUNTS, DemoUser } from '../lib/mockData';
import { gatewayStore } from '../lib/store';

export function ProtectedAppLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'step_up' | 'recovery'>('credentials');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const policy = gatewayStore.getPolicy();

  const handleFillDemo = (acc: DemoUser) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setRecoveryKey(acc.recovery_key);
    setErrorMessage('');
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Simulate real network / gateway pacing
      await new Promise((r) => setTimeout(r, 400));

      const res = gatewayStore.authenticate({
        publicId: sessionToken ? sessionToken.replace('token_', '') : undefined,
        identifier: email,
        password,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'WebClient',
      });

      setSessionToken(res.token);

      if (res.status === 'allow' || res.status === 'decoy') {
        navigate(`/protected-app/workspace?token=${res.token}`);
      } else if (res.status === 'step_up') {
        setStep('step_up');
      } else {
        setErrorMessage(
          res.message || 'We could not sign you in. Check your details and try again.'
        );
      }
    } catch {
      setErrorMessage('We could not sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await new Promise((r) => setTimeout(r, 350));
      const res = gatewayStore.completeStepUp(sessionToken || '', code);
      if (res.status === 'allow') {
        navigate(`/protected-app/workspace?token=${res.token}`);
      } else {
        setErrorMessage(res.message || 'That code was not accepted.');
      }
    } catch {
      setErrorMessage('That code was not accepted.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await new Promise((r) => setTimeout(r, 350));
      const res = gatewayStore.completeRecovery(sessionToken || '', recoveryKey);
      if (res.status === 'allow') {
        navigate(`/protected-app/workspace?token=${res.token}`);
      } else {
        setErrorMessage(res.message || 'Recovery key was not accepted.');
      }
    } catch {
      setErrorMessage('Recovery key was not accepted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background subtle radial gradient to match console layout */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(65%_60%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Banner */}
        <div className="border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to console</span>
            </Link>
            <p className="label-mono">Bundled sample application</p>
          </div>
        </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_420px] lg:gap-16 lg:py-16">
        {/* Left Column: Organization & Demo Accounts */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
              <span className="text-[13px] font-semibold text-primary">M</span>
            </span>
            <div>
              <p className="text-[14px] font-semibold tracking-tight">
                Meridian Freight Cooperative
              </p>
              <p className="label-mono">Carrier settlement portal</p>
            </div>
          </div>

          <h1 className="mt-8 max-w-md text-[30px] font-semibold leading-[1.1] tracking-tight">
            Sign in to the settlement workspace
          </h1>
          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            This portal is synthetic and local to this deployment. It exists to exercise the gateway end to end: every attempt flows through the same rate limits, risk pipeline and routing that a real protected application would use.
          </p>

          <div className="mt-8 space-y-3 max-w-md">
            <p className="label-mono">Demonstration accounts</p>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleFillDemo(acc)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-card"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium leading-tight text-foreground">
                    {acc.name}
                  </p>
                  <p className="label-mono mt-0.5">{acc.role}</p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {acc.password}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Login Form */}
        <div className="order-1 lg:order-2">
          <div className="panel p-6 shadow-xl">
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <h2 className="text-[16px] font-semibold tracking-tight">Sign in</h2>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    Enter your organization credentials.
                  </p>
                </div>

                {errorMessage ? (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[12px] text-red-300">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                ) : null}

                <div>
                  <label className="label-mono block mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@meridianfreight.example"
                    className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="label-mono block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[12.5px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <div className="border-t border-border/70 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="label-mono">Gateway policy: {policy.mode}</span>
                  <span className="font-mono text-[10px]">{policy.policy_version}</span>
                </div>
              </form>
            )}

            {step === 'step_up' && (
              <form onSubmit={handleStepUpSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-300">
                    <ShieldAlert className="h-4 w-4" />
                    <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                      Verification required
                    </h2>
                  </div>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    A step-up verification factor is required for this login attempt.
                  </p>
                </div>

                {errorMessage ? (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[12px] text-red-300">
                    {errorMessage}
                  </div>
                ) : null}

                <div>
                  <label className="label-mono block mb-1">
                    One-time code (demo: <span className="font-mono text-primary font-bold">482910</span>)
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit verification code"
                    className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 font-mono text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[12.5px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Verify and continue</span>
                  )}
                </button>

                <div className="pt-2 flex justify-between items-center text-[11.5px]">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('recovery');
                      setErrorMessage('');
                    }}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <KeyRound className="h-3 w-3" />
                    <span>Use recovery key instead</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setErrorMessage('');
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {step === 'recovery' && (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-teal-300">
                    <KeyRound className="h-4 w-4" />
                    <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                      Account recovery
                    </h2>
                  </div>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    Enter your organization recovery key to bypass the step-up challenge.
                  </p>
                </div>

                {errorMessage ? (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[12px] text-red-300">
                    {errorMessage}
                  </div>
                ) : null}

                <div>
                  <label className="label-mono block mb-1">Emergency recovery key</label>
                  <input
                    type="text"
                    required
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                    placeholder="REC-XXX-XXXX-XXX"
                    className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 font-mono text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[12.5px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Recover session</span>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('step_up');
                      setErrorMessage('');
                    }}
                    className="text-[11.5px] text-muted-foreground hover:text-foreground"
                  >
                    Back to code verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
