"use client";

import React from 'react';
import { Mail, MessageSquare, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function Contact() {
    return (
        <section id="contact" className="py-32 px-6 bg-background relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
                            Need Help <br />
                            <span className="text-primary">Getting Started?</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium mb-12 max-w-md leading-relaxed">
                            Our support team is here to help you navigate the swap ecosystem. Ask us anything about guidelines, security, or platform features.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-xs mb-1">Direct Support</h4>
                                    <p className="text-lg font-bold">support@skillswap.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-xs mb-1">Community Discord</h4>
                                    <p className="text-lg font-bold">Join 10k+ Members</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-1 pr-1 pb-1 rounded-[3.5rem] bg-gradient-to-br from-primary/20 via-border to-purple-500/20 shadow-2xl">
                        <div className="bg-card rounded-[3.2rem] p-10 md:p-14">
                            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                        <Input placeholder="John Doe" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary font-bold px-6" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                        <Input type="email" placeholder="john@example.com" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary font-bold px-6" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Message</label>
                                    <Textarea placeholder="How can we help you?" className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary font-medium p-6" />
                                </div>

                                <Button className="w-full h-16 rounded-2xl text-lg font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 group">
                                    Send Message
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <div className="flex items-center justify-center gap-2 pt-4 opacity-50">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Average Response: 12 Hours</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
