import React from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import {
  BookOpen,
  Users,
  Zap,
  Heart,
  ArrowRight,
  Sparkles, 
  Star, 
} from "lucide-react";

interface WelcomePageProps {
  onGetStarted: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-gray-900 bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Floating decorative blobs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-40 animate-pulse" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md shadow-sm border-b border-white/30"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            Learnito
          </h1>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-blue-100"
          >
            Sign In
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="flex flex-grow items-center justify-center px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-800">
              Discover the Joy of{" "}
              <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Learning
              </span>{" "}
              with Learnito
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Learnito isn’t just a platform  it’s your friendly study
              companion. Explore new skills, connect with inspiring learners,
              and grow at your own pace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              onClick={onGetStarted}
              className="sm:w-auto px-8 py-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 font-bold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-200 flex items-center justify-center gap-2"
            >
              <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Get Started
              </span>
              <ArrowRight size={18} className="text-blue-600" />
            </button>
            <button
              className="sm:w-auto px-8 py-4 bg-white/80 text-blue-700 font-semibold border-2 border-blue-200 hover:bg-white hover:shadow-lg hover:scale-105 rounded-full transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="px-4 py-20 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 inline-flex items-center">
            Why You’ll Love Learnito
            <Sparkles className="ml-2 w-8 h-8 text-pink-500" />
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">
            We designed Learnito to make learning not just productive — but
            fun, personal, and full of heart.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Comprehensive Courses",
                description:
                  "From coding to creativity, explore curated lessons built by passionate mentors around the globe.",
              },
              {
                icon: Users,
                title: "Supportive Community",
                description:
                  "Find study buddies, share milestones, and celebrate wins together. No one learns alone here.",
              },
              {
                icon: Zap,
                title: "Learn at Your Pace",
                description:
                  "Progress through lessons in your own rhythm — whether it’s midnight motivation or morning coffee.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-100 p-8 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-left"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={26} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-r from-blue-600 to-pink-600 rounded-3xl p-12 text-white shadow-lg">
          <h3 className="text-3xl md:text-4xl font-bold inline-flex items-center">
            <Star className="mr-3 w-8 h-8 opacity-90" />
            Start Learning, Start Growing!
          </h3>
          <p className="text-lg text-blue-100 max-w-xl mx-auto">
            Empower your curiosity. Unlock your future. Learnito is your cozy
            corner of the internet to grow with love and logic.
          </p>
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-10 py-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mx-auto border-2 border-white/20"
          >
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Join Learnito Now
            </span>
            <ArrowRight size={18} className="text-pink-600" />
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800"
      >
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Learnito
          </h2>
          <p className="text-sm">
            Crafted with{" "}
            <Heart className="inline-block text-pink-400" size={14} /> by
            curious minds. © {new Date().getFullYear()} Learnito. All rights
            reserved.
          </p>
          <div className="flex gap-6 justify-center text-sm">
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};