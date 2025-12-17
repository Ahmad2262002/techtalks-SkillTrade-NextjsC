"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { getSwapMessages, sendMessage } from "@/actions/messages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    sender: {
        name: string;
    };
}

export function ChatModal({ swapId, currentUserId, otherUserName }: { swapId: string, currentUserId: string, otherUserName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const data = await getSwapMessages(swapId);
            setMessages(data as unknown as Message[]);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, swapId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await sendMessage({ swapId, content: newMessage });
            setNewMessage("");
            await fetchMessages();
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" /> Chat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chat with {otherUserName}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === currentUserId;
                            return (
                                <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                    <Avatar className="w-6 h-6">
                                        <AvatarFallback className="text-xs">{msg.sender.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={`rounded-lg p-2 text-sm max-w-[80%] ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." disabled={loading} />
                    <Button type="submit" size="icon" disabled={loading}><Send className="w-4 h-4" /></Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}