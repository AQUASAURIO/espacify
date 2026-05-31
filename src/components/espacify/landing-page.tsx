'use client';

import { useNavigation, useAuth } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutGrid,
  PenTool,
  BarChart3,
  FileText,
  Shield,
  Smartphone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = [
  { icon: LayoutGrid, title: 'Space Planning', desc: 'Organize rooms and spaces with drag-and-drop simplicity.' },
  { icon: PenTool, title: 'Design Suggestions', desc: 'Get intelligent design recommendations based on your taste.' },
  { icon: BarChart3, title: 'Budget Tracking', desc: 'Stay on budget with real-time cost estimations.' },
  { icon: FileText, title: 'Documentation', desc: 'Auto-generate project specs, SRS, and architecture docs.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption and role-based access control.' },
  { icon: Smartphone, title: 'Mobile Ready', desc: 'Works on any device — web, tablet, and native apps.' },
];

export function LandingPage() {
  const { navigate } = useNavigation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Espacify" width={32} height={32} className="rounded-md" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Espacify
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate('dashboard')} className="gap-2">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('register')} className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-36">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Powered by MIMSAR</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Transform Your Spaces{' '}
                <span className="text-primary">Intelligently</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Organize spaces with smart design suggestions tailored to your taste and budget.
                From concept to completion — all in one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('register')} className="gap-2 text-base px-8 py-6">
                  Start for Free <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('login')} className="text-base px-8 py-6">
                  Sign In
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Everything you need to design spaces
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A comprehensive toolkit for space planning, design documentation, and project management.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow bg-background">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Espacify" width={20} height={20} className="rounded" />
            </div>
            <span>&copy; {new Date().getFullYear()} MIMSAR. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Confidential</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
