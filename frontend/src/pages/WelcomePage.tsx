import React from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import {
  BookOpen,
  Bookmark,
  Users,
  Zap,
  Heart,
  ArrowRight,
  Sparkles,
  Star,
  Globe,
  Shield,
  Mail,
} from "lucide-react";

interface WelcomePageProps {
  onGetStarted: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-gray-900 bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-20"
        />
      </div>

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/30"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Learnito
            </h1>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
          >
            Sign In
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <div className="flex flex-grow items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">
              Join 10,000+ passionate learners
            </span>
          </motion.div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Discover the{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Joy
              </span>{" "}
              of Learning
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Learnito isn't just a platform—it's your friendly study companion. 
              Explore new skills, connect with inspiring learners, and grow at your own pace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              Start Learning Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-gray-700 font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg rounded-full transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-8"
          >
            <p className="text-gray-500 text-sm mb-4">Trusted by learners from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["Google", "Microsoft", "Stanford", "MIT", "NASA"].map((company, index) => (
                <div key={index} className="text-gray-400 font-semibold text-sm">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="px-4 py-24 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why You'll Love{" "}
              <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Learnito
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed to make learning not just productive—but fun, personal, and full of heart.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bookmark,
                title: "Separate your Bookmarks",
                description: "stay organized with dedicated spaces for your learning materials, making it easy to find and revisit them anytime.",
                color: "blue",
              },
              {
                icon: Users,
                title: "Supportive Community",
                description: "Find study buddies, share milestones, and celebrate wins together. No one learns alone here.",
                color: "green",
              },
              {
                icon: Zap,
                title: "Learn at Your Pace",
                description: "Progress through lessons in your own rhythm—whether it's midnight motivation or morning coffee.",
                color: "purple",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              const colorMap = {
                blue: "from-blue-500 to-blue-600",
                green: "from-green-500 to-green-600",
                purple: "from-purple-500 to-purple-600",
              };
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-300" />
                  <div className="relative rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                    <div className={`w-14 h-14 bg-gradient-to-r ${colorMap[feature.color as keyof typeof colorMap]} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                      <Icon className="text-white" size={26} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="py-16 bg-gradient-to-r from-blue-600 to-pink-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Learners" },
              { number: "500+", label: "Expert Courses" },
              { number: "50+", label: "Countries" },
              { number: "98%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="text-3xl md:text-4xl font-bold">{stat.number}</div>
                <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-pink-600" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative px-8 py-12 md:p-16 text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 opacity-20"
              >
                <Star className="w-8 h-8 text-yellow-300" />
              </motion.div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Start Your Learning Journey Today!
              </h3>
              <p className="text-xl text-blue-100 max-w-xl mx-auto">
                Join thousands of learners transforming their skills and careers with Learnito.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-10 py-4 bg-white text-gray-900 font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto group hover:bg-gray-50"
              >
                Get Started for Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <p className="text-blue-200 text-sm">
                No credit card required • Free forever plan
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-white">Learnito</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making learning accessible, enjoyable, and effective for everyone, everywhere.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Courses", "Features", "Pricing", "Testimonials"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Blog", "Press"],
              },
              {
                title: "Support",
                links: ["Help Center", "Contact", "Privacy", "Terms"],
              },
            ].map((section, index) => (
              <div key={index} className="space-y-4">
                <h4 className="text-white font-semibold">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm flex items-center gap-1">
              Crafted with <Heart className="text-pink-400 w-4 h-4" /> by curious minds. 
              © {new Date().getFullYear()} Learnito. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Shield className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

// Add the missing Play icon component
const Play: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);