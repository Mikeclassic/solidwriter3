"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PenTool, Zap, Target, FileText } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-solid-slate flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-solid-slate">
      {/* Header */}
      <header className="border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PenTool className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-white">SolidWriter</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signin"
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Write Like <span className="text-accent">You</span>
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
          SolidWriter uses advanced AI to learn your unique writing style and generate 
          long-form content that sounds authentically yours. Create compelling articles, 
          blog posts, and marketing copy that maintains your voice.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="bg-accent text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            Start Writing
          </Link>
          <button className="border border-slate-600 text-slate-300 px-8 py-3 rounded-lg text-lg font-semibold hover:border-accent hover:text-accent transition-colors">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Powerful Features for Professional Writers
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <Zap className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Voice Mimicking AI
            </h3>
            <p className="text-slate-300">
              Upload your writing samples and our AI learns your style, tone, and voice 
              to create content that sounds authentically yours.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <Target className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              SEO Optimization
            </h3>
            <p className="text-slate-300">
              Built-in SEO scoring and keyword density analysis ensures your content 
              ranks well while maintaining readability.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <FileText className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Long-Form Content
            </h3>
            <p className="text-slate-300">
              Generate comprehensive articles, blog posts, and marketing copy with 
              proper structure and logical flow.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-slate-800/50">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Upload Writing Samples
            </h3>
            <p className="text-slate-300">
              Provide 3-5 examples of your writing to teach the AI your unique style.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Set Your Topic & Goals
            </h3>
            <p className="text-slate-300">
              Choose your topic, target audience, tone, and any specific requirements.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Generate & Refine
            </h3>
            <p className="text-slate-300">
              Watch as AI creates content in your voice, then refine and edit as needed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to Transform Your Writing?
        </h2>
        <p className="text-xl text-slate-300 mb-8">
          Join thousands of writers who trust SolidWriter to create authentic, 
          engaging content that resonates with their audience.
        </p>
        <Link
          href="/auth/signin"
          className="bg-accent text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-accent/90 transition-colors inline-block"
        >
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <PenTool className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold text-white">SolidWriter</span>
            </div>
            <div className="flex space-x-6 text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700 text-center text-slate-400">
            <p>&copy; 2025 SolidWriter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
