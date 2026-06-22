"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe, Sparkles } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { getSiteSettings } from "@/actions/settings.actions";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Discover Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
  { href: process.env.NEXT_PUBLIC_QUIZ_ARENA_URL || "https://festoryx-quiz.vercel.app", label: "Quiz Arena", isExternal: true },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/Logo.png");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Fetch dynamic logo
    getSiteSettings().then((settings) => {
      if (settings?.headerLogoUrl) {
        setLogoUrl(settings.headerLogoUrl);
      } else if (settings?.logoUrl) {
        setLogoUrl(settings.logoUrl);
      }
    }).catch((err) => {
      console.error("Error loading header logo:", err);
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-6 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 px-4 transition-all duration-300">
        <header
          className={`rounded-[999px] border border-white/5 bg-[#060317]/80 px-6 py-2 flex items-center justify-between shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] backdrop-blur-md transition-all duration-300 ${
            isScrolled ? "py-2.5 bg-[#060317]/95 border-white/10" : ""
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full">
              <img
                src={logoUrl}
                alt="Festoryx Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-heading text-lg font-medium tracking-tight text-[#f4f0ff] transition-colors group-hover:text-[#9382ff]">
              Festoryx
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              if (link.isExternal) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-normal text-[#918ea0] hover:text-[#f4f0ff] transition-colors"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-normal text-[#918ea0] hover:text-[#f4f0ff] transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link
                href="/dashboard"
                className="hidden md:inline-flex h-9 items-center justify-center rounded-[5px] bg-[#9382ff] hover:bg-[#816eff] px-4 text-xs font-semibold text-white transition-all shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]"
              >
                Go to Dashboard
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 rounded-full border border-white/10",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-xs font-medium text-[#918ea0] hover:text-[#f4f0ff] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="hidden md:inline-flex h-9 items-center justify-center rounded-[5px] bg-[#9382ff] hover:bg-[#816eff] px-4 text-xs font-semibold text-white transition-all shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]"
              >
                Sign Up
              </Link>
            </SignedOut>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-[5px] p-1.5 text-[#918ea0] hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#060317] border-l border-white/5 shadow-2xl transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-6 pt-24">
          <div className="flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 rounded-[5px] p-2 text-[#918ea0] hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>

            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-[5px] px-3 py-2 text-base font-normal text-[#918ea0] hover:bg-white/5 hover:text-white transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="h-px bg-white/5 my-2"></div>

            <SignedOut>
              <Link
                href="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center h-10 w-full rounded-[5px] border border-white/10 text-sm font-medium text-[#f4f0ff] hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center h-10 w-full rounded-[5px] bg-[#9382ff] text-sm font-semibold text-white hover:bg-[#816eff]"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center h-10 w-full rounded-[5px] bg-[#9382ff] text-sm font-semibold text-white hover:bg-[#816eff]"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>

          <div className="text-center text-[10px] text-[#54525f] uppercase tracking-wider">
            Festoryx Competition OS
          </div>
        </div>
      </div>
    </>
  );
}
