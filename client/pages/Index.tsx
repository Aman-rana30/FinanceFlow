import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Star, ShieldCheck, Send, TrendingUp, Target, PieChart, Smartphone, Users, Award, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Smart Analytics",
      description: "Get detailed insights into your spending patterns with AI-powered analytics and personalized recommendations."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal Tracking",
      description: "Set and achieve your financial goals with milestone tracking and automated savings suggestions."
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Budget Management",
      description: "Create custom budgets by category and get real-time alerts when you're approaching limits."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile First",
      description: "Access your finances anywhere with our responsive design and progressive web app features."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Bank-Level Security",
      description: "Your data is protected with 256-bit encryption and multi-factor authentication."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Family Sharing",
      description: "Share budgets and track expenses with family members while maintaining privacy controls."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      avatar: "/placeholder.svg",
      rating: 5,
      quote: "FinanceFlow transformed how I manage my finances. I've saved 30% more since I started using it!"
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner",
      avatar: "/placeholder.svg", 
      rating: 5,
      quote: "The AI insights are incredible. It predicted my overspending before I even realized it myself."
    },
    {
      name: "Anita Patel",
      role: "Marketing Manager",
      avatar: "/placeholder.svg",
      rating: 5,
      quote: "Finally, a finance app that doesn't feel overwhelming. The interface is beautiful and intuitive."
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_10%_-20%,rgba(79,70,229,0.2),transparent),radial-gradient(800px_500px_at_90%_10%,rgba(147,51,234,0.2),transparent)]">
      {/* Enhanced Hero Section */}
      <section className="container py-12 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-3 gap-6 mb-8 text-purple-primary">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-2xl font-extrabold">15K+</div>
                <div className="text-xs text-muted-foreground">ACTIVE USERS</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-2xl font-extrabold">500+</div>
                <div className="text-xs text-muted-foreground">COMPANIES TRUST US</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-2xl font-extrabold">₹2.5B+</div>
                <div className="text-xs text-muted-foreground">MANAGED</div>
              </motion.div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-500 to-purple-700 bg-clip-text text-transparent">
              Your AI-Powered<br/>Financial Coach
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Transform your financial future with intelligent insights, automated savings, and personalized recommendations. 
              Every decision matters—let AI guide you to prosperity.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="px-8 py-3 bg-gradient-to-r from-purple-primary to-purple-secondary hover:from-purple-primary/90 hover:to-purple-secondary/90 transition-all duration-300"
                onClick={() => navigate("/auth")}
              >
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 border-purple-primary/40 hover:bg-purple-primary/15 text-purple-primary"
                onClick={() => navigate("/dashboard")}
              >
                View Demo
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid gap-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {[
              { icon: Star, title: "Smart Rewards", desc: "Earn points and cashback on every transaction with our intelligent reward system." },
              { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Your data is protected with military-grade encryption and biometric authentication." },
              { icon: Send, title: "Instant Transfers", desc: "Send money instantly to friends and family with zero fees and real-time notifications." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="p-2 rounded-lg bg-purple-primary/20">
                  <item.icon className="w-5 h-5 text-purple-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{item.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Everything You Need to <span className="text-purple-primary">Succeed</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you take control of your finances and build lasting wealth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-primary/20 to-purple-secondary/20 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="text-purple-primary">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Loved by <span className="text-purple-secondary">Thousands</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their financial transformation journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-purple-accent text-purple-accent" />
                ))}
              </div>
              
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-purple-primary/30" />
                <p className="text-muted-foreground italic pl-4">"{testimonial.quote}"</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="bg-purple-primary/20 text-purple-primary">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl p-12 md:p-16"
        >
          <Award className="w-16 h-16 text-purple-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to Transform Your <span className="text-purple-primary">Financial Future?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users who have already taken control of their finances. 
            Start your journey today and see the difference AI-powered insights can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-3 bg-gradient-to-r from-purple-primary to-purple-secondary hover:from-purple-primary/90 hover:to-purple-secondary/90 transition-all duration-300"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 border-purple-primary/40 hover:bg-purple-primary/15 text-purple-primary"
              onClick={() => navigate("/dashboard")}
            >
              Explore Features
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
