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

interface ChatModalProps {
    swapId: string;
    currentUserId: string;
    otherUserName: string;
}

export function ChatModal({ swapId, currentUserId, otherUserName }: ChatModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const data = await getSwapMessages(swapId);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
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
                    <MessageSquare className="w-4 h-4" />
                    Chat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Chat with {otherUserName}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4 border rounded-md p-4 bg-muted/30">
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderId === currentUserId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <Avatar className="w-8 h-8 border">
                                            <AvatarFallback className={isMe ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                                {msg.sender.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 text-sm ${isMe
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-white dark:bg-gray-800 border shadow-sm"
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <span className={`text-[10px] block mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={loading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={loading || !newMessage.trim()} size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
